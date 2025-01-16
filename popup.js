// Get DOM elements
const enabledToggle = document.getElementById('enabled');
const targetLanguageSelect = document.getElementById('targetLanguage');
const translateOnCtrlToggle = document.getElementById('translateOnCtrl');
const showOriginalTextToggle = document.getElementById('showOriginalText');
const fontSizeSelect = document.getElementById('fontSize');
const tooltipThemeSelect = document.getElementById('tooltipTheme');

// Load settings
function loadSettings() {
    chrome.storage.sync.get(null, (items) => {
        enabledToggle.checked = items.enabled;
        targetLanguageSelect.value = items.targetLanguage;
        translateOnCtrlToggle.checked = items.translateOnCtrl;
        showOriginalTextToggle.checked = items.showOriginalText;
        fontSizeSelect.value = items.fontSize;
        tooltipThemeSelect.value = items.tooltipTheme;
    });
}

// Save settings
function saveSettings() {
    const settings = {
        enabled: enabledToggle.checked,
        targetLanguage: targetLanguageSelect.value,
        translateOnCtrl: translateOnCtrlToggle.checked,
        showOriginalText: showOriginalTextToggle.checked,
        fontSize: fontSizeSelect.value,
        tooltipTheme: tooltipThemeSelect.value
    };
    
    chrome.storage.sync.set(settings);
}

// Add event listeners
enabledToggle.addEventListener('change', saveSettings);
targetLanguageSelect.addEventListener('change', saveSettings);
translateOnCtrlToggle.addEventListener('change', saveSettings);
showOriginalTextToggle.addEventListener('change', saveSettings);
fontSizeSelect.addEventListener('change', saveSettings);
tooltipThemeSelect.addEventListener('change', saveSettings);

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', loadSettings); 