# Background Music for Arduino Learning Game

## Quick Setup

Place your background music file in this `music/` folder and name it:

**`background.mp3`**

That's it! The game will automatically load and play it continuously.

---

## Where to Find Free Music

### Recommended Sources (No Attribution Required):

1. **Pixabay Music** (Best option)
   - Website: https://pixabay.com/music/
   - Search for: "ambient", "electronic", "chill", "game music"
   - Filter: "Free to use" + "No attribution required"
   - Format: Download as MP3

2. **FreePD** (Public Domain)
   - Website: https://freepd.com/
   - All music is in the public domain
   - Great for electronic and game music

3. **Incompetech** (Free with Attribution)
   - Website: https://incompetech.com/music/
   - Free to use, just add credit in your game

---

## Music File Requirements

- **Format**: MP3
- **File name**: Must be exactly `background.mp3`
- **Duration**: 2-5 minutes recommended (it will loop automatically)
- **Style**: Choose something that fits your game (ambient, electronic, chill)
- **Volume**: The game plays music at 30% volume by default

---

## How to Change the Music

1. Download a new MP3 file
2. Rename it to `background.mp3`
3. Replace the old file in this `music/` folder
4. Refresh your game - done!

---

## How to Change Settings

### Change the Music File Name

Edit `js/ui/audioManager.js` line 11:
```javascript
this.MUSIC_FILE = 'music/background.mp3';  // Change to your file name
```

### Change the Default Volume

Edit `js/ui/audioManager.js` line 12:
```javascript
this.DEFAULT_VOLUME = 0.3;  // 0.0 = silent, 1.0 = full volume
```

---

## Troubleshooting

**Music doesn't play?**
- Check that `background.mp3` exists in the `music/` folder
- Check the browser console for error messages (Press F12)
- Some browsers block autoplay - click anywhere on the page to start

**Music is too loud/quiet?**
- Change `DEFAULT_VOLUME` in `js/ui/audioManager.js` (see above)
- Or call `window.audioManager.setVolume(0.5)` in the browser console

**Want to disable music temporarily?**
- In browser console, type: `window.audioManager.toggle()`
- This will be saved in your browser

---

## For Developers

The audio manager provides these methods:

```javascript
// Control playback
window.audioManager.play();     // Start music
window.audioManager.pause();    // Pause music
window.audioManager.stop();     // Stop and reset
window.audioManager.resume();   // Resume from pause

// Control volume
window.audioManager.setVolume(0.5);  // 0.0 to 1.0

// Toggle on/off
window.audioManager.toggle();   // Returns true/false

// Check status
window.audioManager.isPlaying();  // Returns true/false
window.audioManager.getStatus();  // Returns full status object
```

Settings are automatically saved in browser localStorage!
