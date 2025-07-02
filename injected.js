// injected.js (New Simplified Version)

console.log("Injected Script: Loaded. Ready for direct fetch commands.");

// Store original fetch for our use
const originalFetch = window.fetch;

// This listener handles direct commands from the content script
window.addEventListener('FROM_CONTENTSCRIPT_TO_INJECTED', async (event) => {
  const { type, url, requestId } = event.detail;

  if (type === 'FETCH_COMMENTS_PAGE') {
    try {
      console.log("Injected Script: Received command to fetch:", url);
      const response = await originalFetch(url);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Send the successful result back to the content script
      sendMessageToContentScript('FETCH_RESULT', {
        success: true,
        data: data,
        requestId: requestId
      });

    } catch (error) {
      console.error("Injected Script: Error during fetch:", error);
      // Send the failure result back to the content script
      sendMessageToContentScript('FETCH_RESULT', {
        success: false,
        error: error.message || "An unknown error occurred",
        requestId: requestId
      });
    }
  }
});

// Helper to send messages back to the content script
function sendMessageToContentScript(type, payload) {
  const event = new CustomEvent('FROM_INJECTED_TO_CONTENTSCRIPT', {
    detail: { type, ...payload }
  });
  window.dispatchEvent(event);
}
