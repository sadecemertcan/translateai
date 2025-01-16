// Translation tooltip functionality
let tooltip = null;
let isTranslating = false;
let lastTranslatedText = '';
let settings = {
    targetLanguage: 'tr',
    sourceLanguage: 'auto',
    enabled: true,
    translateOnClick: false,
    translateOnCtrl: true,
    showOriginalText: true,
    tooltipPosition: 'cursor',
    tooltipTheme: 'dark',
    fontSize: '12px'
};

// Initialize tooltip
function createTooltip() {
    const div = document.createElement('div');
    div.id = 'translation-tooltip';
    div.className = 'dark blur';
    div.style.cssText = `
        position: fixed;
        z-index: 999999;
        background: rgba(33, 33, 33, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: ${settings.fontSize};
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: none;
        pointer-events: none;
        transition: all 0.2s ease;
        color: rgba(255, 255, 255, 0.95);
    `;
    document.body.appendChild(div);
    return div;
}

// Position tooltip to follow cursor
function positionTooltip(x, y, tooltip) {
    const rect = tooltip.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    // Position relative to cursor
    let left = x + 20; // Offset from cursor
    let top = y + 20;
    
    if (left + rect.width > screenW) {
        left = x - rect.width - 10;
    }
    
    if (top + rect.height > screenH) {
        top = y - rect.height - 10;
    }
    
    tooltip.style.left = Math.max(0, left) + 'px';
    tooltip.style.top = Math.max(0, top) + 'px';
}

// Get paragraph text under cursor
function getTextUnderCursor(e) {
    let element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return '';
    
    // Get text content
    let text = '';
    if (e.ctrlKey) {
        // Find the closest paragraph or text container
        const textContainer = element.closest('p, article, div, section');
        if (textContainer) {
            text = textContainer.textContent;
        }
    } else {
        if (element.tagName === 'IMG') {
            text = element.alt || element.title || '';
        } else {
            // Get word under cursor for Firefox
            const position = document.caretPositionFromPoint(e.clientX, e.clientY);
            if (position) {
                const textNode = position.offsetNode;
                if (textNode.nodeType === Node.TEXT_NODE) {
                    const nodeText = textNode.textContent;
                    // Find word boundaries
                    let start = position.offset;
                    let end = position.offset;
                    
                    // Find word start
                    while (start > 0 && !/\s/.test(nodeText[start - 1])) {
                        start--;
                    }
                    
                    // Find word end
                    while (end < nodeText.length && !/\s/.test(nodeText[end])) {
                        end++;
                    }
                    
                    // Get surrounding words for context
                    const beforeSpace = nodeText.lastIndexOf(' ', start - 1);
                    const afterSpace = nodeText.indexOf(' ', end + 1);
                    
                    const startPos = beforeSpace === -1 ? 0 : beforeSpace + 1;
                    const endPos = afterSpace === -1 ? nodeText.length : afterSpace;
                    
                    text = nodeText.slice(startPos, endPos);
                }
            }
            
            // Fallback to selection if position method fails
            if (!text) {
                const selection = window.getSelection();
                if (selection.toString()) {
                    text = selection.toString();
                } else {
                    text = element.textContent?.split(/\s+/).slice(0, 3).join(' ') || '';
                }
            }
        }
    }
    
    return text.trim();
}

// Translate text
async function translateText(text, targetLang = settings.targetLanguage) {
    if (!text || text === lastTranslatedText) return;
    
    try {
        // First detect the language
        const detectResponse = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=' + encodeURIComponent(text));
        const detectData = await detectResponse.json();
        const detectedLang = detectData[2];

        // Don't translate if text is already in target language
        if (detectedLang === targetLang) {
            return null;
        }
        
        const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text));
        const data = await response.json();
        
        if (data && data[0]) {
            lastTranslatedText = text;
            // Combine all translated parts for longer texts
            const translatedText = data[0]
                .map(item => item[0])
                .filter(Boolean)
                .join(' ');
            return {
                translated: translatedText,
                original: text,
                sourceLang: data[2] || 'auto'
            };
        }
    } catch (error) {
        console.error('Translation error:', error);
    }
    
    return null;
}

// Show translation
function showTranslation(translation, x, y) {
    if (!tooltip) {
        tooltip = createTooltip();
    }
    
    if (translation) {
        let content = translation.translated;
        if (settings.showOriginalText) {
            content = `${translation.original}\n➜ ${translation.translated}`;
        }
        
        tooltip.textContent = content;
        tooltip.style.display = 'block';
        positionTooltip(x, y, tooltip);
    }
}

// Hide translation
function hideTranslation() {
    if (tooltip) {
        tooltip.style.display = 'none';
        lastTranslatedText = '';
    }
}

// Mouse move handler
async function handleMouseMove(e) {
    if (!settings.enabled || isTranslating) return;
    
    // Get the element under cursor
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Immediately hide tooltip if no element found
    if (!element) {
        hideTranslation();
        return;
    }
    
    // Ignore elements that typically don't contain translatable content
    const ignoredTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'BR', 'HR', 'INPUT', 'BUTTON', 'SELECT', 'HTML', 'BODY'];
    if (ignoredTags.includes(element.tagName)) {
        hideTranslation();
        return;
    }
    
    // Check if element or its parent has actual text content
    const hasText = (el) => {
        if (!el) return false;
        const text = el.textContent?.trim() || '';
        const hasVisibleText = text.length > 0 && !/^\s*$/.test(text);
        return hasVisibleText && window.getComputedStyle(el).display !== 'none';
    };
    
    // Check element and its parent for text content
    if (!hasText(element) && !hasText(element.parentElement)) {
        hideTranslation();
        return;
    }
    
    const text = getTextUnderCursor(e);
    if (!text || text.length < 2) { // Ignore single characters
        hideTranslation();
        return;
    }
    
    // Only translate if Ctrl is pressed for long text
    if (text.length > 50 && !e.ctrlKey) {
        hideTranslation();
        return;
    }
    
    isTranslating = true;
    const translation = await translateText(text);
    if (translation) {
        showTranslation(translation, e.clientX, e.clientY);
    } else {
        hideTranslation();
    }
    isTranslating = false;
}

// Initialize
function init() {
    // Load settings from storage
    chrome.storage.sync.get(null, (items) => {
        settings = { ...settings, ...items };
    });
    
    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
        for (let key in changes) {
            settings[key] = changes[key].newValue;
        }
    });
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', hideTranslation);
}

// Start the extension
init(); 