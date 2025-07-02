// scripts/contentScript.js (Upgraded for Replies - Typo Fixed)

console.log("Content Script: Loaded.");

// --- UI Injection for Testing ---
const exportButton = document.createElement('button');
exportButton.textContent = "Export Comments";
exportButton.id = "tiktok-export-button";
exportButton.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px 15px; background-color: #fe2c55; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;";
document.body.appendChild(exportButton);

const statusDiv = document.createElement('div');
statusDiv.id = "tiktok-export-status";
statusDiv.style.cssText = "position: fixed; bottom: 70px; right: 20px; z-index: 9999; padding: 10px; background-color: rgba(255, 255, 255, 0.9); border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: none; font-size: 12px; color: #333; min-width: 250px; text-align: center;";
document.body.appendChild(statusDiv);

// --- State Variables ---
let extractionActive = false;
let allCollectedComments = {};

function updateStatus(message, show = true) {
  statusDiv.innerHTML = message;
  statusDiv.style.display = show ? 'block' : 'none';
}

// --- Main Click Handler ---
exportButton.addEventListener('click', async () => {
  if (extractionActive) {
    console.log("Content Script: Extraction is already in progress.");
    return;
  }

  extractionActive = true;
  allCollectedComments = {};
  exportButton.disabled = true;
  exportButton.textContent = "Exporting...";
  updateStatus("Requesting API details from extension...");

  chrome.runtime.sendMessage({ type: "GET_TIKTOK_API_URL" }, (response) => {
    if (response && response.success) {
      console.log("Content Script: Received API URL:", response.apiUrl);

      const startingUrl = new URL(response.apiUrl);
      startingUrl.searchParams.set('cursor', '0');
      console.log("Content Script: Modified URL to start from cursor 0:", startingUrl.toString());

      startAutomaticExtraction(startingUrl.toString());

    } else {
      console.error("Content Script: Failed to get API URL.", response.message);
      updateStatus(`Error: ${response.message || "Could not get API URL."}`, true);
      resetState();
    }
  });
});

// --- Function to fetch all replies for a single comment (CORRECTED) ---
async function fetchAllRepliesForComment(apiUrlTemplate, videoId, parentCid) {
  console.log(`Fetching replies for parent comment: ${parentCid}`);
  let replyCursor = 0;
  let replyHasMore = true;
  let collectedReplies = [];
  const REPLY_REQUEST_DELAY_MS = 1500; // Be polite to the API

  // Create a new URL object and set the correct path for replies.
  const replyUrlTemplate = new URL(apiUrlTemplate);
  replyUrlTemplate.pathname = '/api/comment/list/reply/';

  while (replyHasMore && extractionActive) {
    // Use the corrected reply URL template
    const url = new URL(replyUrlTemplate);
    url.searchParams.set('comment_id', parentCid);
    // *** THIS IS THE LINE WITH THE FIX ***
    url.searchParams.set('item_id', videoId); // Often required by the reply API
    // ************************************
    url.searchParams.set('cursor', replyCursor);
    url.searchParams.set('count', '50'); // Fetch replies in batches of 50

    try {
      const response = await fetchPageViaInjected(url.toString());
      if (response.error || response.status_code !== 0) {
        console.error("Reply API Error:", response);
        break;
      }
      const repliesBatch = response.comments || [];
      replyHasMore = response.has_more || false;
      replyCursor = response.cursor || 0;

      repliesBatch.forEach(reply => {
        // We use the main `allCollectedComments` to avoid duplicates if API ever sends them
        if (!allCollectedComments[reply.cid]) {
          const extractedReply = extractCommentData(reply, parentCid);
          collectedReplies.push(extractedReply);
        }
      });

      if (replyHasMore) {
        await new Promise(resolve => setTimeout(resolve, REPLY_REQUEST_DELAY_MS));
      }
    } catch (error) {
      console.error(`Failed to fetch replies for ${parentCid}:`, error);
      replyHasMore = false;
    }
  }
  return collectedReplies;
}


// --- Main Extraction Logic (CORRECTED) ---
async function startAutomaticExtraction(apiUrlTemplate) {
  let cursor = 0;
  let hasMore = true;
  const videoId = new URLSearchParams(apiUrlTemplate.split('?')[1]).get('aweme_id');
  const MAX_COMMENTS = 10000;
  const REQUEST_DELAY_MS = 1000;

  while (hasMore && extractionActive && Object.keys(allCollectedComments).length < MAX_COMMENTS) {
    const url = new URL(apiUrlTemplate);
    url.searchParams.set('cursor', cursor);
    url.searchParams.set('count', '50');

    updateStatus(`Fetching comments... (Cursor: ${cursor})<br>Collected: ${Object.keys(allCollectedComments).length}`);

    try {
      const response = await fetchPageViaInjected(url.toString());
      if (response.error || response.status_code !== 0) {
        console.error("API Error Response:", response);
        updateStatus(`API Error: ${response.status_msg || response.error}. Stopping.`, true);
        break;
      }
      const commentsBatch = response.comments || [];
      hasMore = response.has_more || false;
      cursor = response.cursor || 0;

      const parentsToFetchRepliesFor = [];
      for (const comment of commentsBatch) {
        if (!allCollectedComments[comment.cid]) {
          allCollectedComments[comment.cid] = extractCommentData(comment);
          if (comment.reply_comment_total > 0) {
            parentsToFetchRepliesFor.push(comment);
          }
        }
      }
      updateStatus(`Processing batch...<br>Total comments collected: ${Object.keys(allCollectedComments).length}`);

      for (const parentComment of parentsToFetchRepliesFor) {
        if (!extractionActive || Object.keys(allCollectedComments).length >= MAX_COMMENTS) {
          hasMore = false;
          break;
        }
        updateStatus(`Fetching ${parentComment.reply_comment_total} replies...<br>Total Collected: ${Object.keys(allCollectedComments).length}`);

        const replies = await fetchAllRepliesForComment(apiUrlTemplate, videoId, parentComment.cid);

        replies.forEach(reply => {
          if (!allCollectedComments[reply.cid]) {
            allCollectedComments[reply.cid] = reply;
          }
        });
      }

      if (hasMore && extractionActive) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
      }
    } catch (error) {
      console.error("Content Script: Loop failed", error);
      updateStatus(`An error occurred: ${error.message}. Stopping.`, true);
      hasMore = false;
    }
  }
  console.log("Content Script: Extraction loop finished.");
  finalizeExport(videoId);
}


// --- Helper to communicate with injected.js ---
function fetchPageViaInjected(url) {
  return new Promise((resolve, reject) => {
    const requestId = "fetch_" + Date.now() + Math.random();
    const listener = (event) => {
      const response = event.detail;
      if (response.requestId === requestId) {
        window.removeEventListener('FROM_INJECTED_TO_CONTENTSCRIPT', listener);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      }
    };
    window.addEventListener('FROM_INJECTED_TO_CONTENTSCRIPT', listener);
    sendMessageToInjected('FETCH_COMMENTS_PAGE', { url, requestId });
  });
}

// --- Data Extraction Helper ---
function extractCommentData(comment, parent_cid = null) {
  return {
    cid: comment.cid,
    parent_cid: parent_cid,
    text: comment.text,
    digg_count: comment.digg_count,
    reply_comment_total: comment.reply_comment_total || 0,
    create_time: comment.create_time,
    type: parent_cid ? "reply" : "top_level_comment",
    user_unique_id: comment.user ? comment.user.unique_id : 'N/A',
    user_nickname: comment.user ? comment.user.nickname : 'N/A',
  };
}

// --- Finalize and Download ---
function finalizeExport(videoId) {
  const collectedArray = Object.values(allCollectedComments);
  collectedArray.sort((a, b) => a.create_time - b.create_time);

  const finalCommentsWithCounter = collectedArray.map((comment, index) => {
    // We remove create_time from the final export as it's just for sorting
    const { create_time, ...rest } = comment;
    return {
      number: index + 1,
      ...rest
    };
  });

  updateStatus(`Extraction Complete! Fetched ${finalCommentsWithCounter.length} comments. Preparing download...`, true);
  const filename = `tiktok_comments_${videoId}_${Date.now()}.json`;
  const blob = new Blob([JSON.stringify(finalCommentsWithCounter, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  setTimeout(() => {
    updateStatus('', false);
    resetState();
  }, 5000);
}

function resetState() {
  extractionActive = false;
  exportButton.disabled = false;
  exportButton.textContent = "Export Comments";
}

// --- Inject injected.js into the page's context ---
try {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
} catch (e) {
  console.error("Content Script: Error during injected.js injection:", e);
}

// Helper to send messages TO injected.js
function sendMessageToInjected(type, payload) {
  const dataToInject = { type, ...payload };
  const event = new CustomEvent('FROM_CONTENTSCRIPT_TO_INJECTED', { detail: dataToInject });
  window.dispatchEvent(event);
}
