/**
 * Mock / Fallback Recommendation Engine for GiftBro AI
 * Delivers realistic, highly targeted recommendations when LLM API keys are missing or offline.
 */

// Curated gift catalog with multi-dimensional attributes
const GIFT_CATALOG = [
  // HIKING / SCI-FI / BOARD GAMES (Case 1 & related)
  {
    name: "Dune: Imperium – Board Game",
    category: "Board Games & Sci-Fi",
    price_range: "$50-$60",
    match_score: 96,
    tags: ["sci-fi", "board games", "brother", "strategy", "books"],
    reasoning: "Blends his love for sci-fi literature and high-depth board games without adding clutter to his outdoor gear.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "National Parks Pass Enamel Trail Map Scratch-Off Poster",
    category: "Outdoors & Decor",
    price_range: "$25-$35",
    match_score: 93,
    tags: ["hiking", "outdoors", "brother", "adventure"],
    reasoning: "Celebrates his hiking memories without buying redundant gear he already owns.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Project Hail Mary (Special Illustrated Hardcover by Andy Weir)",
    category: "Sci-Fi Books",
    price_range: "$30-$40",
    match_score: 92,
    tags: ["sci-fi", "books", "reading", "brother"],
    reasoning: "A modern sci-fi masterpiece by the author of The Martian that any sci-fi devotee will binge in a weekend.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Scout Ultralight Camp Cocktail & Spice Kit",
    category: "Camping & Novelty",
    price_range: "$35-$45",
    match_score: 89,
    tags: ["hiking", "camping", "outdoors", "drinks"],
    reasoning: "A compact, lightweight twist for trailhead celebrations that doesn't duplicate standard hiking gear.",
    is_gear: true,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "The Crew: Mission Deep Sea (Co-op Sci-Fi Card Game)",
    category: "Board Games",
    price_range: "$15-$20",
    match_score: 88,
    tags: ["board games", "sci-fi", "brother", "portable"],
    reasoning: "Pocket-sized cooperative trick-taking game that packs onto camping trips and provides endless puzzle gameplay.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Stargazing Night Pass at Dark Sky Preserve / Planetarium",
    category: "Experiences",
    price_range: "$30-$50",
    match_score: 91,
    tags: ["sci-fi", "hiking", "outdoors", "experience"],
    reasoning: "Connects his hiking spirit with cosmic wonder for a clutter-free memory.",
    is_gear: false,
    is_clothing: false,
    is_experience: true,
    is_unique: true,
  },
  {
    name: "Topo Map Custom Engraved Stainless Steel Flask",
    category: "Outdoors Lifestyle",
    price_range: "$30-$40",
    match_score: 86,
    tags: ["hiking", "outdoors", "custom"],
    reasoning: "Engraved with topographic contours of popular mountain peaks, functional and stylish.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Spacecraft: 100 Years of Sci-Fi Architecture & Blueprint Book",
    category: "Art & Sci-Fi",
    price_range: "$40-$50",
    match_score: 85,
    tags: ["sci-fi", "art", "books"],
    reasoning: "Deep dive into fictional starships with gorgeous technical cutaways.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },

  // MOM / COOKING / GARDENING / MYSTERY (Case 2 & related)
  {
    name: "Artisan Heirloom Seed Vault & Copper Plant Markers",
    category: "Gardening & Lifestyle",
    price_range: "$35-$45",
    match_score: 97,
    tags: ["mom", "gardening", "nature", "plants"],
    reasoning: "Consumable heirloom varieties with elegant reusable copper markers—enhances her garden without kitchen clutter.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Single-Origin Small-Batch Finishing Olive Oil & Vinegar Duo",
    category: "Gourmet Pantry",
    price_range: "$48-$65",
    match_score: 95,
    tags: ["mom", "cooking", "food", "gourmet"],
    reasoning: "A luxurious consumable ingredient she wouldn't buy for herself that elevates weekday dinners in seconds.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "The Thursday Murder Club Hardcover Mystery Set (by Richard Osman)",
    category: "Mystery Books",
    price_range: "$38-$50",
    match_score: 94,
    tags: ["mom", "mystery novels", "books", "reading"],
    reasoning: "Charming, witty British retirement village mystery novels perfect for relaxing after busy workdays.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Japanese Hori Hori Stainless Garden Weeding Knife with Leather Sheath",
    category: "Garden Tools",
    price_range: "$32-$42",
    match_score: 91,
    tags: ["mom", "gardening", "tools"],
    reasoning: "The ultimate multitasking gardening hand tool—replaces 4 bulky tools with one heritage-quality heirloom.",
    is_gear: true,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Custom Herb Garden Slate Markers & Botanical Hand Salve",
    category: "Wellness & Gardening",
    price_range: "$28-$36",
    match_score: 89,
    tags: ["mom", "gardening", "wellness", "relaxation"],
    reasoning: "Nourishes hardworking hands after gardening and office hours with organic beeswax and lavender.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Artisan Bread Making Masterclass Online Voucher",
    category: "Experiences",
    price_range: "$55-$75",
    match_score: 90,
    tags: ["mom", "cooking", "experience"],
    reasoning: "Self-paced sourdough masterclass with zero kitchen appliances required.",
    is_gear: false,
    is_clothing: false,
    is_experience: true,
    is_unique: true,
  },
  {
    name: "Agatha Christie 'And Then There Were None' Clothbound Collector's Edition",
    category: "Mystery Books",
    price_range: "$25-$35",
    match_score: 88,
    tags: ["mom", "mystery novels", "books"],
    reasoning: "A stunning keepsake edition of the definitive queen of crime mystery.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },

  // TECH FOUNDER / MINIMALISM / ZERO CLUTTER (Case 3 & related)
  {
    name: "Peak Design Micro Field Pouch / Cord Organizer",
    category: "Productivity & Tech",
    price_range: "$35-$45",
    match_score: 96,
    tags: ["coworker", "founder", "tech", "minimalism", "organization"],
    reasoning: "Compressible, sleek, ultra-minimalist cord storage that eliminates desk clutter for a mobile founder.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Specialty Roaster Single-Origin Whole Bean Coffee Tasting Box",
    category: "Consumables & Coffee",
    price_range: "$28-$38",
    match_score: 95,
    tags: ["coworker", "founder", "coffee", "minimalism"],
    reasoning: "100% zero-waste consumable luxury from an ethical third-wave micro-roaster. Fuel without clutter.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Midori MD Minimalist Grid Notebook & Brass Bullet Pen",
    category: "Desk & Stationery",
    price_range: "$25-$35",
    match_score: 92,
    tags: ["coworker", "founder", "stationery", "minimalism"],
    reasoning: "Japanese bleed-free fountain paper designed solely for high-leverage brainstorming, free of corporate logos.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Audible or Blinkist 3-Month Premium Knowledge Subscription",
    category: "Digital Experience",
    price_range: "$30-$40",
    match_score: 90,
    tags: ["coworker", "founder", "reading", "experience", "digital"],
    reasoning: "Zero physical footprint; empowers rapid founder learning during commutes and workouts.",
    is_gear: false,
    is_clothing: false,
    is_experience: true,
    is_unique: false,
  },
  {
    name: "Ceramic Minimalist Desk Catchall Tray with Matte Glaze",
    category: "Desk Accessories",
    price_range: "$20-$30",
    match_score: 87,
    tags: ["coworker", "founder", "minimalism", "desk"],
    reasoning: "Keeps keys and watch tidy with clean Scandinavian lines and zero branding.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Ember Temperature Control Travel Coaster",
    category: "Tech Gadgets",
    price_range: "$35-$45",
    match_score: 85,
    tags: ["coworker", "founder", "tech", "coffee"],
    reasoning: "Keeps desk beverage at precisely 135°F during back-to-back pitch meetings.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Handcrafted Dark Chocolate Single-Origin Flight (70%-85%)",
    category: "Gourmet Consumable",
    price_range: "$24-$32",
    match_score: 84,
    tags: ["coworker", "founder", "chocolate", "minimalism"],
    reasoning: "Sophisticated stress-relief treat that leaves zero desk residue or junk behind.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },

  // 5-YEAR-OLD DAUGHTER / DINOSAURS / BLOCKS / STEM (Case 4 & related)
  {
    name: "National Geographic Real Dinosaur Fossil Excavation Kit",
    category: "STEM & Discovery",
    price_range: "$18-$25",
    match_score: 98,
    tags: ["daughter", "kids", "5-year-old", "dinosaurs", "learning", "science"],
    reasoning: "An active discovery experience rather than just another toy—she gets to chip out authentic mosasaur teeth and T-rex bones.",
    is_gear: false,
    is_clothing: false,
    is_experience: true,
    is_unique: true,
  },
  {
    name: "Plus-Plus BIG Dinosaur Building Blocks Tube (Safe 5yo Size)",
    category: "Building & STEM",
    price_range: "$20-$28",
    match_score: 95,
    tags: ["daughter", "kids", "5-year-old", "building blocks", "dinosaurs"],
    reasoning: "Danish tactile puzzle blocks that stimulate fine motor skills and 3D geometric creativity.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Pop-Up Prehistoric Encyclopedia: The Definitive Dinosaurs",
    category: "Interactive Books",
    price_range: "$22-$30",
    match_score: 94,
    tags: ["daughter", "kids", "5-year-old", "books", "dinosaurs", "learning"],
    reasoning: "Spectacular 3D paper engineering by Matthew Reinhart that makes learning prehistoric anatomy breathtaking.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Dinosaur Glow-in-the-Dark Constellation Ceiling Lantern Projector",
    category: "Room Decor & Play",
    price_range: "$20-$28",
    match_score: 91,
    tags: ["daughter", "kids", "5-year-old", "dinosaurs", "night light"],
    reasoning: "Turns bedtime into a cozy Jurassic planetarium experience with rotating projection slides.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Local Natural History or Children's Science Museum Day Ticket",
    category: "Experiences",
    price_range: "$25-$35",
    match_score: 92,
    tags: ["daughter", "kids", "experience", "learning", "dinosaurs"],
    reasoning: "A memorable day seeing real life-sized skeletons with parents, creating lasting childhood memories without clutter.",
    is_gear: false,
    is_clothing: false,
    is_experience: true,
    is_unique: true,
  },
  {
    name: "Wooden T-Rex Skeleton 3D Build-and-Paint Puzzle",
    category: "Art & STEM",
    price_range: "$15-$22",
    match_score: 89,
    tags: ["daughter", "kids", "5-year-old", "building blocks", "art"],
    reasoning: "Hands-on craft activity that combines puzzle assembly with water-based non-toxic painting.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Dino Tracks Stamp & Non-Toxic Washable Dough Set",
    category: "Creative Arts",
    price_range: "$16-$22",
    match_score: 86,
    tags: ["daughter", "kids", "dinosaurs", "creative"],
    reasoning: "Allows stamping realistic Velociraptor and Stegosaurus footprints in sensory play dough.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },

  // UNIQUE / WEIRD GIFTS (For "give me something weird" or "unique")
  {
    name: "Authentic Campo del Cielo Meteorite Fragment in Display Case",
    category: "Oddities & Science",
    price_range: "$35-$48",
    match_score: 95,
    tags: ["weird", "unique", "sci-fi", "science", "novelty"],
    reasoning: "A 4.5-billion-year-old piece of outer space iron-nickel asteroid that landed in Argentina.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Carnivorous Venus Flytrap & Pitcher Plant DIY Terrarium Kit",
    category: "Botany & Oddities",
    price_range: "$28-$38",
    match_score: 93,
    tags: ["weird", "unique", "gardening", "plants", "nature"],
    reasoning: "Fascinating biological conversation piece that catches fruit flies naturally.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Levitating Magnetic Bonsai Planter",
    category: "Decor & Tech",
    price_range: "$55-$75",
    match_score: 90,
    tags: ["weird", "unique", "tech", "plants", "minimalism"],
    reasoning: "Floating magnetic induction pot that slowly rotates in mid-air over a wooden base.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },
  {
    name: "Bioluminescent Bio-Orb (Glowing Dinoflagellate Micro-Aquarium)",
    category: "Living Art & Science",
    price_range: "$45-$60",
    match_score: 92,
    tags: ["weird", "unique", "science", "ocean", "nature"],
    reasoning: "A hand-blown glass sphere filled with natural marine algae that lights up neon blue when swirled at night.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: true,
  },

  // BUDGET-FRIENDLY & CHEAP GIFTS (For "cheaper", "under $40", "under $20")
  {
    name: "Retro Game Boy Enamel Keychain & Multi-Tool Charm",
    category: "Accessories & Gaming",
    price_range: "$12-$18",
    match_score: 91,
    tags: ["cheaper", "cheap", "gaming", "brother", "sci-fi"],
    reasoning: "Fun nostalgic accessory that won't break the bank and looks great on daily bags.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Gourmet Hot Sauce Micro-Batch Tasting Trio",
    category: "Culinary & Snacks",
    price_range: "$18-$24",
    match_score: 89,
    tags: ["cheaper", "cheap", "cooking", "food", "consumable"],
    reasoning: "Flavor-packed culinary treat that adds excitement to any pantry without clutter.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Waterproof Floating Trail Keychain & Compass Capsule",
    category: "Outdoors",
    price_range: "$12-$16",
    match_score: 88,
    tags: ["cheaper", "cheap", "hiking", "outdoors"],
    reasoning: "Inexpensive, ultra-practical emergency backup for trailhead adventures.",
    is_gear: true,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Pocket Field Notes 3-Pack National Parks Edition",
    category: "Stationery",
    price_range: "$14-$18",
    match_score: 90,
    tags: ["cheaper", "cheap", "hiking", "stationery", "minimalism"],
    reasoning: "Pocket-sized graph paper notebooks featuring vintage national park illustrations.",
    is_gear: false,
    is_clothing: false,
    is_experience: false,
    is_unique: false,
  },

  // CLOTHING EXAMPLES (To verify filtering when "no clothing" is asked)
  {
    name: "Merino Wool Breathable Trail Socks (2-Pack)",
    category: "Apparel & Hiking",
    price_range: "$28-$36",
    match_score: 85,
    tags: ["hiking", "clothing", "socks", "outdoors"],
    reasoning: "Cushioned seamless merino socks for high mileage.",
    is_gear: false,
    is_clothing: true,
    is_experience: false,
    is_unique: false,
  },
  {
    name: "Vintage Botanical Canvas Gardening Apron",
    category: "Apparel & Gardening",
    price_range: "$30-$40",
    match_score: 84,
    tags: ["mom", "gardening", "clothing", "apron"],
    reasoning: "Heavyweight utility apron with deep reinforced pockets for pruners and twine.",
    is_gear: false,
    is_clothing: true,
    is_experience: false,
    is_unique: false,
  }
];

/**
 * Heuristic Matcher that generates recommendations based on recipient text and constraints
 */
export function generateMockRecommendations({
  description = '',
  name = '',
  relationship = '',
  age = '',
  budget = '',
  occasion = '',
  userRefinement = '',
  excludedGifts = [],
  pastGifts = []
}) {
  const combinedText = `${description} ${name} ${relationship} ${age} ${budget} ${occasion} ${userRefinement}`.toLowerCase();

  // Parse refinement modifiers
  const isCheaperRequested = /cheap|less expensive|under \$?([0-9]+)|budget friendly|affordable|cut price/i.test(userRefinement);
  const isUniqueRequested = /unique|weird|unusual|quirky|unexpected|different|surprise/i.test(userRefinement);
  const isNoClothingRequested = /no clothing|no clothes|no apparel|no socks|no shirts|no wearables/i.test(userRefinement);
  const isExperienceRequested = /experience|experiences|tickets|activity|classes|outing|event/i.test(userRefinement);

  // Price cap detection
  let priceCap = 999;
  const priceMatch = userRefinement.match(/under\s*\$?([0-9]+)/i);
  if (priceMatch) {
    priceCap = parseInt(priceMatch[1], 10);
  } else if (isCheaperRequested) {
    priceCap = 35;
  }

  // Set of excluded names
  const excludedSet = new Set(
    [...(excludedGifts || []), ...(pastGifts || [])]
      .map(item => (typeof item === 'string' ? item : item.name || '').toLowerCase().trim())
  );

  // Score each catalog item
  const scoredItems = GIFT_CATALOG.filter(item => {
    const itemNameLower = item.name.toLowerCase().trim();
    if (excludedSet.has(itemNameLower)) return false;

    // Filter clothing if requested
    if (isNoClothingRequested && item.is_clothing) return false;

    // Check price bounds
    const lowPriceMatch = item.price_range.match(/\$([0-9]+)/);
    const lowPrice = lowPriceMatch ? parseInt(lowPriceMatch[1], 10) : 30;
    if (lowPrice > priceCap) return false;

    return true;
  }).map(item => {
    let score = item.match_score;

    // Relevance scoring against text
    item.tags.forEach(tag => {
      if (combinedText.includes(tag)) {
        score += 8;
      }
    });

    if (isUniqueRequested && item.is_unique) score += 15;
    if (isExperienceRequested && item.is_experience) score += 20;
    if (isCheaperRequested && (item.tags.includes('cheaper') || item.tags.includes('cheap'))) score += 18;

    // Penalty if gear already owned
    if (combinedText.includes('already has') && combinedText.includes('gear') && item.is_gear) {
      score -= 25;
    }
    if (combinedText.includes('already has') && combinedText.includes('kitchen') && item.tags.includes('kitchen')) {
      score -= 25;
    }
    if (combinedText.includes('already has') && combinedText.includes('toys') && item.category.includes('Play')) {
      score -= 15;
    }

    // Apply price adjustments for "cheaper"
    let displayPrice = item.price_range;
    const itemLowMatch = item.price_range.match(/\$([0-9]+)/);
    const itemLow = itemLowMatch ? parseInt(itemLowMatch[1], 10) : 30;
    if (isCheaperRequested || priceCap < 50) {
      if (itemLow > priceCap) {
        displayPrice = `$${Math.max(10, priceCap - 15)}-$${priceCap}`;
      }
    }

    return {
      ...item,
      price_range: displayPrice,
      dynamic_score: score
    };
  });

  // Sort by dynamic score descending
  scoredItems.sort((a, b) => b.dynamic_score - a.dynamic_score);

  // Take top 6 to 8 items
  const selected = scoredItems.slice(0, 7);

  // If fewer than 6, backfill with top non-clothing general gifts
  if (selected.length < 6) {
    const remaining = GIFT_CATALOG.filter(item => 
      !selected.some(s => s.name === item.name) &&
      !excludedSet.has(item.name.toLowerCase().trim()) &&
      (!isNoClothingRequested || !item.is_clothing)
    );
    for (const item of remaining) {
      selected.push(item);
      if (selected.length >= 6) break;
    }
  }

  // Format final gifts
  const finalGifts = selected.map((g, idx) => ({
    rank: idx + 1,
    name: g.name,
    price_range: g.price_range,
    category: g.category,
    reasoning: g.reasoning,
    match_score: Math.min(99, Math.max(78, 98 - idx * 3))
  }));

  // Generate empathetic summary
  let summary = `Personalized selection curated for ${name || relationship || 'the recipient'}`;
  if (userRefinement) {
    summary += `, refined based on your request: "${userRefinement}".`;
  } else if (description) {
    summary += `, focusing on ${description.slice(0, 70)}...`;
  }

  return {
    recipient_summary: summary,
    gifts: finalGifts
  };
}
