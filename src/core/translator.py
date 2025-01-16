"""
Translation functionality using various translation services.
"""

from googletrans import Translator as GoogleTranslator
from .config import Config

class Translator:
    def __init__(self):
        """Initialize the translator."""
        self.translator = GoogleTranslator()
        self.cache = {}
        
    def translate(self, text, source_lang=Config.DEFAULT_SOURCE_LANG, 
                 target_lang=Config.DEFAULT_TARGET_LANG):
        """Translate the given text."""
        if not text:
            return ""
            
        # Check cache first
        cache_key = f"{text}:{source_lang}:{target_lang}"
        if cache_key in self.cache:
            return self.cache[cache_key]
            
        try:
            # Perform translation
            result = self.translator.translate(text, src=source_lang, dest=target_lang)
            
            # Cache the result
            if len(self.cache) >= Config.CACHE_SIZE:
                self.cache.clear()
            self.cache[cache_key] = result.text
            
            return result.text
        except Exception as e:
            print(f"Error translating text: {e}")
            return text
            
    def detect_language(self, text):
        """Detect the language of the given text."""
        try:
            result = self.translator.detect(text)
            return result.lang
        except Exception as e:
            print(f"Error detecting language: {e}")
            return "en"  # Default to English 