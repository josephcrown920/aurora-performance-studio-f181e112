import os
from dotenv import load_dotenv
load_dotenv()
import time
import csv
import requests
import ffmpeg
from pathlib import Path

# ---------------------------------------------------------------------------
# CONFIG (EDIT ONLY THESE VALUES)
# ---------------------------------------------------------------------------
MODELARK_API_KEY = os.environ.get("MODELARK_API_KEY", "")  # set in .env, never commit
API_BASE = "https://api.modelark.ai/v1"
MODE = "mixed"  # Options: "seedance-2.5", "dola-seed-2.1-turbo", "mixed"
NUM_VIDEOS = 1  # Start with 1 to test, then increase to 40

# AUDIO SETTINGS
USE_SLOWED_HOOK = False  # Set to True for slowed + reverb version
HOOK_AUDIO = "references/hook_normal.mp3" if not USE_SLOWED_HOOK else "references/hook_slowed.mp3"
HOOK_DURATION = 24  # EXACT length of your hook audio in seconds

# REFERENCE ASSETS
REF_FACE = "references/face.jpg"  # Clear front-facing face reference
REF_FULL_BODY = "references/full_body.jpg"  # Full body reference
REF_BOOT_POSE = "references/boot_pose.jpg"  # Test render pose reference (optional)

# YOUR ACTUAL HOOK LYRICS (8 lines, aligned to beat cuts)
HOOK_LYRIC_LINES = [
    "To the feds, I just duck and roll",
    "or slide and jump, like it's COD take all loaded guns",
    "And I ain't on the run",
    "But the feds, they go see you, act like they lost they memory or something",
    "talking about ain't you the one??",
    "Yeah yeah and I'm still the one, I'm Finna rule my Gun",
    "I ain't never fuck with no thot thot thot thot",
    "Let's have some fun, No diddy, come chill with me get litty"
]

# ---------------------------------------------------------------------------
# 100% ACCURATE NBA JOSH CHARACTER DESCRIPTION (FROM ALL REFERENCES)
# ---------------------------------------------------------------------------
CHARACTER_DESC = """
NBA Josh: Young Nigerian man, lean muscular build, thick dark locs/dreads with bright crimson red tips (styled either in a high top knot bun or loose falling to his shoulders), full trimmed goatee, deep set dark eyes, small diamond stud in his left ear.

Tattoos (all correctly readable, never mirrored/reversed):
- Right upper arm: Vertical old English text "NBA JOSH" running down the bicep, 3 small 5-point stars above the "NBA" letters
- Left arm: Full tattoo sleeve with cloud/scale patterns, star motifs, and cursive script tattoos
- Right wrist/forearm: Rose tattoo
- Left inner forearm: Angel figure tattoo
- Left wrist/forearm: Cursive "Met & Lit" script tattoo

Jewelry:
- Thick fully iced silver cuban link chain with stacked "NBA JOSH" block letter pendant, small star next to the "A" in NBA, "444" engraved at the bottom of the pendant
- Fully iced out round face watch with a spiked crown of thorns frame around the dial, dark blue Arabic numerals on the watch face
"""

# ---------------------------------------------------------------------------
# 40 LAGOS LOCATION VIDEO DATABASE
# ---------------------------------------------------------------------------
VIDEO_DB = [
    {"id": 1, "location": "Surulere, outside a suya spot", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local suya restaurant", "vibe": "Golden hour sunset, smoke from the suya grill in the air, danfo buses parked on the side", "ending": "casually walks out of frame to the right", "flair": "Suya vendor standing in the far background"},
    {"id": 2, "location": "Victoria Island, outside a fancy rooftop restaurant", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Fancy rooftop eatery", "vibe": "Blue hour dusk, city skyline lights coming on", "ending": "walks into the bar, holds the door open", "flair": "Luxury SUV parked behind you on the street, 'MuddyHits' text watermark in corner"},
    {"id": 3, "location": "Ikeja, outside a popular amala joint", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Popular amala restaurant", "vibe": "Warm dusk light, plates of amala and ewedu on a nearby table", "ending": "greets the barber with a head nod as he walks off", "flair": "Local customers eating at plastic tables in background"},
    {"id": 4, "location": "Lekki Phase 1, sunset beach road", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Beach bar", "vibe": "Sunset golden hour, ocean visible behind palm trees", "ending": "walks into the studio door", "flair": "Surfboard leaning against a wall near you"},
    {"id": 5, "location": "Yaba, outside a streetwear shop", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Fast food spot next to the shop", "vibe": "Late night, neon shop signs glowing wet pavement after rain", "ending": "hops on an okada (motorcycle) ride as he leaves", "flair": "Custom ankara jackets hanging in the shop window"},
    {"id": 6, "location": "Festac Town, 24hr cold room", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Late night fried rice spot", "vibe": "Midnight, fluorescent light from the cold room", "ending": "gets into his grey Dodge Challenger parked out front", "flair": "Street vendor selling cold drinks on the sidewalk"},
    {"id": 7, "location": "Oniru, outside a concert venue", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Food truck outside the venue", "vibe": "Pre-show golden hour, concert marquee sign with your name", "ending": "greets the barber with a head nod as he walks off", "flair": "Line of fans waiting to get in behind you"},
    {"id": 8, "location": "Ajah, local bakery", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Bakery", "vibe": "Early morning, sunrise light, smell of fresh bread", "ending": "carries a stack of custom show posters as he leaves", "flair": "Stack of puff puff on a counter next to you"},
    {"id": 9, "location": "Oshodi, busy market street", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local canteen", "vibe": "Dawn, market stalls setting up", "ending": "hops on an okada (motorcycle) ride as he leaves", "flair": "Danfo buses passing in the far background"},
    {"id": 10, "location": "Banana Island, mansion gate", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Private estate restaurant", "vibe": "Golden hour sunset, luxury homes behind you", "ending": "walks down a forest path away from the camera", "flair": "Your grey Dodge Challenger parked at the gate next to the mic"},
    {"id": 11, "location": "Ikoyi, upscale cocktail bar", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Fancy cocktail bar", "vibe": "Blue hour dusk, warm neon bar sign glow", "ending": "walks into the bar, holds the door open", "flair": "'MuddyHits' text watermark in corner"},
    {"id": 12, "location": "Gbagada, barbershop", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Local shawarma spot next to the barber shop", "vibe": "Late night, neon barber pole sign", "ending": "greets the barber with a head nod as he walks off", "flair": "Barber standing in the shop doorway behind you"},
    {"id": 13, "location": "Mushin, local music studio", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Late night jollof rice spot", "vibe": "Midnight, hand-painted 'Afrobeats Studio' sign glowing", "ending": "walks into the studio door", "flair": "Studio speaker stack visible in the background"},
    {"id": 14, "location": "Apapa port area", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local street food canteen", "vibe": "Golden hour sunset, container trucks in background", "ending": "hops on an okada (motorcycle) ride as he leaves", "flair": "Okada driver waiting for him on the sidewalk"},
    {"id": 15, "location": "Maryland, shopping mall", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Food court exit", "vibe": "Late night, mall lights reflecting on wet pavement", "ending": "gets into his grey Dodge Challenger parked out front", "flair": "Your face on a billboard for MuddyHits above the mall entrance"},
    {"id": 16, "location": "Ilupeju, ankara fashion shop", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Local meat pie bakery", "vibe": "Warm afternoon sunlight", "ending": "holds up a custom ankara jacket as he walks off", "flair": "Mannequins with ankara designs outside the shop"},
    {"id": 17, "location": "Magodo residential estate", "outfit": "shirtless, black leather pants, gold iced watch, iced chain", "eatery": "Private estate restaurant", "vibe": "Golden hour sunset, bungalows with red roofs", "ending": "walks into the gate of a luxury home", "flair": "White dog walking in the background"},
    {"id": 18, "location": "Ogba, print shop", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Late night indomie spot", "vibe": "Midnight, neon 'PHARMACY' sign next door", "ending": "carries a stack of custom show posters as he leaves", "flair": "Your album posters displayed in the shop window"},
    {"id": 19, "location": "Badagry coastal town", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Seafood restaurant", "vibe": "Sunset golden hour, coconut trees, ocean view", "ending": "holds red baseball bat over his shoulder as he walks off", "flair": "Old colonial-style buildings in the background"},
    {"id": 20, "location": "Lekki Conservation area", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Outdoor jungle restaurant", "vibe": "Golden hour, tall palm trees, greenery", "ending": "walks down a forest path away from the camera", "flair": "Monkeys climbing trees in the far background"},
    {"id": 21, "location": "Ikorodu, outside a local football viewing center", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Street food spot next to the viewing center", "vibe": "Match night, blue hour, TV light glowing from inside", "ending": "casually walks out of frame to the right", "flair": "People cheering inside, TV visible through the window"},
    {"id": 22, "location": "Ikotun, outside a popular church entrance", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Food vendor outside the church", "vibe": "Sunday morning, bright sunlight, church crowd", "ending": "walks into the bar, holds the door open", "flair": "Church sign, ushers standing by the door"},
    {"id": 23, "location": "Ojota, busy interchange", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local roadside canteen", "vibe": "Rush hour dusk, traffic lights, danfo buses", "ending": "greets the barber with a head nod as he walks off", "flair": "Traffic of danfo buses with headlights on in distance"},
    {"id": 24, "location": "Agege, outside a bread bakery", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Bakery", "vibe": "Early morning sunrise, fresh bread smell", "ending": "holds up a custom ankara jacket as he walks off", "flair": "Giant stacks of Agege bread on display"},
    {"id": 25, "location": "Oworonshoki, waterfront street", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Street seafood spot", "vibe": "Dusk, lagoon view, canoes in the distance", "ending": "walks into the studio door", "flair": "Canoes on the lagoon in the background"},
    {"id": 26, "location": "Abule Egba, outside a popular mechanic shop", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local canteen next to the shop", "vibe": "Late afternoon, car engines, grease, golden light", "ending": "gets into his grey Dodge Challenger parked out front", "flair": "Cars being repaired, your Challenger in the lot"},
    {"id": 27, "location": "Alimosho, outside a video rental shop", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Street food spot", "vibe": "Retro 90s vibe, dusk, old Nollywood posters", "ending": "walks down a forest path away from the camera", "flair": "Old Nollywood movie posters on the walls"},
    {"id": 28, "location": "Isolo, outside a fashion design studio", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Local shawarma spot", "vibe": "Warm afternoon, tailor working in the window", "ending": "holds up a custom ankara jacket as he walks off", "flair": "Custom made agbada outfits on mannequins"},
    {"id": 29, "location": "Okota, outside a local pharmacy", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Late night indomie spot", "vibe": "Midnight, glowing green pharmacy sign, wet street", "ending": "carries a stack of custom show posters as he leaves", "flair": "Neon 'PHARMACY' sign glowing at night"},
    {"id": 30, "location": "Ketu, bustling market street", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local canteen", "vibe": "Market day, midday, women selling fruits and vegetables", "ending": "casually walks out of frame to the right", "flair": "Women selling fruits and vegetables on the sidewalk"},
    {"id": 31, "location": "Mile 2, highway overpass", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Roadside suya spot", "vibe": "Sunset, highway traffic, okadas", "ending": "holds red baseball bat over his shoulder as he walks off", "flair": "Traffic of okada (motorcycles) in the distance"},
    {"id": 32, "location": "Iyana Ipaja, outside a popular hotel", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Hotel restaurant", "vibe": "Blue hour, hotel neon sign, valet", "ending": "walks into the bar, holds the door open", "flair": "Hotel sign, valet standing by the entrance"},
    {"id": 33, "location": "Ilashe, beach resort street", "outfit": "shirtless, black leather pants, gold iced watch, iced chain", "eatery": "Beach restaurant", "vibe": "Golden hour, beach umbrellas, ocean breeze", "ending": "walks down a forest path away from the camera", "flair": "Beach umbrellas, ocean breeze moving palm trees"},
    {"id": 34, "location": "Marina, downtown Lagos", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Upscale restaurant", "vibe": "Night time, tall glass buildings, city lights", "ending": "gets into his grey Dodge Challenger parked out front", "flair": "Tall office buildings with glass facades, city lights"},
    {"id": 35, "location": "Jibowu, outside a popular eba soup spot", "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers", "eatery": "Local eba soup spot", "vibe": "Dusk, locals sitting at plastic tables", "ending": "greets the barber with a head nod as he walks off", "flair": "Locals sitting at plastic tables eating"},
    {"id": 36, "location": "Fadeyi, outside a vintage record shop", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Local shawarma spot", "vibe": "Retro afternoon, old Afrobeat vinyls on display", "ending": "holds up a custom ankara jacket as he walks off", "flair": "Old Afrobeat vinyl records displayed in the window"},
    {"id": 37, "location": "Iponri, outside a gym entrance", "outfit": "shirtless, black leather pants, gold iced watch, iced chain", "eatery": "Protein shake bar next to the gym", "vibe": "Early morning sunrise, gym lights", "ending": "walks into the gate of a luxury home", "flair": "Guys lifting weights visible through the glass door"},
    {"id": 38, "location": "Surulere, outside a popular club", "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers", "eatery": "Club entrance", "vibe": "Late night, club neon signs, line of people", "ending": "walks into the bar, holds the door open", "flair": "Line of people waiting to get in, bouncer at the door"},
    {"id": 39, "location": "Lekki Conservation area", "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain", "eatery": "Outdoor jungle restaurant", "vibe": "Midday, bright sunlight, green jungle, wildlife", "ending": "casually walks out of frame to the right", "flair": "Monkeys, tall palm trees, greenery"},
    {"id": 40, "location": "Tarkwa Bay, beach street", "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain", "eatery": "Beach bar", "vibe": "Sunset, waves, surfboards", "ending": "carries a stack of custom show posters as he leaves", "flair": "Surfboards leaning against a wall, ocean waves in background"}
]

# ---------------------------------------------------------------------------
# MODELARK API HELPERS
# ---------------------------------------------------------------------------
HEADERS = {"Authorization": f"Bearer {MODELARK_API_KEY}"}
MODEL_IDS = {
    "seedance-2.5": "video-generation/seedance-2-5",
    "dola-seed-2.1-turbo": "video-generation/dola-seed-2-1-turbo"
}
TASK_TIMEOUT = 600  # 10 minute max per generation task


def upload_asset(file_path):
    """Upload reference image/audio to ModelArk asset library, return asset URL"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Reference file not found: {file_path}")
    
    file_name = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        files = {"file": (file_name, f)}
        res = requests.post(f"{API_BASE}/assets/upload", headers=HEADERS, files=files)
    
    if res.status_code != 200:
        raise Exception(f"Upload failed for {file_name}: {res.text}")
    
    data = res.json()
    if "asset_url" not in data:
        raise Exception(f"Upload response missing asset_url: {data}")
    
    return data["asset_url"]


def submit_video_generation(
    prompt, model_id, duration,
    reference_image_url=None, lip_sync=False, audio_url=None,
    motion_bucket=3, reference_strength=0.78
):
    """Submit async video generation task to ModelArk"""
    payload = {
        "model_id": model_id,
        "prompt": prompt,
        "duration": duration,
        "aspect_ratio": "16:9",
        "motion_bucket": motion_bucket,
        "face_enhance": True
    }

    if reference_image_url:
        payload["reference_image_url"] = reference_image_url
        payload["reference_strength"] = reference_strength

    if lip_sync and audio_url:
        payload["lip_sync"] = True
        payload["audio_url"] = audio_url

    res = requests.post(f"{API_BASE}/tasks/submit", headers=HEADERS, json=payload)
    
    if res.status_code != 200:
        raise Exception(f"Task submission failed: {res.text}")
    
    data = res.json()
    if "task_id" not in data:
        raise Exception(f"Submission response missing task_id: {data}")
    
    return data["task_id"]


def get_task_status(task_id):
    """Poll task status until complete (with timeout)"""
    start_time = time.time()
    while time.time() - start_time < TASK_TIMEOUT:
        res = requests.get(f"{API_BASE}/tasks/{task_id}", headers=HEADERS)
        
        if res.status_code != 200:
            raise Exception(f"Status check failed: {res.text}")
        
        data = res.json()
        status = data.get("status")
        
        if status == "success":
            if "output_video_url" not in data:
                raise Exception(f"Task success but missing output URL: {data}")
            return data["output_video_url"]
        
        if status == "failed":
            raise Exception(f"Task failed: {data.get('error', 'Unknown error')}")
        
        time.sleep(5)
    
    raise TimeoutError(f"Task {task_id} timed out after {TASK_TIMEOUT} seconds")


def generate_clip(
    prompt, model, duration,
    reference_image_url=None, lip_sync=False, audio_url=None,
    motion_bucket=3, ref_strength=None
):
    """Full generate flow: submit + poll + return URL, with 2 retries"""
    if model not in MODEL_IDS:
        raise ValueError(f"Invalid model: {model}. Options: {list(MODEL_IDS.keys())}")
    
    model_id = MODEL_IDS[model]
    
    if reference_image_url and not ref_strength:
        ref_strength = 0.82 if model == "seedance-2.5" else 0.78

    for attempt in range(3):
        try:
            task_id = submit_video_generation(
                prompt, model_id, duration,
                reference_image_url=reference_image_url,
                lip_sync=lip_sync, audio_url=audio_url,
                motion_bucket=motion_bucket,
                reference_strength=ref_strength
            )
            return get_task_status(task_id)
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {str(e)[:100]}..., retrying...")
            if reference_image_url:
                ref_strength = min(ref_strength + 0.03, 0.95)
            time.sleep(2)
    
    raise Exception("All 3 generation attempts failed")


def download_file(url, save_path):
    """Download a file from URL to local path with error handling"""
    try:
        with requests.get(url, stream=True, timeout=60) as r:
            r.raise_for_status()
            with open(save_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
    except Exception as e:
        raise Exception(f"Failed to download {url}: {e}")

# ---------------------------------------------------------------------------
# PROMPT TEMPLATES
# ---------------------------------------------------------------------------
def build_perfect_boot_shot_prompt(video):
    """Single iconic boot shot: cop pressing down, calm sharp rap delivery"""
    # Slowed version adjustments
    vibe_note = ""
    if USE_SLOWED_HOOK:
        vibe_note = """
        Slowed chopped-and-screwed vibe. Slow deliberate head movements, dreamy soft focus, deeper teal shadows, warmer amber highlights. The cop's boot presses down slowly, heavy menacing energy. Josh's delivery is smoother, even more laid back, extra unbothered.
        """

    return f"""
Cinematic hip-hop music video, photorealistic 4K texture, gritty high-end tone, shot on location on a street in {video['location']} Lagos, Nigeria.

{CHARACTER_DESC}
He is wearing {video['outfit']}.

Low angle static locked-off camera, positioned on the ground at eye level with the subject.
Josh lies face down on rough dusty asphalt ground. His arms are crossed under his chin, resting on the ground, he looks directly up into the camera.

A Nigerian police officer stands over him, pressing his heavy polished black leather police boot down FIRMLY into Josh's upper back/shoulder blade. The pressure is hard enough to create a visible indent in the fabric of his shirt/jacket. Only the officer's navy blue uniform pants and black boot are visible in the top third of the frame. The cop is trying to bully him, hold him down, arrest him, but Josh does not react at all.

Josh raps directly up into the camera, perfectly lip-synced to the full hook. His expression is completely calm, firm, unshaken, no fear at all. His mouth movements are sharp, precise, controlled — no over-the-top yelling, every syllable is clear and deliberate, his flow is perfect, locked in, like the cop standing on him doesn't even exist. He is fully focused on delivering his bars, unbothered, confident, he knows he is "the one" and nothing the cop does can phase him. He smirks subtly between the hardest lines.

{video['vibe']}. {video['flair']}. Blurred out of focus Lagos street background, parked cars and danfo buses in the far distance, warm golden hour street light flaring at the edges of the frame. Small bits of gravel, dry grass, and dust in the foreground near the camera lens.

White balance 4200K, teal-and-amber color grade, 35mm film grain, shallow depth of field, high contrast gritty cinematic look, realistic skin texture, realistic fabric texture.
All tattoos are correctly readable, never mirrored or reversed. The cop's boot stays pressed firmly on his back the entire time, never leaves the frame.
{vibe_note}
No subtitles, no text overlays, no camera movement. Perfect lip sync for the full duration. Total duration {HOOK_DURATION} seconds.
"""


def build_full_boot_story_prompt(video, lyric_lines):
    """Full 8-shot beat-synced music video with hard cuts on every beat"""
    total_hook_length = HOOK_DURATION
    shot_durations = [0.12, 0.15, 0.10, 0.13, 0.12, 0.13, 0.15, 0.10]
    shot_durations = [d * total_hook_length for d in shot_durations]
    timestamps = []
    current = 0
    for dur in shot_durations:
        timestamps.append(f"{current:.2f}")
        current += dur
    timestamps.append(f"{current:.2f}")

    vibe_note = ""
    if USE_SLOWED_HOOK:
        vibe_note = """
        Slowed chopped-and-screwed vibe. Slow deliberate head movements, dreamy soft focus, deeper teal shadows, warmer amber highlights. The cop's boot presses down slowly, heavy menacing energy. Josh's delivery is smoother, even more laid back, extra unbothered.
        """

    return f"""
Cinematic hip-hop / rap music video, photorealistic 4K texture, gritty high-end tone, {video['location']} Lagos, Nigeria setting.
Core character: {CHARACTER_DESC}
He is wearing {video['outfit']}.

Story: NBA Josh is on the ground with a Nigerian police officer's heavy black leather boot pressed firm on his back. The cop is trying to bully him, hold him down, arrest him. Josh never flinches, never breaks his flow, delivers every bar sharp and perfect, completely unbothered, he knows he is still the one.
Hard cuts land perfectly on every beat, each transition carrying a double contrast (shot size and camera type changing simultaneously). All lip movements are sharp, precise, controlled, perfect lip sync to every word.

Lyrics (Josh raps each line in order, perfect lip-sync):
Line 1: "{lyric_lines[0]}"
Line 2: "{lyric_lines[1]}"
Line 3: "{lyric_lines[2]}"
Line 4: "{lyric_lines[3]}"
Line 5: "{lyric_lines[4]}"
Line 6: "{lyric_lines[5]}"
Line 7: "{lyric_lines[6]}"
Line 8: "{lyric_lines[7]}"

Shot 1 [{timestamps[0]}–{timestamps[1]}] — low-angle extreme wide establishing shot, Steadicam slowly pushing in through {video['vibe']}. Josh lies face down on the asphalt, a Nigerian police officer in full navy uniform stands over him, boot pressed on his back. {video['flair']}. Danfo buses pass blurred in the far distance. Lyric line 1. Hard cut.

Shot 2 [{timestamps[1]}–{timestamps[2]}] — tight close-up of Josh's face, cut in with a handheld whip pan. He lies on the ground, rapping directly up into the camera, calm firm expression, the cop's black boot visible at the top edge of the frame pressing hard into his back. Background is out of focus with shimmering light reflections. Lyric line 2. Hard cut.

Shot 3 [{timestamps[2]}–{timestamps[3]}] — macro insert shot, fixed camera position, close up of the cop's thick black leather boot pressing down hard into the fabric of Josh's jacket/shoulder, visible pressure indent in the material. Scuff marks on the boot leather. Lyric line 3. Hard cut.

Shot 4 [{timestamps[3]}–{timestamps[4]}] — 3/4 side medium shot, camera slowly prowling around Josh on the ground. His "NBA JOSH" tattoo on his right bicep is visible, his iced chain glints in the street light. He turns his head slightly to rap to the side for half the shot, then looks back to camera. Lyric line 4. Hard cut.

Shot 5 [{timestamps[4]}–{timestamps[5]}] — fast handheld tilt down from Josh's face to his iced watch on his left wrist, glinting in the light, his "Met & Lit" tattoo visible next to the watch. Small bits of dust drift across the foreground. Lyric line 5. Hard cut.

Shot 6 [{timestamps[5]}–{timestamps[6]}] — close up of Josh's face again, he smirks subtly mid-verse, licks his teeth, never stops rapping, looks directly into the camera like the cop standing on him is irrelevant. Street light catches his diamond earring. Lyric line 6. Hard cut.

Shot 7 [{timestamps[6]}–{timestamps[7]}] — tight aggressive push-in on Josh's face at the height of his flow, aggressive handheld. His delivery gets sharper, harder, more confident, he grits his teeth slightly on the hardest bars. The cop's boot presses down harder but he doesn't flinch at all. Lyric line 7. Hard cut.

Shot 8 [{timestamps[7]}–{timestamps[8]}] — medium wide shot, static camera. Josh delivers the final punchline directly to camera, smirks, winks subtly, then nods his head once to the beat as the cop's boot pushes him down a little more. {video['vibe']} light flares behind him. Lyric line 8.

White balance 4200K, teal-and-amber color grade, 35mm film grain, shallow depth of field, high contrast gritty cinematic look, authentic Lagos street atmosphere.
{vibe_note}
All tattoos are correctly readable, never mirrored or reversed. The cop's boot stays pressed firmly on his back in every shot that shows his upper body.
No subtitles, no text overlays, no dissolve transitions, no duplicate characters, hard cuts only. Perfect lip sync for the entire duration. Total duration {total_hook_length:.2f} seconds.
"""

# ---------------------------------------------------------------------------
# MAIN BATCH WORKFLOW
# ---------------------------------------------------------------------------
def validate_config():
    """Check required files and settings before starting"""
    required_files = [REF_FACE, HOOK_AUDIO]
    for f in required_files:
        if not os.path.exists(f):
            raise FileNotFoundError(f"Required reference file missing: {f}")
    
    if MODE not in ["seedance-2.5", "dola-seed-2.1-turbo", "mixed"]:
        raise ValueError(f"Invalid MODE: {MODE}. Must be one of: seedance-2.5, dola-seed-2.1-turbo, mixed")
    
    if NUM_VIDEOS < 1 or NUM_VIDEOS > len(VIDEO_DB):
        raise ValueError(f"NUM_VIDEOS must be between 1 and {len(VIDEO_DB)}")
    
    if not MODELARK_API_KEY:
        raise ValueError("Please set your MODELARK_API_KEY in the config section")
    
    if len(HOOK_LYRIC_LINES) != 8:
        raise ValueError("HOOK_LYRIC_LINES must have exactly 8 lines (one per shot)")


if __name__ == "__main__":
    try:
        validate_config()
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        exit(1)

    # Upload reference assets once
    print("Uploading reference assets to ModelArk...")
    try:
        face_url = upload_asset(REF_FACE)
        audio_url = upload_asset(HOOK_AUDIO)
        full_body_url = upload_asset(REF_FULL_BODY) if os.path.exists(REF_FULL_BODY) else None
        boot_pose_url = upload_asset(REF_BOOT_POSE) if os.path.exists(REF_BOOT_POSE) else None
        print(f"✅ Assets uploaded successfully")
    except Exception as e:
        print(f"❌ Asset upload failed: {e}")
        exit(1)

    # Set model based on mode
    if MODE == "seedance-2.5":
        fg_model = "seedance-2.5"
    elif MODE == "dola-seed-2.1-turbo":
        fg_model = "dola-seed-2.1-turbo"
    else:
        fg_model = "seedance-2.5"  # Mixed mode uses best quality for main shot

    # Create output folder
    Path("outputs").mkdir(exist_ok=True)

    print(f"\nMode: {MODE}")
    print(f"Model: {fg_model}")
    print(f"Hook duration: {HOOK_DURATION}s ({'slowed' if USE_SLOWED_HOOK else 'normal'})")
    print(f"Generating {NUM_VIDEOS} videos...\n")

    # Initialize log file
    with open("modelark_generation_log.csv", "w", newline="") as logf:
        log_writer = csv.writer(logf)
        log_writer.writerow([
            "Video ID", "Location", "Model", "Status", "Error", "Timestamp"
        ])

        for video in VIDEO_DB[:NUM_VIDEOS]:
            vid_id = video["id"]
            output_file = Path("outputs") / f"NBAJosh_BootShot_{vid_id}.mp4"
            
            # Skip already completed videos
            if output_file.exists():
                print(f"⏭️  Video {vid_id} already exists, skipping")
                log_writer.writerow([vid_id, video["location"], fg_model, "SKIPPED", "Already exists", time.strftime("%Y-%m-%d %H:%M:%S")])
                continue

            print(f"\n🎬 Generating Video {vid_id}: {video['location']}")

            try:
                # Generate full boot shot video (single call, no compositing needed)
                print("  Generating boot shot video...")
                full_video_url = generate_clip(
                    build_perfect_boot_shot_prompt(video),  # Use build_full_boot_story_prompt for 8-shot version
                    fg_model,
                    HOOK_DURATION,
                    reference_image_url=face_url,
                    lip_sync=True,
                    audio_url=audio_url,
                    motion_bucket=3,
                    ref_strength=0.85
                )
                
                # Save final video
                download_file(full_video_url, str(output_file))
                
                print(f"✅ Video {vid_id} saved to {output_file}")
                log_writer.writerow([
                    vid_id, video["location"], fg_model,
                    "SUCCESS", "", time.strftime("%Y-%m-%d %H:%M:%S")
                ])
                logf.flush()

            except Exception as e:
                error_msg = str(e)[:200]
                print(f"❌ Video {vid_id} failed: {error_msg}")
                log_writer.writerow([
                    vid_id, video["location"], fg_model,
                    "FAILED", error_msg, time.strftime("%Y-%m-%d %H:%M:%S")
                ])
                logf.flush()
                continue

    print("\n🎉 Batch generation complete! Check outputs/ folder for results.")
    print("Log file saved to modelark_generation_log.csv")
