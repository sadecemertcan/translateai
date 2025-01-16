"""
Main application entry point for Mouse Tooltip Translator.
"""

import time
from core.config import Config
from core.image_handler import ImageHandler
from core.translator import Translator
from features.tooltip import TranslationTooltip
from features.mouse_tracker import MouseTracker

class MouseTooltipTranslator:
    def __init__(self):
        """Initialize the application."""
        self.image_handler = ImageHandler()
        self.translator = Translator()
        self.tooltip = TranslationTooltip()
        self.mouse_tracker = MouseTracker(on_hover=self._on_mouse_hover)
        self.last_translation_time = 0
        
    def start(self):
        """Start the application."""
        try:
            print(f"Starting {Config.APP_NAME} v{Config.VERSION}")
            self.mouse_tracker.start()
            self.tooltip.window.mainloop()
        except Exception as e:
            print(f"Error starting application: {e}")
        finally:
            self.cleanup()
            
    def cleanup(self):
        """Clean up resources."""
        self.mouse_tracker.stop()
        self.tooltip.destroy()
        
    def _on_mouse_hover(self, x, y):
        """Handle mouse hover events."""
        current_time = time.time()
        if current_time - self.last_translation_time < Config.TRANSLATION_DELAY:
            self.tooltip.update_position(x, y)
            return
            
        # Capture and process screen region
        region_width = Config.OCR_REGION_WIDTH
        region_height = Config.OCR_REGION_HEIGHT
        image = self.image_handler.capture_screen_region(
            x - region_width // 2,  # Fare imlecini merkez al
            y - region_height // 2,
            region_width,
            region_height
        )
        if image is None:
            return
            
        # Extract and translate text
        text = self.image_handler.extract_text(image)
        if text:
            translated_text = self.translator.translate(text)
            self.tooltip.show(translated_text, x, y)
            self.last_translation_time = current_time
        else:
            self.tooltip.hide()

def main():
    """Application entry point."""
    app = MouseTooltipTranslator()
    app.start()

if __name__ == "__main__":
    main() 