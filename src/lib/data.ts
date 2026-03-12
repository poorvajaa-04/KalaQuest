
import data from './placeholder-images.json';
export const placeholderImages = data.placeholderImages;

export type Artisan = {
  id: string;
  name: string;
  craft: string;
  bio: string;
  image: string;
<<<<<<< HEAD
=======
  userId?: string;
  email?: string;
>>>>>>> 65a6139 (Update fixes for build and inbox)
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  artisanId: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type MysteryQuiz = {
  id: string;
  title: string;
  description: string;
  story: string[];
  questions: QuizQuestion[];
};

export type ArtFormStory = {
  id: string;
  name: string;
  story: string[];
};

export type StateInfo = {
  id: string;
  name: string;
  artForms: ArtFormStory[];
};

export type JobOpportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType: 'Contract' | 'Full-time' | 'Part-time' | 'Freelance';
  postedDate: string; // e.g., "2024-07-25"
  contactEmail: string;
};

export const jobOpportunities: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Mural Painter for Boutique Hotel',
    company: 'The Crimson Palace',
    location: 'Jaipur, Rajasthan',
    description: 'We are seeking a talented artist to design and paint a large-scale mural with traditional Rajasthani motifs for our hotel lobby. The artist should have experience in wall painting and a strong portfolio. This is a contract position with a competitive fee.',
    employmentType: 'Contract',
    postedDate: '2024-07-22',
    contactEmail: 'hr@crimsonpalace.com',
  },
  {
    id: 'job-2',
    title: 'Lead Potter for Ceramics Studio',
    company: 'Earth & Elm Goods',
    location: 'Bengaluru, Karnataka',
    description: 'Our growing studio is looking for an experienced potter to lead workshops and manage studio production. The ideal candidate will be skilled in various pottery techniques and have a passion for teaching. Full-time position with benefits.',
    employmentType: 'Full-time',
    postedDate: '2024-07-20',
    contactEmail: 'careers@earthandelm.com',
  },
  {
    id: 'job-3',
    title: 'Textile Designer (Block Printing)',
    company: 'IndiThreads Collective',
    location: 'Remote/Freelance',
    description: 'We are looking for freelance textile designers specializing in traditional Indian block printing. You will collaborate with our team to create new patterns for our upcoming clothing line. Must have a digital portfolio.',
    employmentType: 'Freelance',
    postedDate: '2024-07-18',
    contactEmail: 'collab@indithreads.co',
  },
  {
    id: 'job-4',
    title: 'Woodworking Apprentice',
    company: 'Sharma & Sons Fine Furniture',
    location: 'Saharanpur, Uttar Pradesh',
    description: 'Learn the art of fine sandalwood and sheesham wood carving from master craftsmen. This is a paid apprenticeship program for passionate individuals looking to build a career in woodworking. No prior experience required, but a strong desire to learn is essential.',
    employmentType: 'Part-time',
    postedDate: '2024-07-15',
    contactEmail: 'apprentice@sharmaandsons.in',
  },
  {
    id: 'job-5',
    title: 'Traditional Jewelry Designer',
    company: 'Kundan Gems',
    location: 'Hyderabad, Telangana',
    description: 'Seeking a creative jewelry designer with expertise in traditional Kundan and Polki work. The role involves designing new collections and custom pieces for high-end clients. Experience with CAD software is a plus.',
    employmentType: 'Full-time',
    postedDate: '2024-07-25',
    contactEmail: 'design@kundangems.com',
  },
  {
    id: 'job-6',
    title: 'Bronze Sculptor for Public Art Project',
    company: 'City of Chennai Arts Council',
    location: 'Chennai, Tamil Nadu',
    description: 'The City of Chennai is commissioning a series of bronze sculptures for a new public park. We invite sculptors skilled in the lost-wax casting technique to submit their proposals and portfolio. This is a large-scale commission with a significant budget.',
    employmentType: 'Contract',
    postedDate: '2024-07-24',
    contactEmail: 'publicart@chennai.gov.in',
  },
];

export const states: StateInfo[] = [
  {
    id: "state-up",
    name: "Uttar Pradesh",
    artForms: [
      {
        id: "art-chikankari",
        name: "Chikankari Embroidery",
        story: [
          "You enter an old Lucknow workshop where shadow-like stitches glow under a lamp.",
          "A master artisan asks you to identify three classic stitches to unlock the next design.",
          "As you complete the pattern, the cloth reveals floral motifs inspired by Mughal gardens."
        ],
      },
      {
        id: "art-banarsi-weaving",
        name: "Banarasi Silk Weaving",
        story: [
          "In Varanasi, a loom rhythm becomes your map through a weaving puzzle.",
          "You choose zari motifs linked to stories of rivers, temples, and festivals.",
          "Your final weave combines tradition and symbolism into a ceremonial drape."
        ],
      }
    ]
  },
  {
    id: "state-dl",
    name: "Delhi",
    artForms: [
      {
        id: "art-zardozi",
        name: "Zardozi Embroidery",
        story: [
          "Inside a royal-style atelier, you trace metallic thread trails across velvet.",
          "Each clue teaches how gold and silver wire changed festive fashion in Delhi.",
          "You finish by matching patterns to historic court-inspired garments."
        ],
      },
      {
        id: "art-miniature",
        name: "Mughal Miniature Painting",
        story: [
          "You discover tiny unfinished portraits in a forgotten studio journal.",
          "To continue, you pick natural pigments and layered brush techniques.",
          "The completed panel reveals how miniature art documented court life and poetry."
        ],
      }
    ]
  },
  {
    id: "state-rj",
    name: "Rajasthan",
    artForms: [
      {
        id: "art-phad",
        name: "Phad Painting",
        story: [
          "A traveling storyteller asks you to arrange scenes on a long painted scroll.",
          "Each correct sequence unlocks episodes of local heroic legends.",
          "You conclude by narrating the full visual saga in traditional order."
        ],
      },
      {
        id: "art-blue-pottery",
        name: "Jaipur Blue Pottery",
        story: [
          "In a kiln room challenge, you combine quartz-based materials in the right sequence.",
          "A glaze puzzle reveals the role of Persian influence in local craft evolution.",
          "Your final piece emerges with signature cobalt and turquoise motifs."
        ],
      }
    ]
  },
  {
    id: "state-mh",
    name: "Maharashtra",
    artForms: [
      {
        id: "art-warli",
        name: "Warli Painting",
        story: [
          "You follow geometric symbols on a mud-wall canvas to decode village rituals.",
          "By matching circles, triangles, and lines, you build a complete harvest scene.",
          "The final mural teaches how Warli art turns daily life into visual storytelling."
        ],
      },
      {
        id: "art-paithani",
        name: "Paithani Weaving",
        story: [
          "A loom mystery asks you to pick peacock and lotus motifs in the right border layout.",
          "You learn how silk and zari choices define ceremonial identity.",
          "Your completed design mirrors the elegance of classic Paithani drapes."
        ],
      }
    ]
  },
  {
    id: "state-tn",
    name: "Tamil Nadu",
    artForms: [
      {
        id: "art-tanjore",
        name: "Tanjore Painting",
        story: [
          "You restore a damaged panel by selecting gold foil, gesso relief, and jewel tones.",
          "Each clue explains devotional themes and icon placement rules.",
          "The painting comes alive as you complete its layered sacred composition."
        ],
      },
      {
        id: "art-bharatanatyam",
        name: "Bharatanatyam",
        story: [
          "In a dance hall simulation, you sequence mudras to express emotion and narrative.",
          "Rhythm prompts guide you through adavus and classical timing patterns.",
          "The final performance reveals the storytelling grammar of this ancient form."
        ],
      }
    ]
  },
  {
    id: "state-ka",
    name: "Karnataka",
    artForms: [
      {
        id: "art-mysore-painting",
        name: "Mysore Painting",
        story: [
          "You examine old sketch lines to identify hallmark soft colors and fine detailing.",
          "A pigment puzzle introduces traditional preparation and layering methods.",
          "Your final stroke completes a serene devotional composition."
        ],
      },
      {
        id: "art-yakshagana",
        name: "Yakshagana",
        story: [
          "Backstage, you assemble costume pieces and face-paint symbols before curtain call.",
          "Dialogue clues help you match characters from epic narratives.",
          "The act ends with a dramatic fusion of music, dance, and storytelling."
        ],
      }
    ]
  },
  {
    id: "state-kl",
    name: "Kerala",
    artForms: [
      {
        id: "art-kathakali",
        name: "Kathakali",
        story: [
          "A makeup-room challenge asks you to decode color symbolism for each character type.",
          "You pair expressions with drum cues to drive the story forward.",
          "The scene resolves with a full enactment of a mythic episode."
        ],
      }
    ]
  },
  {
    id: "state-wb",
    name: "West Bengal",
    artForms: [
      {
        id: "art-pattachitra-bengal",
        name: "Bengal Pattachitra",
        story: [
          "You unroll painted scrolls and arrange frames into a sung narrative sequence.",
          "Voice clues reveal how image and song combine in performance.",
          "The final chant completes a portable story tradition passed across generations."
        ],
      }
    ]
  },
  {
    id: "state-gj",
    name: "Gujarat",
    artForms: [
      {
        id: "art-bandhani",
        name: "Bandhani Tie-Dye",
        story: [
          "You solve a knot-tying puzzle to produce precise dot constellations.",
          "Dye-timing clues show how patterns emerge through resist technique.",
          "Your fabric opens into a vibrant map of regional identity."
        ],
      }
    ]
  },
  {
    id: "state-or",
    name: "Odisha",
    artForms: [
      {
        id: "art-pattachitra-odisha",
        name: "Odisha Pattachitra",
        story: [
          "At a chitrakar workshop, you prepare natural colors from stone and plant sources.",
          "A border-design challenge helps you frame mythological scenes correctly.",
          "You complete a narrative panel in the style of temple-linked storytelling art."
        ],
      }
    ]
  }
];
export const mysteryQuizzes: MysteryQuiz[] = [
  {
    id: "mystery-1",
    title: "The Secret of the Persian Glaze",
    description: "Jaipur's famous Blue Pottery is not made of clay. Its unique composition, derived from quartz, is a closely guarded secret. It is said the original formula, which gave it a brilliant turquoise hue, was a gift from a traveling Persian artisan. Can you piece together the clues to rediscover the original glaze?",
    story: [
        "Legend has it that the art of blue pottery came to Jaipur in the early 19th century under the reign of Maharaja Sawai Ram Singh II. He was so taken with the art form during a visit to Delhi that he sent local artisans to be trained.",
        "What makes Jaipur Blue Pottery truly unique is its composition. It's the only pottery in the world that does not use clay. Instead, a special dough is prepared by mixing quartz stone powder, powdered glass, Multani Mitti (Fuller's Earth), borax, gum, and water.",
        "Your quest is to rediscover the key ingredients that create the iconic brilliant blue glaze."
    ],
    questions: [
        {
            id: 1,
            question: "The first ingredient is not from the earth, but ground from a common stone that tells time. What is it?",
            options: ["Marble", "Granite", "Quartz", "Limestone"],
            correctAnswer: "Quartz"
        },
        {
            id: 2,
            question: "What green-tinged salt, found in the salt flats of Sambhar Lake, provides the color's base?",
            options: ["Copper Sulphate", "Sodium Chloride", "Iron Sulphate", "Zinc Sulphate"],
            correctAnswer: "Copper Sulphate"
        },
        {
            id: 3,
            question: "What sticky plant defense, sourced from the 'Gond' tree, binds the mixture together?",
            options: ["Resin", "Latex", "Sap", "Gum"],
            correctAnswer: "Gum"
        },
        {
            id: 4,
            question: "To achieve the true Persian turquoise, the firing must be controlled. What kind of heat did the old masters use?",
            options: ["Intense and quick", "Gentle and slow", "High and sustained", "Smoky and low"],
            correctAnswer: "Gentle and slow"
        }
    ]
  }
];

export const artisans: Artisan[] = [
  {
    id: "artisan-1",
    name: "Rajesh Kumar",
    craft: "Jaipur Blue Pottery",
    bio: "From a long line of potters, Rajesh Kumar masterfully combines traditional techniques with contemporary designs, keeping the centuries-old art of Jaipur Blue Pottery alive and vibrant.",
    image: placeholderImages.find(p => p.id === 'artisan-1')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'omprakashparida8127@gmail.com',
    userId: 'xaqsIQZ9XcTQrKGEcjGIVDNWg9c2',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: "artisan-2",
    name: "Fatima Begum",
    craft: "Kashmiri Pashmina Weaving",
    bio: "Fatima Begum has been weaving pashmina shawls for over 40 years, her hands telling the story of a rich cultural heritage passed down through generations of women in her family.",
    image: placeholderImages.find(p => p.id === 'artisan-2')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'mousumiparida5520@gmail.com',
    userId: 'unj2sEfXFBeOQ8SYEDMJLUDlOYC3',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: "artisan-3",
    name: "Sanjay Jha",
    craft: "Madhubani Painting",
    bio: "Sanjay Jha's intricate Madhubani paintings are a celebration of nature and mythology. His work is characterized by its vibrant colors and detailed patterns, a hallmark of this ancient Bihari art form.",
    image: placeholderImages.find(p => p.id === 'artisan-3')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'chellarapu.25bhi10128@vitbhopal.ac.in',
    userId: 'o5aBSIuMubh8sXrlJc9zTk8w9Ow1v',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: "artisan-4",
    name: "Prakash Sharma",
    craft: "Sandalwood Carving",
    bio: "A master carver from Rajasthan, Prakash Sharma transforms blocks of sandalwood into exquisite sculptures and artifacts, each piece a testament to his precision and artistic vision.",
    image: placeholderImages.find(p => p.id === 'artisan-4')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'mousumiparida454@gmail.com',
    userId: 'wRsrZYnvbsNeIcF5EXtO76bENCg1',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-5',
    name: 'Priya Das',
    craft: 'Terracotta Pottery',
    bio: 'Priya Das brings a rustic charm to modern homes with her terracotta creations, inspired by the ancient pottery traditions of Bengal. Each piece is hand-shaped and sun-dried.',
    image: placeholderImages.find(p => p.id === 'artisan-5')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'poorvaja.16@gmail.com',
    userId: 'F4A7LxEcV5QEctDTU85EutoVH9W2',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-6',
    name: 'Rohan Joshi',
    craft: 'Leatherwork (Mojari Shoes)',
    bio: 'Rohan Joshi is a master craftsman of Mojari, the traditional embroidered footwear of Rajasthan. His family has been perfecting this craft for over a century, blending comfort and regal style.',
    image: placeholderImages.find(p => p.id === 'artisan-6')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'rohan.joshi@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-7',
    name: 'Meera Patel',
    craft: 'Bandhani Tie-Dye',
    bio: 'From the Kutch region of Gujarat, Meera Patel creates mesmerizing patterns through the meticulous art of Bandhani. Each dot is tied by hand before dyeing, resulting in vibrant, unique textiles.',
    image: placeholderImages.find(p => p.id === 'artisan-7')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'meera.patel@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-8',
    name: 'Arjun Singh',
    craft: 'Metal Embossing (Tarkashi)',
    bio: 'Arjun Singh practices the delicate art of Tarkashi, inlaying fine brass wires into wood. His work adorns decorative boxes and furniture with intricate geometric and floral patterns.',
    image: "https://picsum.photos/seed/artisan8/400/400",
<<<<<<< HEAD
=======
    email: 'arjun.singh@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-9',
    name: 'Sunita Devi',
    craft: 'Appliqué (Pipli)',
    bio: 'Sunita Devi is a celebrated artist from Pipli, Odisha, known for her vibrant appliqué work. She stitches together pieces of colored cloth to create vivid depictions of gods, animals, and nature.',
    image: placeholderImages.find(p => p.id === 'artisan-9')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'sunita.devi@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-10',
    name: 'Vikram Reddy',
    craft: 'Kalamkari Painting',
    bio: 'Using a traditional pen made from bamboo, Vikram Reddy free-hands mythological scenes onto fabric with natural dyes. His Kalamkari art from Andhra Pradesh is a testament to storytelling through visuals.',
    image: placeholderImages.find(p => p.id === 'artisan-10')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'vikram.reddy@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-11',
    name: 'Ishita Sharma',
    craft: 'Zardozi Embroidery',
    bio: 'Ishita Sharma is an expert in Zardozi, a lavish embroidery technique using gold and silver threads. Her work, often seen on luxurious fabrics, revives the grandeur of the Mughal era.',
    image: placeholderImages.find(p => p.id === 'artisan-11')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'ishita.sharma@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-12',
    name: 'Anand Verma',
    craft: 'Bidriware (Metal Inlay)',
    bio: 'From Bidar, Karnataka, Anand Verma creates stunning Bidriware by inlaying pure silver onto a blackened zinc and copper alloy. This 14th-century Persian art form is known for its striking contrast.',
    image: placeholderImages.find(p => p.id === 'artisan-12')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'anand.verma@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-13',
    name: 'Kavita Nair',
    craft: 'Coir Weaving',
    bio: "Kavita Nair transforms coconut fibers into beautiful and durable coir products, from floor mats to decorative items. Her work represents Kerala's sustainable and eco-friendly craft traditions.",
    image: placeholderImages.find(p => p.id === 'artisan-13')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'kavita.nair@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
  {
    id: 'artisan-14',
    name: 'Mohan Lal',
    craft: 'Lacquerware',
    bio: 'Mohan Lal is a skilled artisan from Channapatna, the "toy town" of Karnataka. He uses a unique technique of applying colored lacquer to wood, creating smooth, vibrant, and safe wooden toys.',
    image: placeholderImages.find(p => p.id === 'artisan-14')?.imageUrl || '',
<<<<<<< HEAD
=======
    email: 'mohan.lal@kalaquest.in',
>>>>>>> 65a6139 (Update fixes for build and inbox)
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Azure Floral Vase",
    description: "A beautiful Jaipur Blue Pottery vase, hand-painted with delicate floral motifs. Made without the use of clay, it's a unique decorative piece.",
    price: 850.00,
    image: placeholderImages.find(p => p.id === 'product-1')?.imageUrl || '',
    artisanId: "artisan-1",
  },
  {
    id: "prod-2",
    name: "Handwoven Pashmina Shawl",
    description: "An incredibly soft and warm pashmina shawl from Kashmir, featuring traditional 'sozni' embroidery. A timeless piece of luxury.",
    price: 4500.00,
    image: placeholderImages.find(p => p.id === 'product-2')?.imageUrl || '',
    artisanId: "artisan-2",
  },
  {
    id: "prod-3",
    name: "The Fish of Life",
    description: "A vibrant Madhubani painting depicting a pair of fish, symbolizing fertility and prosperity. Painted with natural dyes on handmade paper.",
    price: 1500.00,
    image: placeholderImages.find(p => p.id === 'product-3')?.imageUrl || '',
    artisanId: "artisan-3",
  },
  {
    id: "prod-4",
    name: "Carved Elephant Figure",
    description: "An intricately carved sandalwood elephant, a symbol of wisdom and strength. The detailed 'jali' work showcases incredible craftsmanship.",
    price: 2800.00,
    image: placeholderImages.find(p => p.id === 'product-4')?.imageUrl || '',
    artisanId: "artisan-4",
  },
  {
    id: "prod-5",
    name: "Cerulean Blue Mug",
    description: "A stunning mug crafted in the Jaipur Blue Pottery style, perfect for your morning coffee or as a piece of art.",
    price: 450.00,
    image: placeholderImages.find(p => p.id === 'product-5')?.imageUrl || '',
    artisanId: "artisan-1",
  },
  {
    id: "prod-6",
    name: "Crimson Silk Scarf",
    description: "A lightweight silk scarf, handwoven by Kashmiri artisans. Its deep crimson color is derived from natural plant-based dyes.",
    price: 1200.00,
    image: "https://picsum.photos/seed/product6/400/400",
    artisanId: "artisan-2",
  },
  {
    id: "prod-7",
    name: "Peacock's Dance Painting",
    description: "A mesmerizing Madhubani painting showcasing the magnificent peacock, a symbol of grace and beauty in Indian culture.",
    price: 1800.00,
    image: placeholderImages.find(p => p.id === 'product-7')?.imageUrl || '',
    artisanId: "artisan-3",
  },
  {
    id: "prod-8",
    name: "Sandalwood Jewelry Box",
    description: "A fragrant and beautifully carved box to store your precious jewelry, featuring traditional Rajasthani floral patterns.",
    price: 3200.00,
    image: placeholderImages.find(p => p.id === 'product-8')?.imageUrl || '',
    artisanId: "artisan-4",
  },
  {
    id: "prod-9",
    name: "Terracotta Dinner Set",
    description: "A set of four hand-shaped terracotta bowls, perfect for serving traditional meals and adding an earthy touch to your dining table.",
    price: 950.00,
    image: "https://picsum.photos/seed/product9/400/400",
    artisanId: "artisan-5",
  },
  {
    id: "prod-10",
    name: "Royal Blue Mojari Shoes",
    description: "Handcrafted leather Mojari shoes, embroidered with golden thread. A perfect blend of comfort and traditional style for festive occasions.",
    price: 1100.00,
    image: "https://picsum.photos/seed/product10/400/400",
    artisanId: "artisan-6",
  },
  {
    id: "prod-11",
    name: "Crimson Bandhani Scarf",
    description: "A vibrant silk scarf created using the Bandhani tie-dye technique from Gujarat. Each dot is a testament to the artisan's skill.",
    price: 900.00,
    image: "https://picsum.photos/seed/product11/400/400",
    artisanId: "artisan-7",
  },
  {
    id: "prod-12",
    name: "Tarkashi Keepsake Box",
    description: "An exquisite wooden box decorated with Tarkashi, the art of inlaying fine brass wire. Ideal for storing treasured keepsakes.",
    price: 3500.00,
    image: "https://picsum.photos/seed/product12/400/400",
    artisanId: "artisan-8",
  },
  {
    id: "prod-13",
    name: "Sun Temple Appliqué Wall Art",
    description: "A stunning piece of Pipli appliqué work from Odisha, depicting the chariot wheel of the Konark Sun Temple in vibrant colors.",
    price: 1600.00,
    image: "https://picsum.photos/seed/product13/400/400",
    artisanId: "artisan-9",
  },
  {
    id: "prod-14",
    name: "Tree of Life Kalamkari Tapestry",
    description: "A hand-painted Kalamkari tapestry showing the 'Tree of Life', a symbol of creation and vitality. Made with natural dyes on cotton fabric.",
    price: 2500.00,
    image: "https://picsum.photos/seed/product14/400/400",
    artisanId: "artisan-10",
  },
  {
    id: "prod-15",
    name: "Regal Zardozi Evening Clutch",
    description: "An elegant evening clutch purse, lavishly embroidered with gold Zardozi work on velvet. A perfect accessory for a royal look.",
    price: 4800.00,
    image: placeholderImages.find(p => p.id === 'product-15')?.imageUrl || '',
    artisanId: "artisan-11",
  },
  {
    id: "prod-16",
    name: "Silver Inlaid Bidriware Vase",
    description: "A classic Bidriware vase, featuring intricate floral patterns inlaid with pure silver on a dark alloy base. A masterpiece from Bidar.",
    price: 3200.00,
    image: placeholderImages.find(p => p.id === 'product-16')?.imageUrl || '',
    artisanId: "artisan-12",
  },
  {
    id: "prod-17",
    name: "'Welcome' Coir Doormat",
    description: "A durable and eco-friendly doormat woven from natural coir fibers from Kerala, featuring a simple and elegant welcome design.",
    price: 350.00,
    image: placeholderImages.find(p => p.id === 'product-17')?.imageUrl || '',
    artisanId: "artisan-13",
  },
  {
    id: "prod-18",
    name: "Set of 5 Channapatna Spinning Tops",
    description: "A colorful set of traditional wooden spinning tops from Channapatna, handcrafted with safe, non-toxic lacquer. Fun for all ages.",
    price: 550.00,
    image: placeholderImages.find(p => p.id === 'product-18')?.imageUrl || '',
    artisanId: "artisan-14",
  },
];
<<<<<<< HEAD

=======
>>>>>>> 65a6139 (Update fixes for build and inbox)
