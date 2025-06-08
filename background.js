// background.js

// --- Message Listener for Popup and Content Script ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background: Received message:", message);

  if (message.type === "POPUP_STATUS_REQUEST") {
    // Example: Send some dummy status back to the popup
    sendResponse({ status: "Background is ready!", userLoggedIn: false });
    return true; // Indicates an asynchronous response
  } else if (message.type === "GET_TIKTOK_API_URL") {
    // For now, let's just send a dummy URL. This will be updated in Phase 1.1.
    const dummyUrl = "https://www.tiktok.com/api/comment/list/?aweme_id=DUMMY_ID&count=20&cursor=0";
    sendResponse({ apiUrl: dummyUrl });
    return true; // Indicates an asynchronous response
  }
});

