// popup/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const statusDisplay = document.getElementById('status-display');

  if (statusDisplay) {
    statusDisplay.textContent = "Requesting status...";
  }

  chrome.runtime.sendMessage({ type: "POPUP_STATUS_REQUEST" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Popup: Error sending message:", chrome.runtime.lastError);
      if (statusDisplay) {
        statusDisplay.textContent = "Error: Could not connect to background. Is the extension enabled?";
      }
      return;
    }
    console.log("Popup: Received response:", response);
    if (statusDisplay) {
      let message = response.status + " (User logged in: " + response.userLoggedIn + ")";
      if (response.lastUrlAvailable) {
        message += " - A TikTok URL has been captured!";
      } else {
        message += " - Open a TikTok video and scroll to capture its comments API URL.";
      }
      statusDisplay.textContent = message;
    }
  });
});
