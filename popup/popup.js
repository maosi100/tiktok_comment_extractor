// popup/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const statusDisplay = document.getElementById('status-display');

  if (statusDisplay) {
    statusDisplay.textContent = "Requesting status...";
  }

  chrome.runtime.sendMessage({ type: "POPUP_STATUS_REQUEST" }, (response) => {
    // Check for runtime.lastError is crucial for message reliability
    if (chrome.runtime.lastError) {
      console.error("Popup: Error sending message:", chrome.runtime.lastError);
      if (statusDisplay) {
        statusDisplay.textContent = "Error: Could not connect to background. Is the extension enabled?";
      }
      return;
    }
    console.log("Popup: Received response:", response);
    if (statusDisplay) {
      statusDisplay.textContent = response.status + " (User logged in: " + response.userLoggedIn + ")";
    }
  });
});
