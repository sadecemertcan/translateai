"""
Mouse tracking and event handling functionality.
"""

import pyautogui
from pynput import mouse, keyboard
from ..core.config import Config

class MouseTracker:
    def __init__(self, on_hover=None):
        """Initialize the mouse tracker."""
        self.on_hover = on_hover
        self.is_tracking = False
        self.last_position = (0, 0)
        self.ctrl_pressed = False
        
    def start(self):
        """Start tracking mouse movements."""
        self.is_tracking = True
        
        # Start keyboard listener
        self.keyboard_listener = keyboard.Listener(
            on_press=self._on_key_press,
            on_release=self._on_key_release
        )
        self.keyboard_listener.start()
        
        # Start mouse listener
        self.mouse_listener = mouse.Listener(
            on_move=self._on_move,
            on_click=self._on_click
        )
        self.mouse_listener.start()
        
    def stop(self):
        """Stop tracking mouse movements."""
        self.is_tracking = False
        if hasattr(self, 'mouse_listener'):
            self.mouse_listener.stop()
        if hasattr(self, 'keyboard_listener'):
            self.keyboard_listener.stop()
            
    def _on_key_press(self, key):
        """Handle key press events."""
        try:
            if key == keyboard.Key.ctrl:
                self.ctrl_pressed = True
        except AttributeError:
            pass
            
    def _on_key_release(self, key):
        """Handle key release events."""
        try:
            if key == keyboard.Key.ctrl:
                self.ctrl_pressed = False
        except AttributeError:
            pass
            
    def _on_move(self, x, y):
        """Handle mouse movement events."""
        if not self.is_tracking:
            return
            
        # Update position
        self.last_position = (x, y)
        
        # Call hover callback if provided and Ctrl is pressed
        if self.on_hover and self.ctrl_pressed:
            self.on_hover(x, y)
            
    def _on_click(self, x, y, button, pressed):
        """Handle mouse click events."""
        if not self.is_tracking:
            return
            
        # Additional click handling can be added here
        pass
        
    def get_position(self):
        """Get the current mouse position."""
        return self.last_position 