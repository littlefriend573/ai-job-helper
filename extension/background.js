chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Job Helper Extension installed');
  
  chrome.storage.local.set({
    jdList: [],
    serverUrl: 'http://localhost:3000'
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureJD') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            const jdData = {
              title: document.querySelector('.job-name')?.textContent?.trim() || '',
              company: document.querySelector('.company-name')?.textContent?.trim() || '',
              url: window.location.href
            };
            return jdData;
          }
        }, (results) => {
          if (results && results[0] && results[0].result) {
            sendResponse(results[0].result);
          } else {
            sendResponse({ error: 'Failed to extract JD' });
          }
        });
      }
    });
    return true;
  }
});