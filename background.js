// Default settings
const defaultSettings = {
    targetLanguage: 'tr',
    sourceLanguage: 'auto',
    enabled: true,
    translateOnClick: false,
    translateOnCtrl: true,
    showOriginalText: true,
    tooltipPosition: 'cursor',
    tooltipTheme: 'light',
    fontSize: '14px'
};

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(null, (items) => {
        // Merge default settings with stored settings
        const settings = { ...defaultSettings, ...items };
        chrome.storage.sync.set(settings);
    });
    
    // Create context menu
    chrome.contextMenus.create({
        id: 'translateSelection',
        title: 'Translate Selection',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'translateSelection') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'translateSelection',
            text: info.selectionText
        });
    }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(null, (items) => {
            sendResponse(items);
        });
        return true;
    }
    
    if (request.action === 'updateSettings') {
        chrome.storage.sync.set(request.settings, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'toggleEnabled') {
        chrome.storage.sync.get('enabled', (items) => {
            const newState = !items.enabled;
            chrome.storage.sync.set({ enabled: newState }, () => {
                sendResponse({ enabled: newState });
            });
        });
        return true;
    }
}); 