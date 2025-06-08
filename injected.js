// injected.js

console.log("Injected Script: Loaded into page context.");

// --- Listener for messages FROM contentScript.js ---
window.addEventListener('FROM_CONTENTSCRIPT_TO_INJECTED', (event) => {
  const data = event.detail;
  console.log("Injected Script: Received data from content script:", data);

  // This is where the actual API call logic will go in Phase 1.3.
  // For now, it just sends a dummy response back to confirm communication.
  const responseToContent = {
    message: "Hello from injected.js! I received the real TikTok URL!",
    receivedUrl: data.url, // Pass the received URL back
    requestId: data.requestId
  };
  const responseEvent = new CustomEvent('FROM_INJECTED_TO_CONTENTSCRIPT', { detail: responseToContent });
  window.dispatchEvent(responseEvent);

  console.log("Injected Script: Sent response to content script.");
});
