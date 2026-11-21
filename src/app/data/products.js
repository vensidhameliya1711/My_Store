export const PRODUCTS = [
  {
    id: 1,
    name: "The Catalyzer",
    category: "Tops",
    price: 16.00,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    description: "A premium comfort fit crew neck tee made from 100% organic long-staple cotton. Perfect for layering or wearing on its own.",
    details: "Designed with modern comfort in mind, The Catalyzer tee features a refined fit, reinforced shoulder seams, and a soft-ribbed collar. It is pre-shrunk and garment-washed for a buttery soft hand-feel right out of the box.",
    rating: 4.8,
    reviewsCount: 142,
    colors: ["#ffffff", "#22252a", "#a3b899"],
    colorNames: ["White", "Charcoal", "Sage Green"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    features: [
      "100% Organic Certified Cotton",
      "Ethically Sourced & Manufactured",
      "Reinforced neck ribbon and cover-stitched seams",
      "Garment washed for ultimate softness"
    ],
    specifications: [
      { label: "Material", value: "100% Organic Cotton" },
      { label: "Weight", value: "180 GSM" },
      { label: "Fit", value: "Regular Fit" },
      { label: "Origin", value: "Made in India" }
    ]
  },
  {
    id: 2,
    name: "Shooting Stars Sneakers",
    category: "Shoes",
    price: 21.15,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "High-performance lifestyle sneakers that bring together retro running aesthetics and futuristic comfort engineering.",
    details: "Equipped with our signature response-cushioning foam and a breathable mesh upper, the Shooting Stars Sneakers provide all-day comfort. Featuring recycled rubber outsoles for superb traction and a classic low-top profile.",
    rating: 4.6,
    reviewsCount: 88,
    colors: ["#ef4444", "#3b82f6", "#22252a"],
    colorNames: ["Racer Red", "Sporty Blue", "Stealth Black"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
    inStock: true,
    features: [
      "Breathable engineered knit mesh upper",
      "Ultra-responsive foam midsole",
      "Eco-friendly recycled rubber traction outsole",
      "Padded collar and tongue for enhanced support"
    ],
    specifications: [
      { label: "Upper Material", value: "Engineered Mesh & Synthetic Suede" },
      { label: "Sole", value: "Recycled Rubber" },
      { label: "Cushioning", value: "EVA Midsole" },
      { label: "Weight (per shoe)", value: "290g" }
    ]
  },
  {
    id: 3,
    name: "Neptune Sunglasses",
    category: "Accessories",
    price: 12.00,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    description: "Classic round-frame sunglasses offering superior UV protection and a timeless retro-chic silhouette.",
    details: "Engineered with durable cellulose acetate frames and scratch-resistant polarized lenses, Neptune Sunglasses are designed for outdoor comfort and effortless style. Designed with robust metal hinges for longevity.",
    rating: 4.5,
    reviewsCount: 65,
    colors: ["#b45309", "#22252a", "#4b5563"],
    colorNames: ["Amber Tortoise", "Classic Black", "Smoke Gray"],
    sizes: ["One Size"],
    inStock: true,
    features: [
      "100% UVA/UVB polarized protection lenses",
      "Handcrafted bio-acetate frame structure",
      "Hardened 5-barrel metal hinges",
      "Includes microfiber cleaning cloth and protective hard case"
    ],
    specifications: [
      { label: "Lens Type", value: "Polarized CR-39" },
      { label: "Frame Material", value: "Cellulose Acetate" },
      { label: "UV Protection", value: "UV400" },
      { label: "Dimensions", value: "48mm Lens - 22mm Bridge - 145mm Temple" }
    ]
  },
  {
    id: 4,
    name: "The 400 Blows Jacket",
    category: "Outerwear",
    price: 18.40,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    description: "A vintage-inspired distressed leather bomber jacket that adds an instant edge to any outfit.",
    details: "Crafted from premium full-grain vegan leather that naturally resists weather, this classic jacket features a quilted polyester lining, ribbed cuffs, and multiple functional inside and outside pockets. Designed to age beautifully.",
    rating: 4.9,
    reviewsCount: 204,
    colors: ["#7c2d12", "#1f2937"],
    colorNames: ["Dark Brown", "Midnight Black"],
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    features: [
      "Premium heavyweight vegan leather outer shell",
      "Quilted insulation lining for wind and cold resistance",
      "Heavy-duty YKK gunmetal zippers",
      "Ribbed collar, cuffs, and hem"
    ],
    specifications: [
      { label: "Outer Shell", value: "Premium PU Leather" },
      { label: "Lining", value: "100% Polyester Satin" },
      { label: "Pockets", value: "2 Handwarmer, 2 Chest, 1 Internal Zip" },
      { label: "Thickness", value: "Heavyweight (Winter-ready)" }
    ]
  },
  {
    id: 5,
    name: "Classic Pink Tee",
    category: "Tops",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
    description: "A lightweight, super-soft crewneck tee featuring a classic cut in an eye-catching pastel pink hue.",
    details: "The Classic Pink Tee offers an ultra-flattering drape with a blend of cotton and modal fibers. Perfect for daily casual wear, it keeps its shape and pastel vibrancy wash after wash.",
    rating: 4.4,
    reviewsCount: 52,
    colors: ["#f472b6", "#fbcfe8"],
    colorNames: ["Pastel Pink", "Light Blush"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
    features: [
      "Super-soft cotton-modal blend fabric",
      "Classic modern fit silhouette",
      "Breathable and moisture-wicking weave",
      "Tagless neck label for irritation-free comfort"
    ],
    specifications: [
      { label: "Material", value: "60% Ring-spun Cotton, 40% Modal" },
      { label: "Weight", value: "150 GSM" },
      { label: "Transparency", value: "Opaque" },
      { label: "Care", value: "Machine wash cold, tumble dry low" }
    ]
  },
  {
    id: 6,
    name: "Urban Boots",
    category: "Shoes",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
    description: "Rugged, water-resistant combat boots built for both city streets and unpredictable weekend trails.",
    details: "Featuring top-grain water-repellent nubuck leather, rustproof speed-lacing eyelets, and a heavy-tread commando sole, the Urban Boots offer reliable stability and insulation. Removable OrthoLite footbeds keep feet fresh.",
    rating: 4.7,
    reviewsCount: 110,
    colors: ["#78350f", "#1e293b"],
    colorNames: ["Tan Nubuck", "Obsidian Black"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    inStock: true,
    features: [
      "Water-resistant nubuck leather upper construction",
      "High-grip rubber lug sole with self-cleaning tread",
      "Shock-absorbing OrthoLite memory foam insole",
      "Gusseted tongue to keep out debris"
    ],
    specifications: [
      { label: "Upper", value: "Water-repellent Nubuck Leather" },
      { label: "Insole", value: "OrthoLite Eco-Plush" },
      { label: "Outsole", value: "Commando Rubber Sole" },
      { label: "Shaft Height", value: "6 inches" }
    ]
  },
  {
    id: 7,
    name: "Minimalist Watch",
    category: "Accessories",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "A sleek, low-profile dress watch featuring a surgical-grade steel case and a genuine Italian leather strap.",
    details: "Driven by a precise Japanese Quartz movement, this minimalist timekeeper boasts a clean matte dial under mineral crystal glass. It is a subtle accent piece that bridges the gap between formal and casual attire.",
    rating: 4.8,
    reviewsCount: 195,
    colors: ["#1e293b", "#e2e8f0"],
    colorNames: ["Midnight Black & Gold", "Silver White & Brown"],
    sizes: ["38mm Dial", "42mm Dial"],
    inStock: true,
    features: [
      "Japanese Miyota Quartz movement",
      "316L surgical-grade stainless steel casing",
      "Genuine quick-release Italian leather strap",
      "Water-resistant up to 3 ATM (splash proof)"
    ],
    specifications: [
      { label: "Movement", value: "Japanese Quartz Miyota" },
      { label: "Case Diameter", value: "40 mm" },
      { label: "Strap Width", value: "20 mm" },
      { label: "Glass", value: "Hardened Mineral Crystal" }
    ]
  },
  {
    id: 8,
    name: "Cozy Fleece Hoodie",
    category: "Outerwear",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
    description: "An ultra-soft fleece-lined hoodie designed for lazy Sundays and chilly evening strolls.",
    details: "Constructed with heavyweight French Terry cotton fleece and featuring double-lined spacious hood, thick drawcords, and a deep kangaroo pocket. Designed for a slightly relaxed, contemporary drop-shoulder fit.",
    rating: 4.7,
    reviewsCount: 167,
    colors: ["#6b7280", "#1e293b", "#374151"],
    colorNames: ["Heather Gray", "Navy Blue", "Charcoal Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    features: [
      "Premium 400g French Terry fleece lining",
      "Double-layered spacious hood with custom drawstrings",
      "Reinforced ribbing at waist cuffs and pocket trim",
      "Kangaroo pocket with secure hidden card compartment"
    ],
    specifications: [
      { label: "Material", value: "85% Cotton, 15% Polyester" },
      { label: "Weight", value: "400 GSM Heavyweight" },
      { label: "Fit", value: "Relaxed Fit / Drop Shoulder" },
      { label: "Care", value: "Machine wash cold inside out" }
    ]
  }
];
