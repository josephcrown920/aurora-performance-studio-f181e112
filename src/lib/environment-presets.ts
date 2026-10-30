import crimson from "@/assets/studio-worlds/crimson.jpg.asset.json";
import pink from "@/assets/studio-worlds/pink.jpg.asset.json";
import purple from "@/assets/studio-worlds/purple.jpg.asset.json";
import redRoom from "@/assets/studio-worlds/red-room.jpg.asset.json";
import spotlight from "@/assets/studio-worlds/spotlight.jpg.asset.json";
import teal from "@/assets/studio-worlds/teal.jpg.asset.json";
import white from "@/assets/studio-worlds/white.jpg.asset.json";
import street from "@/assets/studio-worlds/street.jpg.asset.json";
import villa from "@/assets/environments/lagos-villa.jpg";
import carPark from "@/assets/environments/car-park.jpg";
import parkingLot from "@/assets/environments/parking-lot.jpg";
import court from "@/assets/environments/basketball-court.jpg";
import nightclub from "@/assets/environments/nightclub.jpg";
import graffitiColor from "@/assets/environments/graffiti-color.jpg";
import graffitiNight from "@/assets/environments/graffiti-night.jpg";
import playground from "@/assets/environments/playground.jpg";
import surrealIslands from "@/assets/environments/surreal-islands.jpg";
import surrealMirror from "@/assets/environments/surreal-mirror.jpg";
import beachClub from "@/assets/environments/lagos-beach-club.jpg";
import beachSunset from "@/assets/environments/lagos-beach-sunset.jpg";
import museum from "@/assets/environments/art-museum.jpg";
import danfo from "@/assets/environments/lagos-danfo-street.jpg";
import marina from "@/assets/environments/lagos-marina.jpg";
import lekki from "@/assets/environments/lekki-bridge.jpg";
import cinema from "@/assets/environments/deluxe-cinema.jpg";
import wardrobeWarm from "@/assets/environments/wardrobe-warm.jpg";
import wardrobeModern from "@/assets/environments/wardrobe-modern.jpg";
import bedroom from "@/assets/environments/bedroom.jpg";
import vanity from "@/assets/environments/vanity.jpg";
import hotelSuite from "@/assets/environments/hotel-suite.jpg";

import int_rolls from "@/assets/environments/interior-rolls.jpg";
import int_jet from "@/assets/environments/interior-jet.jpg";
import int_maybach from "@/assets/environments/interior-maybach.jpg";
import int_gwagon from "@/assets/environments/interior-gwagon.jpg";
import int_limo from "@/assets/environments/interior-limo.jpg";
import int_yacht from "@/assets/environments/interior-yacht.jpg";
import int_lambo from "@/assets/environments/interior-lambo.jpg";
import int_bentley from "@/assets/environments/interior-bentley.jpg";

export type EnvironmentCategory = "Luxury Interiors" | "Color Studios" | "Lagos" | "Urban & Street" | "Surreal" | "Museum & Art" | "Indoor Rooms" | "Walk-in Wardrobes";
export interface EnvironmentPreset { id: string; label: string; category: EnvironmentCategory; image: string; prompt: string }

const e = (id: string, label: string, category: EnvironmentCategory, image: string, prompt: string): EnvironmentPreset => ({ id, label, category, image, prompt });

export const PERFORM_ENVIRONMENTS: EnvironmentPreset[] = [
  e("crimson", "Crimson studio", "Color Studios", crimson.url, "seamless crimson red cyclorama studio with soft key light"),
  e("purple", "Royal purple", "Color Studios", purple.url, "seamless royal purple cyclorama studio with glow lighting"),
  e("teal", "Teal studio", "Color Studios", teal.url, "seamless teal cyclorama studio, clean even light"),
  e("pink", "Hot pink", "Color Studios", pink.url, "seamless hot pink cyclorama studio"),
  e("white", "Clean white", "Color Studios", white.url, "bright seamless white infinity cove studio"),
  e("spotlight", "Spotlight", "Color Studios", spotlight.url, "dark studio with a single dramatic overhead spotlight"),
  e("red-room", "Red room", "Color Studios", redRoom.url, "moody red-lit room set"),
  e("lagos-villa", "Lagos villa", "Lagos", villa, "gated modern Lagos villa driveway at dusk with palm trees"),
  e("danfo-street", "Danfo street", "Lagos", danfo, "busy Lagos street with yellow danfo buses and market stalls"),
  e("marina", "Marina waterfront", "Lagos", marina, "Lagos Marina waterfront promenade at night with skyline"),
  e("lekki-bridge", "Lekki bridge", "Lagos", lekki, "Lekki-Ikoyi link bridge lit at night"),
  e("beach-club", "Beach club", "Lagos", beachClub, "Lagos private beach club with white sand, palms and cabanas"),
  e("beach-sunset", "Atlantic sunset", "Lagos", beachSunset, "Lagos Atlantic beach at sunset with colorful wooden boats"),
  e("car-park", "Car park", "Urban & Street", carPark, "underground car park with teal fluorescent light"),
  e("parking-lot", "Parking lot", "Urban & Street", parkingLot, "open-air parking lot at night with sodium lamps, wet asphalt"),
  e("court", "Basketball court", "Urban & Street", court, "outdoor Lagos basketball court at night under floodlights"),
  e("nightclub", "Nightclub entrance", "Urban & Street", nightclub, "outside an upscale nightclub entrance with neon and velvet rope"),
  e("cinema", "Deluxe cinema", "Urban & Street", cinema, "outside a deluxe cinema at night, glowing marquee and red carpet"),
  e("graffiti-color", "Graffiti wall", "Urban & Street", graffitiColor, "vibrant colorful graffiti wall alley in daylight"),
  e("graffiti-night", "Neon graffiti", "Urban & Street", graffitiNight, "dark graffiti wall lit by purple neon tube"),
  e("street", "Night street", "Urban & Street", street.url, "city street at night with practical lights"),
  e("playground", "Playground", "Urban & Street", playground, "colorful playground with swings and slide at golden hour"),
  e("surreal-islands", "Floating islands", "Surreal", surrealIslands, "surreal floating islands in a pastel purple sky with a giant moon"),
  e("surreal-mirror", "Mirror desert", "Surreal", surrealMirror, "surreal mirror desert with floating doorways"),
  e("museum", "Art museum", "Museum & Art", museum, "modern art museum gallery with white walls and abstract paintings"),
];

export const GRWM_ENVIRONMENTS: EnvironmentPreset[] = [
  e("wardrobe", "Walk-in wardrobe", "Walk-in Wardrobes", wardrobeWarm, "luxury walk-in wardrobe with warm lit wooden shelves, hanging clothes, sneaker wall and full-length mirror"),
  e("wardrobe-modern", "Black glass closet", "Walk-in Wardrobes", wardrobeModern, "modern black and glass walk-in closet with LED-lit shelves and designer bags"),
  e("vanity", "Vanity mirror", "Indoor Rooms", vanity, "glam dressing room with bulb-lit vanity mirror"),
  e("bedroom", "Bedroom", "Indoor Rooms", bedroom, "stylish modern bedroom with soft morning light and full-length mirror"),
  e("hotel-suite", "Penthouse suite", "Indoor Rooms", hotelSuite, "luxury penthouse suite living room with night city view"),
  e("purple", "Purple studio", "Color Studios", purple.url, "seamless royal purple cyclorama studio with glow lighting"),
];

export function absoluteUrl(src: string) {
  if (/^https?:|^data:|^blob:/.test(src) || typeof window === "undefined") return src;
  return new URL(src, window.location.origin).toString();
}

export const LUXURY_INTERIORS: EnvironmentPreset[] = [
  e("int-maybach", "Maybach rear seat", "Luxury Interiors", int_maybach, "Mercedes-Maybach rear cabin, white quilted leather, purple ambient light, night city through window"),
  e("int-rolls", "Rolls-Royce starlight", "Luxury Interiors", int_rolls, "Rolls-Royce Phantom rear cabin, starlight headliner, cream quilted leather, wood veneer"),
  e("int-bentley", "Bentley tan leather", "Luxury Interiors", int_bentley, "Bentley Bentayga rear cabin, tan diamond-quilted leather, rose gold accents, daylight"),
  e("int-gwagon", "G-Wagon red night", "Luxury Interiors", int_gwagon, "G-Wagon interior, black and red diamond-stitched leather, red ambient light, night"),
  e("int-lambo", "Lamborghini Urus", "Luxury Interiors", int_lambo, "Lamborghini Urus interior, orange and black leather, glowing dashboard, night city"),
  e("int-limo", "Neon limousine", "Luxury Interiors", int_limo, "stretch limousine interior, black leather, purple LED ceiling, bar"),
  e("int-jet", "Private jet", "Luxury Interiors", int_jet, "private jet cabin, beige leather club seats, sunset through oval windows"),
  e("int-yacht", "Yacht salon", "Luxury Interiors", int_yacht, "luxury yacht salon, white sofas, teak floor, ocean at golden hour"),
];
