# NBA Josh Boot Shot Music Video Generator
Automatically generates 40 viral "cop boot on back" rap music videos set in Lagos, Nigeria using ModelArk's AI video API.

## Quick Start
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   - Install [FFmpeg](https://ffmpeg.org/download.html) on your system:
     - macOS: `brew install ffmpeg`
     - Ubuntu: `sudo apt install ffmpeg`
2. Add your reference files to the `references/` folder:
   - `face.jpg`: Clear front-facing photo of NBA Josh
   - `full_body.jpg`: Full body reference photo
   - `hook_normal.mp3`: Normal speed hook audio
   - `hook_slowed.mp3`: Slowed + reverb hook audio (optional)
3. Add your ModelArk API key to `main.py` (or set it in a `.env` file)
4. Run the generator:
   ```bash
   python main.py
   ```

## Configuration
All settings are at the top of `main.py` in the CONFIG section:
- `USE_SLOWED_HOOK`: Toggle between normal / slowed audio
- `HOOK_DURATION`: Exact length of your hook in seconds
- `NUM_VIDEOS`: Number of videos to generate (max 40)
- `MODE`: Quality/speed balance (`seedance-2.5` for best quality, `dola-seed-2.1-turbo` for fastest, `mixed` for best of both)

## Troubleshooting
- **Tattoos are backwards**: Add `All tattoos are correctly readable, never mirrored` to the end of the prompt
- **Cop boot disappears**: Add `The cop's boot stays pressed firmly on his back the entire time` to the prompt
- **Lip sync is off**: Bump `motion_bucket` to 4, or increase `reference_strength` to 0.88
