"""
Tooltip functionality for displaying translations.
"""

import tkinter as tk
from ..core.config import Config

class TranslationTooltip:
    def __init__(self):
        """Initialize the translation tooltip."""
        self.window = tk.Tk()
        self.window.withdraw()  # Hide the main window
        
        # Create tooltip window
        self.tooltip = tk.Toplevel(self.window)
        self.tooltip.withdraw()
        self.tooltip.overrideredirect(True)  # Remove window decorations
        
        # Configure tooltip appearance
        self.tooltip.configure(bg=Config.TOOLTIP_BACKGROUND_COLOR)
        self.tooltip.attributes("-alpha", Config.TOOLTIP_OPACITY)
        self.tooltip.attributes("-topmost", True)  # Keep tooltip on top
        
        # Add rounded corners and border
        self.tooltip.configure(bd=1, relief="solid")
        
        # Create label for text
        self.label = tk.Label(
            self.tooltip,
            font=("Arial", Config.TOOLTIP_FONT_SIZE),
            bg=Config.TOOLTIP_BACKGROUND_COLOR,
            fg=Config.TOOLTIP_TEXT_COLOR,
            justify=tk.LEFT,
            wraplength=300,
            padx=10,
            pady=5
        )
        self.label.pack(expand=True, fill="both")
        
    def show(self, text, x, y):
        """Show the tooltip at the specified position."""
        if not text:
            self.hide()
            return
            
        self.label.config(text=text)
        
        # Calculate tooltip position to stay within screen bounds
        screen_width = self.window.winfo_screenwidth()
        screen_height = self.window.winfo_screenheight()
        tooltip_width = self.label.winfo_reqwidth()
        tooltip_height = self.label.winfo_reqheight()
        
        # Position tooltip to the right of cursor by default
        pos_x = x + 20
        pos_y = y + 10
        
        # Adjust if tooltip would go off screen
        if pos_x + tooltip_width > screen_width:
            pos_x = x - tooltip_width - 10
        if pos_y + tooltip_height > screen_height:
            pos_y = y - tooltip_height - 10
            
        self.tooltip.geometry(f"+{pos_x}+{pos_y}")
        self.tooltip.deiconify()
        self.tooltip.lift()
        
    def hide(self):
        """Hide the tooltip."""
        self.tooltip.withdraw()
        
    def update_position(self, x, y):
        """Update the tooltip position."""
        if self.tooltip.winfo_viewable():
            # Calculate tooltip position to stay within screen bounds
            screen_width = self.window.winfo_screenwidth()
            screen_height = self.window.winfo_screenheight()
            tooltip_width = self.label.winfo_reqwidth()
            tooltip_height = self.label.winfo_reqheight()
            
            # Position tooltip to the right of cursor by default
            pos_x = x + 20
            pos_y = y + 10
            
            # Adjust if tooltip would go off screen
            if pos_x + tooltip_width > screen_width:
                pos_x = x - tooltip_width - 10
            if pos_y + tooltip_height > screen_height:
                pos_y = y - tooltip_height - 10
                
            self.tooltip.geometry(f"+{pos_x}+{pos_y}")
            
    def destroy(self):
        """Clean up resources."""
        self.window.destroy() 