# About Transparency in Media Players

## ⚠️ Important: Media Players Don't Show Transparency

**Most media players (VLC, Windows Media Player, etc.) will NOT show transparency correctly.**

They will display:
- ❌ Black background (instead of transparent)
- ❌ Original green background (if transparency isn't working)
- ❌ Checkerboard pattern (some players)

## ✅ Where Transparency WILL Work

1. **Unity** - This is the main goal! The WEBM files will have proper transparency in Unity.
2. **Web Browsers** - HTML5 video with proper alpha support
3. **Video Editing Software** - Premiere, After Effects, etc. (if they support alpha)

## 🧪 How to Test Transparency

### Option 1: Test in Unity (Recommended)
1. Import the WEBM file into Unity
2. Use VideoPlayer component
3. Apply Unlit/Transparent shader
4. You'll see the transparency working!

### Option 2: Test in Web Browser
Create an HTML file:
```html
<!DOCTYPE html>
<html>
<body style="background: repeating-linear-gradient(45deg, #ccc, #ccc 10px, #999 10px, #999 20px);">
  <video src="your-video.webm" autoplay loop controls></video>
</body>
</html>
```
The checkerboard background will show through transparent areas.

### Option 3: Check FFmpeg
```bash
ffmpeg -i your-video.webm -vf "showinfo" -f null -
```
Look for `pix_fmt=yuva420p` in the output (the 'a' means alpha channel is present).

## 🔧 If Green is Still Visible

1. **Increase Chroma Tolerance** in the settings panel (try 0.5-0.7)
2. **Check the input file** - make sure it's actually a green screen video
3. **Adjust background color** - if your green isn't pure #00FF00, pick the exact color
4. **Re-process** the video with new settings

## 📝 Note

The green you see in media players is often just how they display alpha channels. The transparency IS there - it just needs the right player to show it!

