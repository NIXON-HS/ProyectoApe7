import os
from PIL import Image

def get_dominant_colors(image_path, num_colors=5):
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return

    try:
        img = Image.open(image_path)
        img = img.convert('RGBA')
        # Resize to speed up processing
        img.thumbnail((150, 150))
        
        # Get pixels
        pixels = list(img.getdata())
        
        # Filter out background pixels (transparent or close to pure white/black)
        filtered_pixels = []
        for r, g, b, a in pixels:
            if a < 50: # transparent
                continue
            # Skip white/grey backgrounds
            if r > 240 and g > 240 and b > 240:
                continue
            # Skip black backgrounds
            if r < 15 and g < 15 and b < 15:
                continue
            filtered_pixels.append((r, g, b))
            
        if not filtered_pixels:
            print("No colorful pixels found (only transparent/white/black background).")
            return
            
        # Basic pixel binning for color grouping
        color_counts = {}
        for r, g, b in filtered_pixels:
            # Bin colors to group similar tones
            binned = (r // 10 * 10, g // 10 * 10, b // 10 * 10)
            color_counts[binned] = color_counts.get(binned, 0) + 1
            
        # Sort and take top colors
        sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
        top_colors = sorted_colors[:num_colors]
        
        print("--- DOMINANT COLORS ---")
        for color, count in top_colors:
            r, g, b = color
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            print(f"HEX: {hex_color} | RGB: ({r}, {g}, {b}) | Count: {count}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    logo_path = os.path.join("..", "logo.png")
    get_dominant_colors(logo_path)
