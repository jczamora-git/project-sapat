// Initial mock data for Sapat Mobile Prototype - Multi-Vendor Edition
const SAPAT_STORAGE_KEY_VENDORS = 'sapat_vendors_v2';
const SAPAT_STORAGE_KEY_MENU = 'sapat_menu_items_v2';
const SAPAT_STORAGE_KEY_ORDERS = 'sapat_orders_v2';
const SAPAT_STORAGE_KEY_SETTINGS = 'sapat_settings_v2';
const SAPAT_STORAGE_KEY_ROLE = 'sapat_current_role_v2';
const SAPAT_STORAGE_KEY_CURRENT_VENDOR = 'sapat_current_vendor_v2';
const SAPAT_STORAGE_KEY_STUDENT_VENDOR = 'sapat_student_vendor_v2';

// 5 Canteen Vendors (All-Day Food Stalls in Main Canteen)
const INITIAL_VENDORS = [
  {
    id: 'vendor-lita',
    name: "Ate Lita's Kitchen",
    stallNumber: "Stall #3",
    stallTag: "Stall #3",
    category: "Lutong Bahay & Rice Meals",
    categoryDesc: "Classic Homestyle Filipino Comfort Dishes",
    isOpen: true,
    statusText: "Open Now",
    hours: "7:00 AM - 4:30 PM",
    avatar: "AL",
    avatarColor: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    accentColor: "#059669",
    bannerImage: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
    description: "Tender chicken adobo, hot sinigang soup, and crispy lumpia cooked fresh every morning.",
    efficiency: "96%",
    wasteSaved: "14.8 kg",
    expressWindow: "Counter Window 2"
  },
  {
    id: 'vendor-ben',
    name: "Kuya Ben's Silog Meals",
    stallNumber: "Stall #1",
    stallTag: "Stall #1",
    category: "Silog & Breakfast All-Day",
    categoryDesc: "Garlic Fried Rice & Golden Egg Combos",
    isOpen: true,
    statusText: "Open Now",
    hours: "6:30 AM - 4:00 PM",
    avatar: "KB",
    avatarColor: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    accentColor: "#d97706",
    bannerImage: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    description: "Crispy savory beef tapa, sweet longganisa, and jumbo hotdogs with fragrant sinangag.",
    efficiency: "94%",
    wasteSaved: "12.3 kg",
    expressWindow: "Counter Window 1"
  },
  {
    id: 'vendor-cora',
    name: "Nanay Cora's Lutong Bahay",
    stallNumber: "Stall #2",
    stallTag: "Stall #2",
    category: "Traditional Ulam & Gulay",
    categoryDesc: "Nutritious Recipes & Comfort Stews",
    isOpen: true,
    statusText: "Open Now",
    hours: "7:00 AM - 3:30 PM",
    avatar: "NC",
    avatarColor: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    accentColor: "#0284c7",
    bannerImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    description: "Flavorful pork giniling, malunggay monggo soup, and golden fried fish meal with toyomansi.",
    efficiency: "92%",
    wasteSaved: "11.5 kg",
    expressWindow: "Counter Window 2"
  },
  {
    id: 'vendor-green',
    name: "Green Bowl Express",
    stallNumber: "Stall #4",
    stallTag: "Stall #4",
    category: "Healthy & Rice Bowls",
    categoryDesc: "Modern Balanced High-Protein Bowls",
    isOpen: true,
    statusText: "Open Now",
    hours: "8:00 AM - 4:00 PM",
    avatar: "GB",
    avatarColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    accentColor: "#10b981",
    bannerImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Glazed chicken teriyaki, pan-seared tofu bowls, and zesty tuna rice bowls with crisp veggies.",
    efficiency: "95%",
    wasteSaved: "9.7 kg",
    expressWindow: "Counter Window 3"
  },
  {
    id: 'vendor-tess',
    name: "Merienda ni Aling Tess",
    stallNumber: "Stall #5",
    stallTag: "Stall #5",
    category: "Snacks & Merienda",
    categoryDesc: "Warm Recess Specialties & Sweet Treats",
    isOpen: true,
    statusText: "Open Now",
    hours: "7:30 AM - 5:00 PM",
    avatar: "AT",
    avatarColor: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    accentColor: "#8b5cf6",
    bannerImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    description: "Freshly tossed pancit bihon, crunchy golden turon with langka, and creamy fried cheese lumpia.",
    efficiency: "97%",
    wasteSaved: "15.1 kg",
    expressWindow: "Snack Express Counter"
  }
];

// Seed Menu Items (3 items per vendor, exactly matching user requirements)
const INITIAL_MENU = [
  // 1. Ate Lita's Kitchen (Stall #3)
  {
    id: 'dish-lita-1',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    vendorStall: "Stall #3",
    name: 'Chicken Adobo',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 65,
    description: 'Tender chicken braised in soy sauce, cane vinegar, garlic, and peppercorns. Served with piping hot steamed rice.',
    dailyLimit: 45,
    reservedServings: 24, // 21 left
    isAvailable: true,
    suggestedPrep: 45,
    historicalAvg: 42,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
    tags: ['Best Seller', 'High Protein'],
    prepNote: 'Morning batch ready at 10:00 AM'
  },
  {
    id: 'dish-lita-2',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    vendorStall: "Stall #3",
    name: 'Pork Sinigang sa Sampalok',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 70,
    description: 'Sour tamarind soup with soft pork ribs, kangkong, radish, and string beans. Perfectly comforting for lunch.',
    dailyLimit: 35,
    reservedServings: 32, // 3 left
    isAvailable: true,
    suggestedPrep: 35,
    historicalAvg: 34,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    tags: ['Soup Favorite', 'Almost Full'],
    prepNote: 'Cooked fresh at 11:00 AM'
  },
  {
    id: 'dish-lita-3',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    vendorStall: "Stall #3",
    name: 'Crispy Lumpiang Shanghai',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 45,
    description: 'Crispy fried mini spring rolls (6 pcs) filled with seasoned ground meat and carrots. Served with sweet chili dip.',
    dailyLimit: 40,
    reservedServings: 40, // 0 left -> SOLD OUT DEMO
    isAvailable: true,
    suggestedPrep: 50,
    historicalAvg: 48,
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
    tags: ['Sold Out', 'Snack Favorite'],
    prepNote: 'Preparation limit reached for today'
  },

  // 2. Kuya Ben's Silog Meals (Stall #1)
  {
    id: 'dish-ben-1',
    vendorId: 'vendor-ben',
    vendorName: "Kuya Ben's Silog Meals",
    vendorStall: "Stall #1",
    name: 'Tapsilog',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 85,
    description: 'Savory sweet marinated beef sirloin strips served with fragrant garlic fried sinangag and sunny-side egg.',
    dailyLimit: 40,
    reservedServings: 28, // 12 left
    isAvailable: true,
    suggestedPrep: 40,
    historicalAvg: 38,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    tags: ['All-Day Breakfast', 'Top Pick'],
    prepNote: 'Served with atchara and spiced vinegar'
  },
  {
    id: 'dish-ben-2',
    vendorId: 'vendor-ben',
    vendorName: "Kuya Ben's Silog Meals",
    vendorStall: "Stall #1",
    name: 'Hotsilog',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 60,
    description: 'Juicy jumbo tender-juicy hotdog spiral cut, fried crisp and paired with garlic fried rice and egg.',
    dailyLimit: 30,
    reservedServings: 18, // 12 left
    isAvailable: true,
    suggestedPrep: 30,
    historicalAvg: 28,
    image: 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?auto=format&fit=crop&w=600&q=80',
    tags: ['Budget Friendly', 'Quick Meal'],
    prepNote: 'Cooked to order in minutes'
  },
  {
    id: 'dish-ben-3',
    vendorId: 'vendor-ben',
    vendorName: "Kuya Ben's Silog Meals",
    vendorStall: "Stall #1",
    name: 'Longsilog',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 75,
    description: 'Two pieces of sweet and garlicky Lucban style pork sausages served with golden garlic rice and egg.',
    dailyLimit: 35,
    reservedServings: 22, // 13 left
    isAvailable: true,
    suggestedPrep: 35,
    historicalAvg: 33,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    tags: ['Classic Pinoy', 'Hearty'],
    prepNote: 'Sweet garlic blend'
  },

  // 3. Nanay Cora's Lutong Bahay (Stall #2)
  {
    id: 'dish-cora-1',
    vendorId: 'vendor-cora',
    vendorName: "Nanay Cora's Lutong Bahay",
    vendorStall: "Stall #2",
    name: 'Pork Giniling',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 60,
    description: 'Savory ground pork simmered in rich tomato stew with diced potatoes, sweet carrots, and peas over rice.',
    dailyLimit: 35,
    reservedServings: 20, // 15 left
    isAvailable: true,
    suggestedPrep: 35,
    historicalAvg: 32,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    tags: ['Budget Ulam', 'Comfort Food'],
    prepNote: 'Nutritious homestyle portion'
  },
  {
    id: 'dish-cora-2',
    vendorId: 'vendor-cora',
    vendorName: "Nanay Cora's Lutong Bahay",
    vendorStall: "Stall #2",
    name: 'Ginisang Monggo',
    category: 'veggies',
    categoryName: 'Gulay & Healthy',
    price: 45,
    description: 'Thick comforting mung bean soup simmered with malunggay greens, garlic, and topped with crunchy chicharon.',
    dailyLimit: 40,
    reservedServings: 25, // 15 left
    isAvailable: true,
    suggestedPrep: 40,
    historicalAvg: 38,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['High Fiber', 'Friday Favorite'],
    prepNote: 'Made with fresh malunggay'
  },
  {
    id: 'dish-cora-3',
    vendorId: 'vendor-cora',
    vendorName: "Nanay Cora's Lutong Bahay",
    vendorStall: "Stall #2",
    name: 'Fried Fish Meal',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 70,
    description: 'Crispy fried milkfish belly / tilapia marinated in garlic vinegar. Served with hot rice and calamansi toyomansi dip.',
    dailyLimit: 25,
    reservedServings: 21, // 4 left
    isAvailable: true,
    suggestedPrep: 25,
    historicalAvg: 24,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    tags: ['Fresh Catch', 'Almost Full'],
    prepNote: 'Fried fresh per pickup window'
  },

  // 4. Green Bowl Express (Stall #4)
  {
    id: 'dish-green-1',
    vendorId: 'vendor-green',
    vendorName: "Green Bowl Express",
    vendorStall: "Stall #4",
    name: 'Chicken Teriyaki Rice',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 85,
    description: 'Tender grilled chicken thigh strips glazed in sweet teriyaki sauce over steamed rice with steamed broccoli and sesame.',
    dailyLimit: 30,
    reservedServings: 16, // 14 left
    isAvailable: true,
    suggestedPrep: 30,
    historicalAvg: 29,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    tags: ['Healthy Choice', 'Lean Protein'],
    prepNote: 'Low sodium homemade glaze'
  },
  {
    id: 'dish-green-2',
    vendorId: 'vendor-green',
    vendorName: "Green Bowl Express",
    vendorStall: "Stall #4",
    name: 'Tofu Veggie Bowl',
    category: 'veggies',
    categoryName: 'Gulay & Healthy',
    price: 65,
    description: 'Crispy pan-seared organic tofu cubes with sauteed bok choy, julienned carrots, corn, and savory sesame dressing.',
    dailyLimit: 25,
    reservedServings: 12, // 13 left
    isAvailable: true,
    suggestedPrep: 25,
    historicalAvg: 22,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegetarian', 'Zero Cholesterol'],
    prepNote: 'High protein plant-based meal'
  },
  {
    id: 'dish-green-3',
    vendorId: 'vendor-green',
    vendorName: "Green Bowl Express",
    vendorStall: "Stall #4",
    name: 'Tuna Rice Bowl',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 75,
    description: 'Chunky seasoned tuna flakes with sweet corn kernels, shredded cabbage, nori strips, and light spicy mayo on rice.',
    dailyLimit: 30,
    reservedServings: 19, // 11 left
    isAvailable: true,
    suggestedPrep: 30,
    historicalAvg: 28,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tags: ['Omega-3', 'Fresh & Light'],
    prepNote: 'Prepared cold with warm rice'
  },

  // 5. Merienda ni Aling Tess (Stall #5)
  {
    id: 'dish-tess-1',
    vendorId: 'vendor-tess',
    vendorName: "Merienda ni Aling Tess",
    vendorStall: "Stall #5",
    name: 'Pancit Bihon',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 40,
    description: 'Fine rice noodles stir-fried with shredded chicken breast, crisp cabbage, carrots, green beans, and calamansi.',
    dailyLimit: 45,
    reservedServings: 30, // 15 left
    isAvailable: true,
    suggestedPrep: 45,
    historicalAvg: 42,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    tags: ['Snack Staple', 'Merienda Hit'],
    prepNote: 'Cooked fresh every recess shift'
  },
  {
    id: 'dish-tess-2',
    vendorId: 'vendor-tess',
    vendorName: "Merienda ni Aling Tess",
    vendorStall: "Stall #5",
    name: 'Turon',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 20,
    description: 'Golden caramelized Saba banana roll with sweet ripe jackfruit (langka), fried extra crispy with brown sugar glaze.',
    dailyLimit: 50,
    reservedServings: 42, // 8 left
    isAvailable: true,
    suggestedPrep: 50,
    historicalAvg: 48,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    tags: ['Sweet Treat', 'Warm & Crispy'],
    prepNote: 'Fried fresh every 30 minutes'
  },
  {
    id: 'dish-tess-3',
    vendorId: 'vendor-tess',
    vendorName: "Merienda ni Aling Tess",
    vendorStall: "Stall #5",
    name: 'Cheese Lumpia',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 35,
    description: 'Crunchy golden spring rolls (5 pcs) stuffed with creamy melted cheddar cheese, lightly dusted with powdered sugar.',
    dailyLimit: 40,
    reservedServings: 26, // 14 left
    isAvailable: true,
    suggestedPrep: 40,
    historicalAvg: 37,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    tags: ['Kid Favorite', 'Crispy Snack'],
    prepNote: 'Served hot with melted cheese'
  }
];

// Seed Orders across vendors
const INITIAL_ORDERS = [
  // Order 1 for Ate Lita's Kitchen
  {
    id: 'SPT-9021',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    vendorStall: "Stall #3",
    studentName: 'Maria Santos',
    studentId: '2024-0891',
    gradeSection: 'Grade 11 - STEM A',
    pickupTime: '11:30 AM (Lunch Shift 1)',
    specialInstructions: 'Paki-hiwalay po ang sabaw kung maaari',
    items: [
      { id: 'dish-lita-1', name: 'Chicken Adobo', price: 65, quantity: 1, vendorId: 'vendor-lita' }
    ],
    totalAmount: 65,
    totalServings: 1,
    status: 'Ready for Pickup', // Pending, Confirmed, Preparing, Ready for Pickup, Completed, Cancelled
    createdAt: 'Today 08:30 AM',
    timeline: [
      { status: 'Preordered', time: '8:30 AM', done: true },
      { status: 'Confirmed', time: '8:45 AM', done: true },
      { status: 'Preparing', time: '10:45 AM', done: true },
      { status: 'Ready for Pickup', time: '11:15 AM', done: true },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 2 for Kuya Ben's Silog Meals
  {
    id: 'SPT-9022',
    vendorId: 'vendor-ben',
    vendorName: "Kuya Ben's Silog Meals",
    vendorStall: "Stall #1",
    studentName: 'Juan Dela Cruz',
    studentId: '2024-0412',
    gradeSection: 'Grade 12 - ABM B',
    pickupTime: '12:15 PM (Lunch Shift 2)',
    specialInstructions: 'Extra spicy vinegar po sa tapsilog',
    items: [
      { id: 'dish-ben-1', name: 'Tapsilog', price: 85, quantity: 2, vendorId: 'vendor-ben' }
    ],
    totalAmount: 170,
    totalServings: 2,
    status: 'Preparing',
    createdAt: 'Today 09:10 AM',
    timeline: [
      { status: 'Preordered', time: '9:10 AM', done: true },
      { status: 'Confirmed', time: '9:25 AM', done: true },
      { status: 'Preparing', time: '11:00 AM', done: true },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 3 for Nanay Cora's Lutong Bahay
  {
    id: 'SPT-9025',
    vendorId: 'vendor-cora',
    vendorName: "Nanay Cora's Lutong Bahay",
    vendorStall: "Stall #2",
    studentName: 'Bea Alonzo',
    studentId: '2024-1102',
    gradeSection: 'Grade 10 - Rizal',
    pickupTime: '11:30 AM (Lunch Shift 1)',
    specialInstructions: 'Paki-dagdagan po ng malunggay soup',
    items: [
      { id: 'dish-cora-1', name: 'Pork Giniling', price: 60, quantity: 1, vendorId: 'vendor-cora' },
      { id: 'dish-cora-2', name: 'Ginisang Monggo', price: 45, quantity: 1, vendorId: 'vendor-cora' }
    ],
    totalAmount: 105,
    totalServings: 2,
    status: 'Confirmed',
    createdAt: 'Today 08:50 AM',
    timeline: [
      { status: 'Preordered', time: '8:50 AM', done: true },
      { status: 'Confirmed', time: '9:00 AM', done: true },
      { status: 'Preparing', time: '--', done: false },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 4 for Green Bowl Express
  {
    id: 'SPT-9026',
    vendorId: 'vendor-green',
    vendorName: "Green Bowl Express",
    vendorStall: "Stall #4",
    studentName: 'Paolo Reyes',
    studentId: '2024-0551',
    gradeSection: 'Grade 11 - HUMSS',
    pickupTime: '12:15 PM (Lunch Shift 2)',
    specialInstructions: 'Less teriyaki sauce please',
    items: [
      { id: 'dish-green-1', name: 'Chicken Teriyaki Rice', price: 85, quantity: 1, vendorId: 'vendor-green' },
      { id: 'dish-green-2', name: 'Tofu Veggie Bowl', price: 65, quantity: 1, vendorId: 'vendor-green' }
    ],
    totalAmount: 150,
    totalServings: 2,
    status: 'Pending',
    createdAt: 'Today 09:30 AM',
    timeline: [
      { status: 'Preordered', time: '9:30 AM', done: true },
      { status: 'Confirmed', time: '--', done: false },
      { status: 'Preparing', time: '--', done: false },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 5 for Merienda ni Aling Tess
  {
    id: 'SPT-9018',
    vendorId: 'vendor-tess',
    vendorName: "Merienda ni Aling Tess",
    vendorStall: "Stall #5",
    studentName: 'Maria Santos',
    studentId: '2024-0891',
    gradeSection: 'Grade 11 - STEM A',
    pickupTime: '9:45 AM (Morning Recess)',
    specialInstructions: 'Crispy turon po',
    items: [
      { id: 'dish-tess-1', name: 'Pancit Bihon', price: 40, quantity: 1, vendorId: 'vendor-tess' },
      { id: 'dish-tess-2', name: 'Turon', price: 20, quantity: 2, vendorId: 'vendor-tess' }
    ],
    totalAmount: 80,
    totalServings: 3,
    status: 'Completed',
    createdAt: 'Today 07:45 AM',
    timeline: [
      { status: 'Preordered', time: '7:45 AM', done: true },
      { status: 'Confirmed', time: '8:00 AM', done: true },
      { status: 'Preparing', time: '9:15 AM', done: true },
      { status: 'Ready for Pickup', time: '9:35 AM', done: true },
      { status: 'Completed', time: '9:50 AM', done: true }
    ]
  }
];

// Seed Settings & Profile
const INITIAL_SETTINGS = {
  schoolName: "Ramon Magsaysay High School Main Canteen",
  operatingHours: "6:30 AM - 5:00 PM",
  prepCutoffTime: "30 minutes before slot",
  studentProfile: {
    name: "Maria Santos",
    studentId: "2024-0891",
    gradeSection: "Grade 11 - STEM A",
    contact: "0917-555-0891",
    preordersCount: 16,
    wasteSavedKg: 5.4
  }
};

// Storage Handler with multi-vendor support
class SapatStorage {
  static getVendors() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_VENDORS);
      if (!data) {
        this.saveVendors(INITIAL_VENDORS);
        return INITIAL_VENDORS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading vendors from localStorage', e);
      return INITIAL_VENDORS;
    }
  }

  static saveVendors(vendors) {
    localStorage.setItem(SAPAT_STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'vendors' } }));
  }

  static getVendorById(vendorId) {
    const vendors = this.getVendors();
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }

  static getCurrentVendorId() {
    return localStorage.getItem(SAPAT_STORAGE_KEY_CURRENT_VENDOR) || 'vendor-lita';
  }

  static setCurrentVendorId(vendorId) {
    localStorage.setItem(SAPAT_STORAGE_KEY_CURRENT_VENDOR, vendorId);
    window.dispatchEvent(new CustomEvent('sapat:vendor-changed', { detail: { vendorId } }));
  }

  static getStudentSelectedVendor() {
    return localStorage.getItem(SAPAT_STORAGE_KEY_STUDENT_VENDOR) || 'all';
  }

  static setStudentSelectedVendor(vendorId) {
    localStorage.setItem(SAPAT_STORAGE_KEY_STUDENT_VENDOR, vendorId);
    window.dispatchEvent(new CustomEvent('sapat:student-vendor-changed', { detail: { vendorId } }));
  }

  static getMenu() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_MENU);
      if (!data) {
        this.saveMenu(INITIAL_MENU);
        return INITIAL_MENU;
      }
      const menu = JSON.parse(data);
      // Safety check: ensure multi-vendor structure is present
      if (!Array.isArray(menu) || menu.length < 10 || !menu[0].vendorId) {
        this.saveMenu(INITIAL_MENU);
        return INITIAL_MENU;
      }
      return menu;
    } catch (e) {
      console.error('Failed reading menu from localStorage', e);
      return INITIAL_MENU;
    }
  }

  static saveMenu(menu) {
    localStorage.setItem(SAPAT_STORAGE_KEY_MENU, JSON.stringify(menu));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'menu' } }));
  }

  static getOrders() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_ORDERS);
      if (!data) {
        this.saveOrders(INITIAL_ORDERS);
        return INITIAL_ORDERS;
      }
      const orders = JSON.parse(data);
      if (!Array.isArray(orders)) {
        this.saveOrders(INITIAL_ORDERS);
        return INITIAL_ORDERS;
      }
      return orders;
    } catch (e) {
      console.error('Failed reading orders from localStorage', e);
      return INITIAL_ORDERS;
    }
  }

  static saveOrders(orders) {
    localStorage.setItem(SAPAT_STORAGE_KEY_ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'orders' } }));
  }

  static getSettings() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_SETTINGS);
      if (!data) {
        localStorage.setItem(SAPAT_STORAGE_KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings) {
    localStorage.setItem(SAPAT_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'settings' } }));
  }

  static getRole() {
    return localStorage.getItem(SAPAT_STORAGE_KEY_ROLE) || null;
  }

  static saveRole(role) {
    localStorage.setItem(SAPAT_STORAGE_KEY_ROLE, role);
    window.dispatchEvent(new CustomEvent('sapat:role-changed', { detail: { role } }));
  }

  static resetData() {
    localStorage.removeItem(SAPAT_STORAGE_KEY_VENDORS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_MENU);
    localStorage.removeItem(SAPAT_STORAGE_KEY_ORDERS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_SETTINGS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_CURRENT_VENDOR);
    localStorage.removeItem(SAPAT_STORAGE_KEY_STUDENT_VENDOR);
    this.saveVendors(INITIAL_VENDORS);
    this.saveMenu(INITIAL_MENU);
    this.saveOrders(INITIAL_ORDERS);
    this.saveSettings(INITIAL_SETTINGS);
    this.setCurrentVendorId('vendor-lita');
    this.setStudentSelectedVendor('all');
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'all' } }));
  }
}

window.SapatStorage = SapatStorage;

export {
  SapatStorage,
  INITIAL_VENDORS,
  INITIAL_MENU,
  INITIAL_ORDERS,
  INITIAL_SETTINGS
};
