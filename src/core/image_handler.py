"""
Image handling and processing functionality.
"""

import cv2
import numpy as np
from PIL import Image, ImageGrab
import pytesseract

class ImageHandler:
    def __init__(self):
        """Initialize the image handler."""
        self.last_image = None
        
    def capture_screen_region(self, x, y, width, height):
        """Capture a region of the screen."""
        try:
            # Koordinatları pozitif sayılara dönüştür
            x = max(0, x)
            y = max(0, y)
            
            # Ekran bölgesini yakala
            screenshot = ImageGrab.grab(bbox=(x, y, x + width, y + height))
            
            # PIL Image'ı numpy dizisine dönüştür
            image = np.array(screenshot)
            
            # BGR formatına dönüştür (OpenCV için)
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            self.last_image = image
            return image
        except Exception as e:
            print(f"Error capturing screen region: {e}")
            return None
            
    def preprocess_image(self, image):
        """Preprocess the image for better OCR results."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Noise reduction
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply adaptive thresholding
            binary = cv2.adaptiveThreshold(
                denoised,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11,  # Block size
                2    # C constant
            )
            
            # Apply dilation to connect text components
            kernel = np.ones((1,1), np.uint8)
            dilated = cv2.dilate(binary, kernel, iterations=1)
            
            return dilated
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return image
            
    def extract_text(self, image):
        """Extract text from the image using OCR."""
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            
            # Configure Tesseract parameters
            custom_config = r'--oem 3 --psm 6'
            
            # Perform OCR
            text = pytesseract.image_to_string(
                processed_image,
                config=custom_config
            )
            
            return text.strip()
        except Exception as e:
            print(f"Error extracting text: {e}")
            return "" 