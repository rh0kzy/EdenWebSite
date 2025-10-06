/**
 * Auto-generated cache manifest
 * Generated on: 2025-09-19T14:39:19.667Z
 */
window.CACHE_MANIFEST = {
  "styles.css": "d1335fb0",
  "js/errorMonitor.js": "ae86bcde",
  "script.js": "60baabaa",
  "js/offlineData.js": "6292a9d7",
  "js/fastImageLoader.js": "618bed8d",
  "js/apiClient.js": "f44ebf93",
  "perfume-detail.js": "985ac410"
};

/**
 * Helper function to get versioned URL
 */
window.getVersionedUrl = function(filePath, baseUrl = '') {
    const cacheBuster = window.CACHE_MANIFEST[filePath];
    if (!cacheBuster) return baseUrl + filePath;
    
    const separator = filePath.includes('?') ? '&' : '?';
    return baseUrl + filePath + separator + 'v=' + cacheBuster;
};
