// Seed data from the NBA Josh Lagos 40 script.
export type Lagos40Location = { id: number; location: string; outfit: string; eatery: string; vibe: string; ending: string; flair: string };
export const JOSH_CHARACTER = "NBA Josh: Young Nigerian man, lean muscular build, thick dark locs/dreads with bright crimson red tips (styled either in a high top knot bun or loose falling to his shoulders), full trimmed goatee, deep set dark eyes, small diamond stud in his left ear.\n\nTattoos (all correctly readable, never mirrored/reversed):\n- Right upper arm: Vertical old English text \"NBA JOSH\" running down the bicep, 3 small 5-point stars above the \"NBA\" letters\n- Left arm: Full tattoo sleeve with cloud/scale patterns, star motifs, and cursive script tattoos\n- Right wrist/forearm: Rose tattoo\n- Left inner forearm: Angel figure tattoo\n- Left wrist/forearm: Cursive \"Met & Lit\" script tattoo\n\nJewelry:\n- Thick fully iced silver cuban link chain with stacked \"NBA JOSH\" block letter pendant, small star next to the \"A\" in NBA, \"444\" engraved at the bottom of the pendant\n- Fully iced out round face watch with a spiked crown of thorns frame around the dial, dark blue Arabic numerals on the watch face";
export const LYRIC_LINES: string[] = [
 "To the feds, I just duck and roll",
 "or slide and jump, like it's COD take all loaded guns",
 "And I ain't on the run",
 "But the feds, they go see you, act like they lost they memory or something",
 "talking about ain't you the one??",
 "Yeah yeah and I'm still the one, I'm Finna rule my Gun",
 "I ain't never fuck with no thot thot thot thot",
 "Let's have some fun, No diddy, come chill with me get litty"
];
export const LAGOS40_LOCATIONS: Lagos40Location[] = [
 {
  "id": 1,
  "location": "Surulere, outside a suya spot",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local suya restaurant",
  "vibe": "Golden hour sunset, smoke from the suya grill in the air, danfo buses parked on the side",
  "ending": "casually walks out of frame to the right",
  "flair": "Suya vendor standing in the far background"
 },
 {
  "id": 2,
  "location": "Victoria Island, outside a fancy rooftop restaurant",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Fancy rooftop eatery",
  "vibe": "Blue hour dusk, city skyline lights coming on",
  "ending": "walks into the bar, holds the door open",
  "flair": "Luxury SUV parked behind you on the street, 'MuddyHits' text watermark in corner"
 },
 {
  "id": 3,
  "location": "Ikeja, outside a popular amala joint",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Popular amala restaurant",
  "vibe": "Warm dusk light, plates of amala and ewedu on a nearby table",
  "ending": "greets the barber with a head nod as he walks off",
  "flair": "Local customers eating at plastic tables in background"
 },
 {
  "id": 4,
  "location": "Lekki Phase 1, sunset beach road",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Beach bar",
  "vibe": "Sunset golden hour, ocean visible behind palm trees",
  "ending": "walks into the studio door",
  "flair": "Surfboard leaning against a wall near you"
 },
 {
  "id": 5,
  "location": "Yaba, outside a streetwear shop",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Fast food spot next to the shop",
  "vibe": "Late night, neon shop signs glowing wet pavement after rain",
  "ending": "hops on an okada (motorcycle) ride as he leaves",
  "flair": "Custom ankara jackets hanging in the shop window"
 },
 {
  "id": 6,
  "location": "Festac Town, 24hr cold room",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Late night fried rice spot",
  "vibe": "Midnight, fluorescent light from the cold room",
  "ending": "gets into his grey Dodge Challenger parked out front",
  "flair": "Street vendor selling cold drinks on the sidewalk"
 },
 {
  "id": 7,
  "location": "Oniru, outside a concert venue",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Food truck outside the venue",
  "vibe": "Pre-show golden hour, concert marquee sign with your name",
  "ending": "greets the barber with a head nod as he walks off",
  "flair": "Line of fans waiting to get in behind you"
 },
 {
  "id": 8,
  "location": "Ajah, local bakery",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Bakery",
  "vibe": "Early morning, sunrise light, smell of fresh bread",
  "ending": "carries a stack of custom show posters as he leaves",
  "flair": "Stack of puff puff on a counter next to you"
 },
 {
  "id": 9,
  "location": "Oshodi, busy market street",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local canteen",
  "vibe": "Dawn, market stalls setting up",
  "ending": "hops on an okada (motorcycle) ride as he leaves",
  "flair": "Danfo buses passing in the far background"
 },
 {
  "id": 10,
  "location": "Banana Island, mansion gate",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Private estate restaurant",
  "vibe": "Golden hour sunset, luxury homes behind you",
  "ending": "walks down a forest path away from the camera",
  "flair": "Your grey Dodge Challenger parked at the gate next to the mic"
 },
 {
  "id": 11,
  "location": "Ikoyi, upscale cocktail bar",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Fancy cocktail bar",
  "vibe": "Blue hour dusk, warm neon bar sign glow",
  "ending": "walks into the bar, holds the door open",
  "flair": "'MuddyHits' text watermark in corner"
 },
 {
  "id": 12,
  "location": "Gbagada, barbershop",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Local shawarma spot next to the barber shop",
  "vibe": "Late night, neon barber pole sign",
  "ending": "greets the barber with a head nod as he walks off",
  "flair": "Barber standing in the shop doorway behind you"
 },
 {
  "id": 13,
  "location": "Mushin, local music studio",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Late night jollof rice spot",
  "vibe": "Midnight, hand-painted 'Afrobeats Studio' sign glowing",
  "ending": "walks into the studio door",
  "flair": "Studio speaker stack visible in the background"
 },
 {
  "id": 14,
  "location": "Apapa port area",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local street food canteen",
  "vibe": "Golden hour sunset, container trucks in background",
  "ending": "hops on an okada (motorcycle) ride as he leaves",
  "flair": "Okada driver waiting for him on the sidewalk"
 },
 {
  "id": 15,
  "location": "Maryland, shopping mall",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Food court exit",
  "vibe": "Late night, mall lights reflecting on wet pavement",
  "ending": "gets into his grey Dodge Challenger parked out front",
  "flair": "Your face on a billboard for MuddyHits above the mall entrance"
 },
 {
  "id": 16,
  "location": "Ilupeju, ankara fashion shop",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Local meat pie bakery",
  "vibe": "Warm afternoon sunlight",
  "ending": "holds up a custom ankara jacket as he walks off",
  "flair": "Mannequins with ankara designs outside the shop"
 },
 {
  "id": 17,
  "location": "Magodo residential estate",
  "outfit": "shirtless, black leather pants, gold iced watch, iced chain",
  "eatery": "Private estate restaurant",
  "vibe": "Golden hour sunset, bungalows with red roofs",
  "ending": "walks into the gate of a luxury home",
  "flair": "White dog walking in the background"
 },
 {
  "id": 18,
  "location": "Ogba, print shop",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Late night indomie spot",
  "vibe": "Midnight, neon 'PHARMACY' sign next door",
  "ending": "carries a stack of custom show posters as he leaves",
  "flair": "Your album posters displayed in the shop window"
 },
 {
  "id": 19,
  "location": "Badagry coastal town",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Seafood restaurant",
  "vibe": "Sunset golden hour, coconut trees, ocean view",
  "ending": "holds red baseball bat over his shoulder as he walks off",
  "flair": "Old colonial-style buildings in the background"
 },
 {
  "id": 20,
  "location": "Lekki Conservation area",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Outdoor jungle restaurant",
  "vibe": "Golden hour, tall palm trees, greenery",
  "ending": "walks down a forest path away from the camera",
  "flair": "Monkeys climbing trees in the far background"
 },
 {
  "id": 21,
  "location": "Ikorodu, outside a local football viewing center",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Street food spot next to the viewing center",
  "vibe": "Match night, blue hour, TV light glowing from inside",
  "ending": "casually walks out of frame to the right",
  "flair": "People cheering inside, TV visible through the window"
 },
 {
  "id": 22,
  "location": "Ikotun, outside a popular church entrance",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Food vendor outside the church",
  "vibe": "Sunday morning, bright sunlight, church crowd",
  "ending": "walks into the bar, holds the door open",
  "flair": "Church sign, ushers standing by the door"
 },
 {
  "id": 23,
  "location": "Ojota, busy interchange",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local roadside canteen",
  "vibe": "Rush hour dusk, traffic lights, danfo buses",
  "ending": "greets the barber with a head nod as he walks off",
  "flair": "Traffic of danfo buses with headlights on in distance"
 },
 {
  "id": 24,
  "location": "Agege, outside a bread bakery",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Bakery",
  "vibe": "Early morning sunrise, fresh bread smell",
  "ending": "holds up a custom ankara jacket as he walks off",
  "flair": "Giant stacks of Agege bread on display"
 },
 {
  "id": 25,
  "location": "Oworonshoki, waterfront street",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Street seafood spot",
  "vibe": "Dusk, lagoon view, canoes in the distance",
  "ending": "walks into the studio door",
  "flair": "Canoes on the lagoon in the background"
 },
 {
  "id": 26,
  "location": "Abule Egba, outside a popular mechanic shop",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local canteen next to the shop",
  "vibe": "Late afternoon, car engines, grease, golden light",
  "ending": "gets into his grey Dodge Challenger parked out front",
  "flair": "Cars being repaired, your Challenger in the lot"
 },
 {
  "id": 27,
  "location": "Alimosho, outside a video rental shop",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Street food spot",
  "vibe": "Retro 90s vibe, dusk, old Nollywood posters",
  "ending": "walks down a forest path away from the camera",
  "flair": "Old Nollywood movie posters on the walls"
 },
 {
  "id": 28,
  "location": "Isolo, outside a fashion design studio",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Local shawarma spot",
  "vibe": "Warm afternoon, tailor working in the window",
  "ending": "holds up a custom ankara jacket as he walks off",
  "flair": "Custom made agbada outfits on mannequins"
 },
 {
  "id": 29,
  "location": "Okota, outside a local pharmacy",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Late night indomie spot",
  "vibe": "Midnight, glowing green pharmacy sign, wet street",
  "ending": "carries a stack of custom show posters as he leaves",
  "flair": "Neon 'PHARMACY' sign glowing at night"
 },
 {
  "id": 30,
  "location": "Ketu, bustling market street",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local canteen",
  "vibe": "Market day, midday, women selling fruits and vegetables",
  "ending": "casually walks out of frame to the right",
  "flair": "Women selling fruits and vegetables on the sidewalk"
 },
 {
  "id": 31,
  "location": "Mile 2, highway overpass",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Roadside suya spot",
  "vibe": "Sunset, highway traffic, okadas",
  "ending": "holds red baseball bat over his shoulder as he walks off",
  "flair": "Traffic of okada (motorcycles) in the distance"
 },
 {
  "id": 32,
  "location": "Iyana Ipaja, outside a popular hotel",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Hotel restaurant",
  "vibe": "Blue hour, hotel neon sign, valet",
  "ending": "walks into the bar, holds the door open",
  "flair": "Hotel sign, valet standing by the entrance"
 },
 {
  "id": 33,
  "location": "Ilashe, beach resort street",
  "outfit": "shirtless, black leather pants, gold iced watch, iced chain",
  "eatery": "Beach restaurant",
  "vibe": "Golden hour, beach umbrellas, ocean breeze",
  "ending": "walks down a forest path away from the camera",
  "flair": "Beach umbrellas, ocean breeze moving palm trees"
 },
 {
  "id": 34,
  "location": "Marina, downtown Lagos",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Upscale restaurant",
  "vibe": "Night time, tall glass buildings, city lights",
  "ending": "gets into his grey Dodge Challenger parked out front",
  "flair": "Tall office buildings with glass facades, city lights"
 },
 {
  "id": 35,
  "location": "Jibowu, outside a popular eba soup spot",
  "outfit": "black BAPE shark logo short sleeve t-shirt, tan distressed ripped jeans with frayed hems, silver pocket chain, large silver belt buckle, white Air Force 1 sneakers",
  "eatery": "Local eba soup spot",
  "vibe": "Dusk, locals sitting at plastic tables",
  "ending": "greets the barber with a head nod as he walks off",
  "flair": "Locals sitting at plastic tables eating"
 },
 {
  "id": 36,
  "location": "Fadeyi, outside a vintage record shop",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Local shawarma spot",
  "vibe": "Retro afternoon, old Afrobeat vinyls on display",
  "ending": "holds up a custom ankara jacket as he walks off",
  "flair": "Old Afrobeat vinyl records displayed in the window"
 },
 {
  "id": 37,
  "location": "Iponri, outside a gym entrance",
  "outfit": "shirtless, black leather pants, gold iced watch, iced chain",
  "eatery": "Protein shake bar next to the gym",
  "vibe": "Early morning sunrise, gym lights",
  "ending": "walks into the gate of a luxury home",
  "flair": "Guys lifting weights visible through the glass door"
 },
 {
  "id": 38,
  "location": "Surulere, outside a popular club",
  "outfit": "orange/red gradient thermal puffer jacket, black stacked distressed ripped jeans, neon green/orange Nike Air Max Plus sneakers",
  "eatery": "Club entrance",
  "vibe": "Late night, club neon signs, line of people",
  "ending": "walks into the bar, holds the door open",
  "flair": "Line of people waiting to get in, bouncer at the door"
 },
 {
  "id": 39,
  "location": "Lekki Conservation area",
  "outfit": "white 'HABIT 00' basketball jersey, red cargo pants with zip details, blue/black Jordan sneakers, iced cuban link chain",
  "eatery": "Outdoor jungle restaurant",
  "vibe": "Midday, bright sunlight, green jungle, wildlife",
  "ending": "casually walks out of frame to the right",
  "flair": "Monkeys, tall palm trees, greenery"
 },
 {
  "id": 40,
  "location": "Tarkwa Bay, beach street",
  "outfit": "sleeveless black graphic tee, black cargo shorts, blue satin durag, iced chain",
  "eatery": "Beach bar",
  "vibe": "Sunset, waves, surfboards",
  "ending": "carries a stack of custom show posters as he leaves",
  "flair": "Surfboards leaning against a wall, ocean waves in background"
 }
];
