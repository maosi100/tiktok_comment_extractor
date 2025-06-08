// background.js

// --- Global variable to store the last captured TikTok API URL ---
let lastTikTokCommentApiUrl = null;

// --- WebRequest Listener: Intercept and store TikTok API calls ---
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Check if the URL matches the TikTok comment list API
    if (details.url.includes("tiktok.com/api/comment/list")) {
      console.log("Background: Intercepted TikTok comment API URL:", details.url);
      lastTikTokCommentApiUrl = details.url;

      // Optional: Store in chrome.storage.local for persistence across browser sessions
      // chrome.storage.local.set({ lastTikTokCommentApiUrl: details.url }).then(() => {
      //   console.log("Background: URL saved to storage.");
      // });
    }
  },
  { urls: ["*://*.tiktok.com/api/comment/list/*"] }, // Listen to this specific URL pattern
  [] // No extraInfoSpec needed for just reading the URL
);

// --- Message Listener for Popup and Content Script ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background: Received message:", message);

  if (message.type === "POPUP_STATUS_REQUEST") {
    sendResponse({
      status: "Background is ready!",
      userLoggedIn: false,
      lastUrlAvailable: lastTikTokCommentApiUrl !== null
    });
    return true;
  } else if (message.type === "GET_TIKTOK_API_URL") {
    // Respond with the last captured URL
    if (lastTikTokCommentApiUrl) {
      sendResponse({ apiUrl: lastTikTokCommentApiUrl, success: true });
    } else {
      sendResponse({ apiUrl: null, success: false, message: "No TikTok comment API URL captured yet. Please open a TikTok video and scroll." });
    }
    return true;
  }
});

// Optional: On extension startup, try to load from storage
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.get("lastTikTokCommentApiUrl").then((data) => {
//     if (data.lastTikTokCommentApiUrl) {
//       lastTikTokCommentApiUrl = data.lastTikTokCommentApiUrl;
//       console.log("Background: Loaded last URL from storage:", lastTikTokCommentApiUrl);
//     }
//   });
// });
