// Tooltip elementi ve durum değişkenleri
let tooltip = null;
let lastTranslation = '';
let isTranslating = false;
let settings = {
    delay: 100,
    autoTranslate: true,
    targetLang: 'tr'
};

// Ayarları yükle
browser.storage.sync.get(['autoTranslate', 'targetLang']).then(result => {
    if (result.autoTranslate !== undefined) {
        settings.autoTranslate = result.autoTranslate;
    }
    if (result.targetLang) {
        settings.targetLang = result.targetLang;
    }
}).catch(err => console.error('Ayarlar yüklenirken hata:', err));

// Ayar güncellemelerini dinle
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'updateSettings') {
        if (request.settings.autoTranslate !== undefined) {
            settings.autoTranslate = request.settings.autoTranslate;
        }
        if (request.settings.targetLang) {
            settings.targetLang = request.settings.targetLang;
        }
    }
});

// Tooltip oluştur ve stil ver
function createTooltip() {
    if (tooltip) return;
    
    tooltip = document.createElement('div');
    tooltip.className = 'mtt-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        max-width: 300px;
        z-index: 999999;
        pointer-events: none;
        display: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.1s ease-out;
    `;
    document.body.appendChild(tooltip);
}

// Tooltip'i göster ve pozisyonunu ayarla
function showTooltip(text, x, y) {
    if (!text || typeof text !== 'string') return;
    if (!tooltip) createTooltip();
    
    tooltip.textContent = text;
    
    // Ekran sınırlarını kontrol et
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Fare pozisyonunu al ve sayıya çevir
    let posX = parseInt(x) + 20; // İmlecin 20px sağında
    let posY = parseInt(y) - (rect.height / 2); // İmlecin orta hizasında
    
    if (isNaN(posX) || isNaN(posY)) return;
    
    // Tooltip'in ekran dışına taşmasını önle
    if (posX + rect.width > viewportWidth) {
        posX = posX - rect.width - 40; // Sola al
    }
    
    if (posY + rect.height > viewportHeight) {
        posY = viewportHeight - rect.height - 5;
    }
    
    if (posY < 5) {
        posY = 5;
    }
    
    tooltip.style.left = `${posX}px`;
    tooltip.style.top = `${posY}px`;
    tooltip.style.display = 'block';
}

// Tooltip'i gizle
function hideTooltip() {
    if (tooltip && tooltip.parentNode) {
        tooltip.style.display = 'none';
        lastTranslation = '';
    }
}

// Metni çevir
async function translateText(text) {
    if (!text || text.length > 1000) return ''; 
    
    // Türkçe karakterleri kontrol et
    const turkishPattern = /[ğüşıöçĞÜŞİÖÇ]/;
    const turkishWordPattern = /\b(ve|veya|ile|için|bu|şu|o|ben|sen|biz|siz|onlar|var|yok|evet|hayır|tamam|nasıl|neden|çünkü|ama|fakat|ancak|lakin|eğer|şayet|de|da|ki|mi|mı|mu|mü)\b/i;
    
    // Eğer metin Türkçe ise çevirme
    if (turkishPattern.test(text) || turkishWordPattern.test(text)) {
        return '';
    }
    
    try {
        const response = await browser.runtime.sendMessage({
            type: 'translate',
            text: text.trim(),
            targetLang: settings.targetLang
        });

        if (response && response.error) {
            console.error('Translation error:', response.error);
            return '';
        }

        return response && response.translatedText ? response.translatedText : '';
    } catch (error) {
        console.error('Translation error:', error);
        return '';
    }
}

// Tarayıcıya göre caret range fonksiyonunu seç
function getCaretRange(x, y) {
    if (document.caretPositionFromPoint) {
        // Firefox için
        const position = document.caretPositionFromPoint(x, y);
        if (!position) return null;
        
        const range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        return range;
    } else if (document.caretRangeFromPoint) {
        // Chrome için
        return document.caretRangeFromPoint(x, y);
    }
    return null;
}

// Fare altındaki cümleyi al
function getSentenceAtPoint(x, y) {
    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) return '';

    const elementAtPoint = document.elementFromPoint(x, y);
    if (!elementAtPoint) return '';

    const text = elementAtPoint.textContent || '';
    if (!text) return '';

    // Metni noktalama işaretlerine göre cümlelere böl
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Fare pozisyonuna göre cümleyi bul
    const range = getCaretRange(x, y);
    if (!range) {
        // Range bulunamazsa, element içeriğini kullan
        return elementAtPoint.textContent.trim();
    }

    const clickedNode = range.startContainer;
    const clickedText = clickedNode.textContent || '';
    const clickedPosition = range.startOffset;

    // Tıklanan pozisyondan önceki ve sonraki metni kontrol et
    let currentPosition = 0;
    for (const sentence of sentences) {
        const sentenceEnd = currentPosition + sentence.length;
        if (clickedPosition >= currentPosition && clickedPosition <= sentenceEnd) {
            // Cümlenin başını ve sonunu bul
            let startPos = clickedText.lastIndexOf('.', clickedPosition - 1);
            startPos = startPos === -1 ? 0 : startPos + 1;
            
            let endPos = clickedText.indexOf('.', clickedPosition);
            endPos = endPos === -1 ? clickedText.length : endPos + 1;
            
            return clickedText.substring(startPos, endPos).trim();
        }
        currentPosition = sentenceEnd;
    }

    // Eğer cümle bulunamazsa, en yakın metni döndür
    return clickedText.trim();
}

// Fare hareketi işleyicisi
let translationTimeout = null;
document.addEventListener('mousemove', async (e) => {
    if (!settings.autoTranslate) {
        hideTooltip();
        return;
    }

    const selection = window.getSelection();
    if (!selection) return;
    
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Seçili metin varsa
    if (range && !range.collapsed) {
        const text = selection.toString().trim();
        if (text && text !== lastTranslation && !isTranslating && text.length <= 1000) {
            clearTimeout(translationTimeout);
            translationTimeout = setTimeout(async () => {
                isTranslating = true;
                const translatedText = await translateText(text);
                if (translatedText) {
                    lastTranslation = text;
                    showTooltip(translatedText, e.clientX, e.clientY);
                }
                isTranslating = false;
            }, settings.delay);
        }
    } else {
        // Fare altındaki cümle
        const text = getSentenceAtPoint(e.clientX, e.clientY);
        if (text && text !== lastTranslation && !isTranslating && text.length <= 1000) {
            clearTimeout(translationTimeout);
            translationTimeout = setTimeout(async () => {
                isTranslating = true;
                const translatedText = await translateText(text);
                if (translatedText) {
                    lastTranslation = text;
                    showTooltip(translatedText, e.clientX, e.clientY);
                }
                isTranslating = false;
            }, settings.delay);
        }
    }
});

// Sayfa kaydırma ve fare tekerleği olaylarında tooltip'i gizle
document.addEventListener('scroll', hideTooltip);
document.addEventListener('wheel', hideTooltip);

// Sayfadan çıkıldığında temizlik yap
window.addEventListener('beforeunload', () => {
    if (tooltip) {
        document.body.removeChild(tooltip);
    }
}); 