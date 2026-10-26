// Increment adultBlockedCount when blocked page is displayed
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['adultBlockedCount'], (res) => {
    const current = (res.adultBlockedCount || 0) + 1;
    chrome.storage.local.set({ adultBlockedCount: current });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'https://ashrafulanamalve.github.io/AL-QURAN-WEB/';
      }
    });
  }
});
