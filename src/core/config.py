"""
Core configuration settings for the Mouse Tooltip Translator.
"""

class Config:
    # Application settings
    APP_NAME = "Mouse Tooltip Translator"
    VERSION = "1.0.0"
    
    # Image settings
    IMAGE_DIR = "images/"
    
    # Translation settings
    DEFAULT_SOURCE_LANG = "auto"
    DEFAULT_TARGET_LANG = "tr"
    
    # UI settings
    TOOLTIP_FONT_SIZE = 12
    TOOLTIP_BACKGROUND_COLOR = "#FFFFFF"
    TOOLTIP_TEXT_COLOR = "#000000"
    TOOLTIP_OPACITY = 0.95  # Increased opacity
    TOOLTIP_BORDER_COLOR = "#CCCCCC"
    TOOLTIP_PADDING_X = 10
    TOOLTIP_PADDING_Y = 5
    TOOLTIP_OFFSET_X = 20  # Offset from cursor
    TOOLTIP_OFFSET_Y = 10  # Offset from cursor
    
    # Performance settings
    TRANSLATION_DELAY = 0.3  # Reduced delay for better responsiveness
    CACHE_SIZE = 1000  # number of cached translations
    
    # OCR settings
    OCR_LANG = "eng+tur"  # Desteklenen diller
    OCR_PSM = 6  # Sayfa segmentasyon modu (6 = Tek bir metin bloğu)
    OCR_OEM = 3  # OCR Engine modu (3 = Varsayılan)
    OCR_REGION_WIDTH = 400  # Increased capture width for paragraphs
    OCR_REGION_HEIGHT = 100  # Increased capture height for paragraphs 