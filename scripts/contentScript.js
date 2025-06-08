// scripts/contentScript.js

console.log("Content Script: Loaded.");

// --- UI Injection for Testing ---
const exportButton = document.createElement('button');
exportButton.textContent = "Export Comments (Prototype)";
exportButton.id = "tiktok-export-button";
exportButton.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px 15px; background-color: #fe2c55; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;";
document.body.appendChild(exportButton);

exportButton.addEventListener('click', () => {
  console.log("Content Script: Export button clicked.");

  // Request the REAL API URL from the background script
  chrome.runtime.sendMessage({ type: "GET_TIKTOK_API_URL" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Content Script: Error sending message to background:", chrome.runtime.lastError);
      alert("Error: Could not connect to extension background. Is the extension enabled?");
      return;
    }

    if (!response.success || !response.apiUrl) {
      alert(response.message || "Could not get TikTok API URL. Please open a TikTok video and scroll down to load comments, then try again.");
      console.warn("Content Script:", response.message || "No API URL available.");
      return;
    }

    const fullApiUrl = response.apiUrl;
    // In Phase 1.3, we'll implement the actual URL stripping here.
    // For now, injected.js will receive the full URL.
    const dataToInject = { url: fullApiUrl, requestId: "tiktok_comments_export_" + Date.now() };

    console.log("Content Script: Dispatching event to injected.js with data:", dataToInject);
    const event = new CustomEvent('FROM_CONTENTSCRIPT_TO_INJECTED', { detail: dataToInject });
    window.dispatchEvent(event);
  });
});

// --- Listener for messages FROM injected.js ---
window.addEventListener('FROM_INJECTED_TO_CONTENTSCRIPT', (event) => {
  const data = event.detail;
  console.log("Content Script: Received data from injected.js:", data);
  alert("Injected.js says: " + data.message + "\nReceived URL: " + data.receivedUrl + "\nRequest ID: " + data.requestId);
  // This is where you'd process the extracted comments in later phases.
});

// --- Inject injected.js into the page's context ---
try {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    console.log("Content Script: injected.js loaded successfully.");
    this.remove();
  };
  script.onerror = function(e) {
    console.error("Content Script: Failed to load injected.js", e);
    alert("Error: Failed to inject core script. Check console.");
  };
  (document.head || document.documentElement).appendChild(script);
} catch (e) {
  console.error("Content Script: Error during injected.js injection:", e);
  alert("Error injecting script for extraction.");
}
