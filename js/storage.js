// Initial mock data for Sapat Mobile Prototype - Multi-Vendor Edition
const SAPAT_STORAGE_KEY_VENDORS = 'sapat_vendors_v2';
const SAPAT_STORAGE_KEY_MENU = 'sapat_menu_items_v2';
const SAPAT_STORAGE_KEY_ORDERS = 'sapat_orders_v2';
const SAPAT_STORAGE_KEY_SETTINGS = 'sapat_settings_v2';
const SAPAT_STORAGE_KEY_ROLE = 'sapat_current_role_v2';
const SAPAT_STORAGE_KEY_CURRENT_VENDOR = 'sapat_current_vendor_v2';
const SAPAT_STORAGE_KEY_STUDENT_VENDOR = 'sapat_student_vendor_v2';
const SAPAT_STORAGE_KEY_PAYMENTS = 'sapat_payments_v2';
const SAPAT_STORAGE_KEY_AUDIT_LOGS = 'sapat_audit_logs_v2';
const SAPAT_STORAGE_KEY_REVIEWS = 'sapat_reviews_v2';

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
    avatarColor: "linear-gradient(135deg, #005B36 0%, #004326 100%)",
    accentColor: "#005B36",
    bannerImage: "assets/images/canteens/ate-lita.jpg",
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
    avatarColor: "linear-gradient(135deg, #FF8A24 0%, #D96E14 100%)",
    accentColor: "#FF8A24",
    bannerImage: "assets/images/canteens/kuya-ben.jpg",
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
    bannerImage: "assets/images/canteens/nanay-cora.jpg",
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
    avatarColor: "linear-gradient(135deg, #007A48 0%, #005B36 100%)",
    accentColor: "#005B36",
    bannerImage: "assets/images/canteens/green-bowl.jpg",
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
    bannerImage: "assets/images/canteens/aling-tess.jpg",
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
    image: 'assets/images/products/chicken-adobo.jpg',
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
    image: 'assets/images/products/pork-sinigang.jpg',
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
    image: 'assets/images/products/lumpiang-shanghai.jpg',
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
    image: 'assets/images/products/tapsilog.jpg',
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
    image: 'assets/images/products/hotsilog.jpg',
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
    image: 'assets/images/products/longsilog.jpg',
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
    image: 'assets/images/products/pork-giniling.jpg',
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
    image: 'assets/images/products/ginisang-monggo.jpg',
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
    image: 'assets/images/products/fried-fish-meal.jpg',
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
    image: 'assets/images/products/chicken-teriyaki.jpg',
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
    image: 'assets/images/products/tofu-veggie-bowl.jpg',
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
    image: 'assets/images/products/tuna-rice-bowl.jpg',
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
    image: 'assets/images/products/pancit-bihon.jpg',
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
    image: 'assets/images/products/turon.jpg',
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
    image: 'assets/images/products/cheese-lumpia.jpg',
    tags: ['Kid Favorite', 'Crispy Snack'],
    prepNote: 'Served hot with melted cheese'
  }
];

// Seed Orders across vendors with Payment & Lifecycle separation
const INITIAL_ORDERS = [
  // Order 1 for Ate Lita's Kitchen (Paid Online & Ready for Pickup)
  {
    id: 'SPT-9021',
    pickupToken: 'spt_tok_spt9021_09218a',
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
    status: 'Ready for Pickup',
    paymentMethod: 'Online Payment (GCash)',
    paymentStatus: 'Paid',
    paidAt: 'Today 08:31 AM',
    transactionReference: 'TXN-GCASH-90218',
    createdAt: 'Today 08:30 AM',
    timeline: [
      { status: 'Preordered', time: '8:30 AM', done: true },
      { status: 'Payment Verified', time: '8:31 AM', done: true },
      { status: 'Confirmed', time: '8:45 AM', done: true },
      { status: 'Preparing', time: '10:45 AM', done: true },
      { status: 'Ready for Pickup', time: '11:15 AM', done: true },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 2 for Kuya Ben's Silog Meals (Paid Online & Preparing)
  {
    id: 'SPT-9022',
    pickupToken: 'spt_tok_spt9022_44120b',
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
    paymentMethod: 'Online Payment (Maya)',
    paymentStatus: 'Paid',
    paidAt: 'Today 09:11 AM',
    transactionReference: 'TXN-MAYA-44120',
    createdAt: 'Today 09:10 AM',
    timeline: [
      { status: 'Preordered', time: '9:10 AM', done: true },
      { status: 'Payment Verified', time: '9:11 AM', done: true },
      { status: 'Confirmed', time: '9:25 AM', done: true },
      { status: 'Preparing', time: '11:00 AM', done: true },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 3 for Nanay Cora's Lutong Bahay (Direct Counter Paid & Confirmed)
  {
    id: 'SPT-9025',
    pickupToken: 'spt_tok_spt9025_09250c',
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
    paymentMethod: 'Direct Counter Payment',
    paymentStatus: 'Paid',
    paidAt: 'Today 08:58 AM',
    verifiedBy: "Nanay Cora's Cashier",
    transactionReference: 'RCPT-STALL2-0925',
    createdAt: 'Today 08:50 AM',
    timeline: [
      { status: 'Preordered', time: '8:50 AM', done: true },
      { status: 'Counter Payment Verified', time: '8:58 AM', done: true },
      { status: 'Confirmed', time: '9:00 AM', done: true },
      { status: 'Preparing', time: '--', done: false },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 4 for Green Bowl Express (Direct Counter Payment AWAITING VERIFICATION)
  {
    id: 'SPT-9026',
    pickupToken: 'spt_tok_spt9026_pending',
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
    status: 'Awaiting Counter Payment',
    paymentMethod: 'Direct Counter Payment',
    paymentStatus: 'Pending',
    paymentDeadline: '10:00 AM (Pay at Counter Window 4)',
    counterWindow: 'Counter Window 4',
    createdAt: 'Today 09:30 AM',
    timeline: [
      { status: 'Preordered', time: '9:30 AM', done: true },
      { status: 'Awaiting Counter Payment', time: '9:30 AM', done: true },
      { status: 'Confirmed', time: '--', done: false },
      { status: 'Preparing', time: '--', done: false },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  // Order 5 for Merienda ni Aling Tess (Paid & Completed Handover)
  {
    id: 'SPT-9018',
    pickupToken: 'spt_tok_spt9018_88194e',
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
    paymentMethod: 'Online Payment (GCash)',
    paymentStatus: 'Paid',
    paidAt: 'Today 07:46 AM',
    claimedAt: 'Today 09:50 AM',
    transactionReference: 'TXN-GCASH-88194',
    createdAt: 'Today 07:45 AM',
    timeline: [
      { status: 'Preordered', time: '7:45 AM', done: true },
      { status: 'Payment Verified', time: '7:46 AM', done: true },
      { status: 'Confirmed', time: '8:00 AM', done: true },
      { status: 'Preparing', time: '9:15 AM', done: true },
      { status: 'Ready for Pickup', time: '9:35 AM', done: true },
      { status: 'Completed', time: '9:50 AM', done: true }
    ]
  },
  // Order 6: Confirmed & Prepared but Uncollected No-Show
  {
    id: 'SPT-9012',
    pickupToken: 'spt_tok_spt9012_90128f',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    vendorStall: "Stall #3",
    studentName: 'Kenji Garcia',
    studentId: '2024-0312',
    gradeSection: 'Grade 12 - STEM C',
    pickupTime: '11:30 AM (Lunch Shift 1)',
    specialInstructions: 'Extra rice portion',
    items: [
      { id: 'dish-lita-1', name: 'Chicken Adobo', price: 65, quantity: 1, vendorId: 'vendor-lita' }
    ],
    totalAmount: 65,
    totalServings: 1,
    status: 'No-show',
    paymentMethod: 'Online Payment (GCash)',
    paymentStatus: 'Paid',
    paidAt: 'Today 08:16 AM',
    transactionReference: 'TXN-GCASH-90128',
    createdAt: 'Today 08:15 AM',
    noShowExplanation: 'Emergency physics laboratory experiment extended past scheduled class hours.',
    incidentStatus: 'Under Review',
    timeline: [
      { status: 'Preordered', time: '8:15 AM', done: true },
      { status: 'Payment Verified', time: '8:16 AM', done: true },
      { status: 'Confirmed', time: '8:30 AM', done: true },
      { status: 'Preparing', time: '10:45 AM', done: true },
      { status: 'Ready for Pickup', time: '11:15 AM', done: true },
      { status: 'No-show', time: '12:00 PM', done: true }
    ]
  },
  // Order 7: Expired Counter Payment (Portions Released)
  {
    id: 'SPT-9010',
    pickupToken: 'spt_tok_spt9010_expired',
    vendorId: 'vendor-ben',
    vendorName: "Kuya Ben's Silog Meals",
    vendorStall: "Stall #1",
    studentName: 'Mark Cruz',
    studentId: '2024-0711',
    gradeSection: 'Grade 11 - TVL ICT',
    pickupTime: '11:30 AM (Lunch Shift 1)',
    specialInstructions: 'Well done egg',
    items: [
      { id: 'dish-ben-1', name: 'Tapsilog', price: 85, quantity: 1, vendorId: 'vendor-ben' }
    ],
    totalAmount: 85,
    totalServings: 1,
    status: 'Expired',
    paymentMethod: 'Direct Counter Payment',
    paymentStatus: 'Expired',
    paymentDeadline: '09:00 AM (Expired)',
    expiredReason: 'Payment deadline exceeded at Counter Window 1. Portions released.',
    createdAt: 'Today 08:40 AM',
    timeline: [
      { status: 'Preordered', time: '8:40 AM', done: true },
      { status: 'Expired', time: '9:00 AM', done: true }
    ]
  }
];

// Structured Payment Records (Audit Trail)
const INITIAL_PAYMENTS = [
  {
    paymentId: 'PAY-9021',
    reservationId: 'SPT-9021',
    studentId: '2024-0891',
    studentName: 'Maria Santos',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    paymentMethod: 'Online Payment (GCash)',
    amount: 65,
    paymentStatus: 'Paid',
    transactionReference: 'TXN-GCASH-90218',
    createdAt: '2026-11-09T08:30:00.000Z',
    paidAt: '2026-11-09T08:31:00.000Z',
    verifiedBy: 'Gateway Webhook (Simulated GCash)',
    verificationTimestamp: '2026-11-09T08:31:00.000Z'
  },
  {
    paymentId: 'PAY-9022',
    reservationId: 'SPT-9022',
    studentId: '2024-0412',
    studentName: 'Juan Dela Cruz',
    vendorId: 'vendor-ben',
    vendorName: "Kuya Ben's Silog Meals",
    paymentMethod: 'Online Payment (Maya)',
    amount: 170,
    paymentStatus: 'Paid',
    transactionReference: 'TXN-MAYA-44120',
    createdAt: '2026-11-09T09:10:00.000Z',
    paidAt: '2026-11-09T09:11:00.000Z',
    verifiedBy: 'Gateway Webhook (Simulated Maya)',
    verificationTimestamp: '2026-11-09T09:11:00.000Z'
  },
  {
    paymentId: 'PAY-9025',
    reservationId: 'SPT-9025',
    studentId: '2024-1102',
    studentName: 'Bea Alonzo',
    vendorId: 'vendor-cora',
    vendorName: "Nanay Cora's Lutong Bahay",
    paymentMethod: 'Direct Counter Payment',
    amount: 105,
    paymentStatus: 'Paid',
    transactionReference: 'RCPT-STALL2-0925',
    createdAt: '2026-11-09T08:50:00.000Z',
    paidAt: '2026-11-09T08:58:00.000Z',
    verifiedBy: "Nanay Cora's Cashier",
    verificationTimestamp: '2026-11-09T08:58:00.000Z'
  },
  {
    paymentId: 'PAY-9026',
    reservationId: 'SPT-9026',
    studentId: '2024-0551',
    studentName: 'Paolo Reyes',
    vendorId: 'vendor-green',
    vendorName: "Green Bowl Express",
    paymentMethod: 'Direct Counter Payment',
    amount: 150,
    paymentStatus: 'Pending',
    transactionReference: 'PENDING-COUNTER-026',
    createdAt: '2026-11-09T09:30:00.000Z',
    paidAt: null,
    verifiedBy: null,
    verificationTimestamp: null
  },
  {
    paymentId: 'PAY-9018',
    reservationId: 'SPT-9018',
    studentId: '2024-0891',
    studentName: 'Maria Santos',
    vendorId: 'vendor-tess',
    vendorName: "Merienda ni Aling Tess",
    paymentMethod: 'Online Payment (GCash)',
    amount: 80,
    paymentStatus: 'Paid',
    transactionReference: 'TXN-GCASH-88194',
    createdAt: '2026-11-09T07:45:00.000Z',
    paidAt: '2026-11-09T07:46:00.000Z',
    verifiedBy: 'Gateway Webhook (Simulated GCash)',
    verificationTimestamp: '2026-11-09T07:46:00.000Z'
  },
  {
    paymentId: 'PAY-9012',
    reservationId: 'SPT-9012',
    studentId: '2024-0312',
    studentName: 'Kenji Garcia',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    paymentMethod: 'Online Payment (GCash)',
    amount: 65,
    paymentStatus: 'Paid',
    transactionReference: 'TXN-GCASH-90128',
    createdAt: '2026-11-09T08:15:00.000Z',
    paidAt: '2026-11-09T08:16:00.000Z',
    verifiedBy: 'Gateway Webhook (Simulated GCash)',
    verificationTimestamp: '2026-11-09T08:16:00.000Z'
  }
];

// Structured Incident & Audit Trail Logs
const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    timestamp: '2026-11-09T08:31:00.000Z',
    eventType: 'PAYMENT_VERIFIED',
    orderId: 'SPT-9021',
    studentId: '2024-0891',
    studentName: 'Maria Santos',
    vendorId: 'vendor-lita',
    details: 'Verified online payment via GCash (TXN-GCASH-90218) for ₱65.00. Reservation confirmed.',
    incidentStatus: 'N/A'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-11-09T08:58:00.000Z',
    eventType: 'COUNTER_PAYMENT_VERIFIED',
    orderId: 'SPT-9025',
    studentId: '2024-1102',
    studentName: 'Bea Alonzo',
    vendorId: 'vendor-cora',
    details: 'Counter payment received and verified by Nanay Cora cashier for ₱105.00. Reservation confirmed.',
    incidentStatus: 'N/A'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-11-09T10:05:00.000Z',
    eventType: 'NO_SHOW_RECORDED',
    orderId: 'SPT-9012',
    studentId: '2024-0312',
    studentName: 'Kenji Garcia',
    vendorId: 'vendor-lita',
    details: 'Student did not claim confirmed pre-order within 11:30 AM shift + 15 min grace period. Meal held.',
    explanation: 'Emergency physics laboratory experiment extended past scheduled class hours.',
    incidentStatus: 'Under Review',
    referralOffice: 'Office of Student Affairs and Services (OSAS)'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-11-09T09:55:00.000Z',
    eventType: 'RESERVATION_EXPIRED',
    orderId: 'SPT-9010',
    studentId: '2024-0711',
    studentName: 'Mark Cruz',
    vendorId: 'vendor-ben',
    details: 'Counter payment deadline exceeded (20 mins expired). 1 portion returned to kitchen inventory.',
    incidentStatus: 'Resolved',
    notes: 'Auto-released inventory; student notified.'
  }
];

// Seed Settings & Profile
const INITIAL_SETTINGS = {
  schoolName: "Mindoro State University (MinSU) Main Canteen",
  institutionName: "Mindoro State University (MinSU)",
  studentAffairsOffice: "Office of Student Affairs and Services (OSAS)",
  counterPaymentDeadlineMinutes: 20,
  pickupGracePeriodMinutes: 15,
  noShowThresholdForReview: 2,
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

// Seed Verified Student Reviews
const INITIAL_REVIEWS = [
  {
    id: 'REV-101',
    orderId: 'SPT-9021',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    dishId: 'dish-lita-1',
    dishName: 'Chicken Adobo',
    studentName: 'Maria Santos',
    rating: 5,
    tasteTag: 'Perfect Flavor',
    portionTag: 'Generous Serving',
    comment: 'Super savory and tender chicken. Claimed instantly via QR pass without waiting in line!',
    createdAt: '2026-11-09T03:30:00Z'
  },
  {
    id: 'REV-102',
    orderId: 'SPT-9014',
    vendorId: 'vendor-lita',
    vendorName: "Ate Lita's Kitchen",
    dishId: 'dish-lita-2',
    dishName: 'Pork Sinigang',
    studentName: 'Joshua Reyes',
    rating: 4,
    tasteTag: 'Slightly Sour',
    portionTag: 'Just Right',
    comment: 'Great broth and crisp kangkong. Steaming hot and fresh upon pickup.',
    createdAt: '2026-11-08T12:15:00Z'
  }
];

// Storage Handler with multi-vendor support
class SapatStorage {
  static getVendors() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_VENDORS);
      if (!data) {
        this.saveVendors(INITIAL_VENDORS);
        return INITIAL_VENDORS;
      }
      const vendors = JSON.parse(data);
      let vendorsUpdated = false;
      vendors.forEach(v => {
        const seed = INITIAL_VENDORS.find(sv => sv.id === v.id);
        if (seed && (!v.bannerImage || v.bannerImage.includes('unsplash.com'))) {
          v.bannerImage = seed.bannerImage;
          vendorsUpdated = true;
        }
      });
      if (vendorsUpdated) {
        localStorage.setItem(SAPAT_STORAGE_KEY_VENDORS, JSON.stringify(vendors));
      }
      return vendors;
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

  static toggleVendorStatus(vendorId, isOpen) {
    const vendors = this.getVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return false;
    vendor.isOpen = isOpen;
    vendor.statusText = isOpen ? 'Open Now' : 'Closed';
    this.saveVendors(vendors);
    return true;
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
      let menuUpdated = false;
      menu.forEach(item => {
        const seed = INITIAL_MENU.find(sm => sm.id === item.id);
        if (seed && (!item.image || item.image.includes('unsplash.com'))) {
          item.image = seed.image;
          menuUpdated = true;
        }
      });
      if (menuUpdated) {
        localStorage.setItem(SAPAT_STORAGE_KEY_MENU, JSON.stringify(menu));
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

  static updateDishDailyLimit(dishId, newLimit) {
    const menu = this.getMenu();
    const dish = menu.find(d => d.id === dishId);
    if (!dish) return { success: false, error: 'Dish not found' };
    const minVal = dish.reservedCount || 0;
    dish.dailyLimit = Math.max(minVal, Math.min(250, Number(newLimit) || minVal));
    this.saveMenu(menu);
    return { success: true, dish };
  }

  static getOrders() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_ORDERS);
      let orders = INITIAL_ORDERS;
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) orders = parsed;
        } catch (e) {
          console.error('Failed reading orders from localStorage', e);
        }
      }

      // Ensure every reservation has a persistent opaque pickup token
      let hasUpdates = false;
      orders.forEach((o, idx) => {
        if (!o.pickupToken) {
          const cleanId = (o.id || `spt${idx}`).toLowerCase().replace(/[^a-z0-9]/g, '');
          o.pickupToken = `spt_tok_${cleanId}_${(idx + 1) * 31}ab`;
          hasUpdates = true;
        }
      });

      if (hasUpdates || !data) {
        localStorage.setItem(SAPAT_STORAGE_KEY_ORDERS, JSON.stringify(orders));
      }
      return orders;
    } catch (e) {
      console.error('Failed in getOrders', e);
      return INITIAL_ORDERS;
    }
  }

  static getOrderByToken(tokenOrCode) {
    if (!tokenOrCode) return null;
    const clean = String(tokenOrCode).trim();
    const orders = this.getOrders();
    return orders.find(o =>
      o.pickupToken === clean ||
      (o.id && o.id.toUpperCase() === clean.toUpperCase())
    ) || null;
  }

  /**
   * Validates and completes a reservation handover.
   * Enforces vendor stall ownership, verified payment, and single-redemption rules.
   */
  static claimOrder(orderIdOrToken, currentVendorId) {
    const orders = this.getOrders();
    const clean = String(orderIdOrToken).trim();
    const orderIndex = orders.findIndex(o =>
      o.id === clean ||
      o.pickupToken === clean ||
      (o.id && o.id.toUpperCase() === clean.toUpperCase())
    );

    if (orderIndex === -1) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'Pre-order reference or QR pickup token not found.'
      };
    }

    const order = orders[orderIndex];

    // Check stall ownership
    if (currentVendorId && order.vendorId !== currentVendorId) {
      const ownerVendor = this.getVendorById(order.vendorId);
      const ownerName = ownerVendor ? `${ownerVendor.name} (${ownerVendor.stallNumber})` : 'a different stall';
      return {
        success: false,
        reason: 'WRONG_VENDOR',
        message: `This pre-order belongs to ${ownerName}. Not redeemable at your stall counter.`,
        order
      };
    }

    // Check if expired
    if (order.status === 'Expired' || order.paymentStatus === 'Expired') {
      return {
        success: false,
        reason: 'EXPIRED',
        message: `Pre-order #${order.id} expired due to unpaid counter payment deadline.`,
        order
      };
    }

    // Check if marked no-show
    if (order.status === 'No-show') {
      return {
        success: false,
        reason: 'NO_SHOW',
        message: `Pre-order #${order.id} was marked as No-Show.`,
        order
      };
    }

    // Check if unpaid / pending payment
    if (order.paymentStatus === 'Pending' || order.paymentStatus === 'Failed' || order.status === 'Awaiting Counter Payment') {
      return {
        success: false,
        reason: 'UNPAID_ORDER',
        message: `Pre-order #${order.id} is unpaid. Unverified reservations cannot be handed over.`,
        order
      };
    }

    // Check if already claimed / completed
    if (order.status === 'Completed') {
      return {
        success: false,
        reason: 'ALREADY_CLAIMED',
        message: `Pre-order #${order.id} has already been claimed and handed over. Duplicate redemptions are prevented.`,
        order
      };
    }

    // Check if cancelled
    if (order.status === 'Cancelled') {
      return {
        success: false,
        reason: 'CANCELLED',
        message: `Pre-order #${order.id} was cancelled. Reserved portions were returned to inventory.`,
        order
      };
    }

    // Mark as completed
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    order.status = 'Completed';
    order.claimedAt = now.toISOString();

    if (Array.isArray(order.timeline)) {
      const completedStep = order.timeline.find(t => t.status === 'Completed');
      if (completedStep) {
        completedStep.time = timeStr;
        completedStep.done = true;
      } else {
        order.timeline.push({ status: 'Completed', time: timeStr, done: true });
      }
    }

    orders[orderIndex] = order;
    this.saveOrders(orders);

    return {
      success: true,
      message: `Pre-order #${order.id} verified and marked Completed!`,
      order
    };
  }

  static saveOrders(orders) {
    localStorage.setItem(SAPAT_STORAGE_KEY_ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'orders' } }));
  }

  // =========================================================================
  // PAYMENT MANAGEMENT & RESERVATION CONFIRMATION
  // =========================================================================

  static getPayments() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_PAYMENTS);
      if (!data) {
        this.savePayments(INITIAL_PAYMENTS);
        return INITIAL_PAYMENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed in getPayments', e);
      return INITIAL_PAYMENTS;
    }
  }

  static savePayments(payments) {
    localStorage.setItem(SAPAT_STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'payments' } }));
  }

  static getPaymentByReservationId(reservationId) {
    if (!reservationId) return null;
    const clean = String(reservationId).trim().toUpperCase();
    const payments = this.getPayments();
    return payments.find(p => p.reservationId && p.reservationId.toUpperCase() === clean) || null;
  }

  static createPaymentRecord(data) {
    const payments = this.getPayments();
    const newPayment = {
      paymentId: data.paymentId || ('PAY-' + Math.floor(1000 + Math.random() * 9000)),
      reservationId: data.reservationId,
      studentId: data.studentId || '2024-0891',
      studentName: data.studentName || 'Student',
      vendorId: data.vendorId,
      vendorName: data.vendorName || 'Canteen',
      paymentMethod: data.paymentMethod || 'Online Payment (GCash)',
      amount: data.amount || 0,
      paymentStatus: data.paymentStatus || 'Pending',
      transactionReference: data.transactionReference || ('TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()),
      createdAt: data.createdAt || new Date().toISOString(),
      paidAt: data.paidAt || null,
      verifiedBy: data.verifiedBy || null,
      verificationTimestamp: data.verificationTimestamp || null
    };
    payments.unshift(newPayment);
    this.savePayments(payments);
    return newPayment;
  }

  /**
   * Verifies a counter payment in person.
   * Only verified payments transition an order to Confirmed.
   */
  static verifyCounterPayment(orderId, verifiedBy = 'Canteen Cashier') {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = orders[orderIndex];
    if (order.paymentStatus === 'Paid') {
      return { success: false, reason: 'ALREADY_PAID', message: 'Order is already marked as paid' };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    order.paidAt = now.toISOString();
    order.verifiedBy = verifiedBy;
    order.transactionReference = order.transactionReference || ('RCPT-' + (order.vendorStall || 'STALL').replace(/[^a-zA-Z0-9]/g, '') + '-' + order.id.replace(/[^0-9]/g, ''));

    // Ensure pickup token is generated and valid
    if (!order.pickupToken) {
      const cleanId = order.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      order.pickupToken = `spt_tok_${cleanId}_${btoa(order.id).substring(0, 8).toLowerCase()}`;
    }

    if (Array.isArray(order.timeline)) {
      const counterStep = order.timeline.find(t => t.status === 'Counter Payment Verified' || t.status === 'Payment Verified');
      if (counterStep) {
        counterStep.done = true;
        counterStep.time = timeStr;
      } else {
        order.timeline.push({ status: 'Counter Payment Verified', time: timeStr, done: true });
      }
      const confirmStep = order.timeline.find(t => t.status === 'Confirmed');
      if (confirmStep) {
        confirmStep.done = true;
        confirmStep.time = timeStr;
      }
    }

    orders[orderIndex] = order;
    this.saveOrders(orders);

    // Update payment record
    const payments = this.getPayments();
    let payment = payments.find(p => p.reservationId === order.id);
    if (payment) {
      payment.paymentStatus = 'Paid';
      payment.paidAt = now.toISOString();
      payment.verifiedBy = verifiedBy;
      payment.verificationTimestamp = now.toISOString();
      payment.transactionReference = order.transactionReference;
    } else {
      payments.unshift({
        paymentId: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
        reservationId: order.id,
        studentId: order.studentId || '2024-0891',
        studentName: order.studentName || 'Student',
        vendorId: order.vendorId,
        vendorName: order.vendorName,
        paymentMethod: 'Direct Counter Payment',
        amount: order.totalAmount,
        paymentStatus: 'Paid',
        transactionReference: order.transactionReference,
        createdAt: order.createdAt || now.toISOString(),
        paidAt: now.toISOString(),
        verifiedBy: verifiedBy,
        verificationTimestamp: now.toISOString()
      });
    }
    this.savePayments(payments);

    // Log audit event
    this.logAuditEvent('COUNTER_PAYMENT_VERIFIED', {
      orderId: order.id,
      studentId: order.studentId,
      studentName: order.studentName,
      vendorId: order.vendorId,
      details: `Counter payment of ₱${order.totalAmount} verified by ${verifiedBy}. Reservation #${order.id} confirmed.`
    });

    return { success: true, order };
  }

  /**
   * Completes online payment verification (simulated gateway callback).
   */
  static recordOnlinePayment(orderId, paymentMethod = 'Online Payment (GCash)', txnRef = null) {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = orders[orderIndex];
    if (order.paymentStatus === 'Paid') {
      return { success: false, reason: 'ALREADY_PAID', message: 'Order is already marked as paid' };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ref = txnRef || ('TXN-' + (paymentMethod.includes('Maya') ? 'MAYA' : (paymentMethod.includes('QR Ph') ? 'QRPH' : 'GCASH')) + '-' + Math.floor(10000 + Math.random() * 90000));

    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    order.paidAt = now.toISOString();
    order.transactionReference = ref;

    if (!order.pickupToken) {
      const cleanId = order.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      order.pickupToken = `spt_tok_${cleanId}_${btoa(order.id).substring(0, 8).toLowerCase()}`;
    }

    if (Array.isArray(order.timeline)) {
      order.timeline.push({ status: 'Online Payment Verified', time: timeStr, done: true });
      const confirmStep = order.timeline.find(t => t.status === 'Confirmed');
      if (confirmStep) {
        confirmStep.done = true;
        confirmStep.time = timeStr;
      }
    }

    orders[orderIndex] = order;
    this.saveOrders(orders);

    // Payment record
    const payments = this.getPayments();
    let payment = payments.find(p => p.reservationId === order.id);
    if (payment) {
      payment.paymentMethod = paymentMethod;
      payment.paymentStatus = 'Paid';
      payment.transactionReference = ref;
      payment.paidAt = now.toISOString();
      payment.verifiedBy = `Gateway Webhook (${paymentMethod})`;
      payment.verificationTimestamp = now.toISOString();
    } else {
      payments.unshift({
        paymentId: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
        reservationId: order.id,
        studentId: order.studentId || '2024-0891',
        studentName: order.studentName || 'Student',
        vendorId: order.vendorId,
        vendorName: order.vendorName,
        paymentMethod,
        amount: order.totalAmount,
        paymentStatus: 'Paid',
        transactionReference: ref,
        createdAt: order.createdAt || now.toISOString(),
        paidAt: now.toISOString(),
        verifiedBy: `Gateway Webhook (${paymentMethod})`,
        verificationTimestamp: now.toISOString()
      });
    }
    this.savePayments(payments);

    this.logAuditEvent('PAYMENT_VERIFIED', {
      orderId: order.id,
      studentId: order.studentId,
      studentName: order.studentName,
      vendorId: order.vendorId,
      details: `Online payment via ${paymentMethod} (${ref}) for ₱${order.totalAmount} verified. Reservation #${order.id} confirmed.`
    });

    return { success: true, order, transactionReference: ref };
  }

  /**
   * Simulates a payment failure.
   */
  static recordOnlinePaymentFailure(orderId, errorReason = 'Transaction declined by gateway') {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = orders[orderIndex];
    order.paymentStatus = 'Failed';
    orders[orderIndex] = order;
    this.saveOrders(orders);

    const payments = this.getPayments();
    let payment = payments.find(p => p.reservationId === order.id);
    if (payment) {
      payment.paymentStatus = 'Failed';
      payment.failureReason = errorReason;
      this.savePayments(payments);
    }

    this.logAuditEvent('PAYMENT_FAILED', {
      orderId: order.id,
      studentId: order.studentId,
      studentName: order.studentName,
      vendorId: order.vendorId,
      details: `Payment failure for #${order.id}: ${errorReason}.`
    });

    return { success: true, order };
  }

  /**
   * Expires an unpaid counter reservation and restores portions to inventory.
   */
  static expireUnpaidReservation(orderId, reason = 'Payment deadline exceeded at stall counter') {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = orders[orderIndex];
    if (order.paymentStatus === 'Paid') {
      return { success: false, message: 'Cannot expire a paid order' };
    }

    // Release portions back to menu inventory
    const menu = this.getMenu();
    let inventoryRestored = 0;
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const dish = menu.find(d => d.id === item.id);
        if (dish) {
          dish.reservedServings = Math.max(0, (dish.reservedServings || 0) - item.quantity);
          inventoryRestored += item.quantity;
        }
      }
      this.saveMenu(menu);
    }

    order.status = 'Expired';
    order.paymentStatus = 'Expired';
    order.expiredReason = reason;
    order.expiredAt = new Date().toISOString();

    if (Array.isArray(order.timeline)) {
      order.timeline.push({ status: 'Expired', time: 'Expired', done: true });
    }

    orders[orderIndex] = order;
    this.saveOrders(orders);

    const payments = this.getPayments();
    let payment = payments.find(p => p.reservationId === order.id);
    if (payment) {
      payment.paymentStatus = 'Expired';
      this.savePayments(payments);
    }

    this.logAuditEvent('RESERVATION_EXPIRED', {
      orderId: order.id,
      studentId: order.studentId,
      studentName: order.studentName,
      vendorId: order.vendorId,
      details: `Unpaid reservation #${order.id} expired. ${inventoryRestored} portion(s) released back to kitchen inventory.`
    });

    return { success: true, order, inventoryRestored };
  }

  /**
   * Marks a confirmed ready order as an uncollected No-show.
   */
  static markOrderNoShow(orderId, vendorId = null) {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = orders[orderIndex];
    order.status = 'No-show';
    order.noShowRecordedAt = new Date().toISOString();
    order.incidentStatus = 'Under Review';

    if (Array.isArray(order.timeline)) {
      order.timeline.push({ status: 'No-show', time: 'Uncollected', done: true });
    }

    orders[orderIndex] = order;
    this.saveOrders(orders);

    this.logAuditEvent('NO_SHOW_RECORDED', {
      orderId: order.id,
      studentId: order.studentId,
      studentName: order.studentName,
      vendorId: order.vendorId,
      details: `Pre-order #${order.id} was not claimed within pickup window + grace period. Prepared meal held.`,
      incidentStatus: 'Under Review'
    });

    return { success: true, order };
  }

  /**
   * Records student-submitted explanation for a missed pickup.
   */
  static submitNoShowExplanation(orderId, explanationText) {
    if (!explanationText || !explanationText.trim()) {
      return { success: false, message: 'Explanation text is required' };
    }

    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = orders[orderIndex];
    order.noShowExplanation = explanationText.trim();
    order.explanationSubmittedAt = new Date().toISOString();
    orders[orderIndex] = order;
    this.saveOrders(orders);

    // Update audit logs
    const logs = this.getAuditLogs();
    const match = logs.find(l => (l.orderId === orderId || l.reservationId === orderId) && l.eventType === 'NO_SHOW_RECORDED');
    if (match) {
      match.explanation = explanationText.trim();
      match.studentExplanation = explanationText.trim();
      match.explanationSubmittedAt = order.explanationSubmittedAt;
      this.saveAuditLogs(logs);
    } else {
      this.logAuditEvent('STUDENT_EXPLANATION_SUBMITTED', {
        orderId: order.id,
        reservationId: order.id,
        studentId: order.studentId,
        studentName: order.studentName,
        vendorId: order.vendorId,
        details: `Student explanation submitted: "${explanationText.trim()}"`,
        explanation: explanationText.trim(),
        studentExplanation: explanationText.trim()
      });
    }

    return { success: true, order };
  }

  // =========================================================================
  // AUDIT LOGS & INCIDENT GOVERNANCE
  // =========================================================================

  static getAuditLogs() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_AUDIT_LOGS);
      if (!data) {
        this.saveAuditLogs(INITIAL_AUDIT_LOGS);
        return INITIAL_AUDIT_LOGS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed in getAuditLogs', e);
      return INITIAL_AUDIT_LOGS;
    }
  }

  static saveAuditLogs(logs) {
    localStorage.setItem(SAPAT_STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'audit-logs' } }));
  }

  static logAuditEvent(eventType, payload = {}) {
    const logs = this.getAuditLogs();
    const orderRef = payload.orderId || payload.reservationId || null;
    const expl = payload.studentExplanation || payload.explanation || null;
    const newEntry = {
      id: 'LOG-' + Math.floor(100 + Math.random() * 900),
      timestamp: new Date().toISOString(),
      eventType,
      orderId: orderRef,
      reservationId: orderRef,
      studentId: payload.studentId || null,
      studentName: payload.studentName || null,
      vendorId: payload.vendorId || null,
      details: payload.details || '',
      explanation: expl,
      studentExplanation: expl,
      incidentStatus: payload.incidentStatus || 'N/A',
      referredToOSAS: payload.referredToOSAS || false,
      resolved: payload.resolved || false,
      notes: payload.notes || null,
      referralOffice: payload.referralOffice || null
    };
    logs.unshift(newEntry);
    this.saveAuditLogs(logs);
    return newEntry;
  }

  static referIncidentToOSAS(logIdOrOrderId, adminNotes = '') {
    const logs = this.getAuditLogs();
    const log = logs.find(l => l.id === logIdOrOrderId || l.orderId === logIdOrOrderId || l.reservationId === logIdOrOrderId);
    if (!log) return { success: false, message: 'Incident log not found' };

    const settings = this.getSettings();
    const officeName = settings.studentAffairsOffice || 'Office of Student Affairs and Services (OSAS)';

    log.incidentStatus = 'Referred to OSAS';
    log.referredToOSAS = true;
    log.referralOffice = officeName;
    log.referredAt = new Date().toISOString();
    log.adminNotes = adminNotes || `Referred to ${officeName} for student accountability review`;
    this.saveAuditLogs(logs);

    // Also update order if present
    const orderRef = log.orderId || log.reservationId;
    if (orderRef) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderRef);
      if (order) {
        order.incidentStatus = 'Referred to OSAS';
        order.referralOffice = officeName;
        this.saveOrders(orders);
      }
    }

    return { success: true, log, officeName };
  }

  static resolveIncident(logIdOrOrderId, adminNotes = '') {
    const logs = this.getAuditLogs();
    const log = logs.find(l => l.id === logIdOrOrderId || l.orderId === logIdOrOrderId || l.reservationId === logIdOrOrderId);
    if (!log) return { success: false, message: 'Incident log not found' };

    log.incidentStatus = 'Resolved';
    log.resolved = true;
    log.resolvedAt = new Date().toISOString();
    log.resolutionNote = adminNotes || 'Incident reviewed and resolved by campus administrator';
    log.adminNotes = log.resolutionNote;
    this.saveAuditLogs(logs);

    const orderRef = log.orderId || log.reservationId;
    if (orderRef) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderRef);
      if (order) {
        order.incidentStatus = 'Resolved';
        this.saveOrders(orders);
      }
    }

    return { success: true, log };
  }

  // =========================================================================
  // STUDENT FOOD FEEDBACK & VERIFIED REVIEWS
  // =========================================================================

  static getReviews(vendorId = null) {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_REVIEWS);
      let reviews = [];
      if (!data) {
        this.saveReviews(INITIAL_REVIEWS);
        reviews = INITIAL_REVIEWS;
      } else {
        reviews = JSON.parse(data);
      }
      if (vendorId) {
        return reviews.filter(r => r.vendorId === vendorId);
      }
      return reviews;
    } catch (e) {
      console.error('Failed in getReviews', e);
      return INITIAL_REVIEWS;
    }
  }

  static saveReviews(reviews) {
    localStorage.setItem(SAPAT_STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'reviews' } }));
  }

  static submitReview({ orderId, vendorId, dishId, dishName, studentName, rating, tasteTag, portionTag, comment }) {
    if (!orderId) return { success: false, message: 'Order reference is required' };

    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const now = new Date().toISOString();

    const newReview = {
      id: 'REV-' + Math.floor(1000 + Math.random() * 9000),
      orderId: order.id,
      vendorId: vendorId || order.vendorId,
      vendorName: order.vendorName,
      dishId: dishId || (order.items && order.items[0] ? order.items[0].id : null),
      dishName: dishName || (order.items && order.items[0] ? order.items[0].name : 'Canteen Dish'),
      studentName: studentName || order.studentName || 'Student',
      rating: cleanRating,
      tasteTag: tasteTag || 'Perfect Flavor',
      portionTag: portionTag || 'Just Right',
      comment: (comment || '').trim(),
      createdAt: now
    };

    const reviews = this.getReviews();
    reviews.unshift(newReview);
    this.saveReviews(reviews);

    // Update order record
    order.reviewed = true;
    order.reviewRating = cleanRating;
    order.reviewComment = newReview.comment;
    order.reviewTasteTag = newReview.tasteTag;
    order.reviewPortionTag = newReview.portionTag;
    order.reviewedAt = now;
    this.saveOrders(orders);

    // Log audit event
    this.logAuditEvent('FEEDBACK_SUBMITTED', {
      orderId: order.id,
      studentName: newReview.studentName,
      vendorId: newReview.vendorId,
      details: `Student meal review submitted for #${order.id} (${newReview.dishName}): ${cleanRating}/5 stars. Tag: ${newReview.tasteTag}.`
    });

    return { success: true, review: newReview, order };
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
    localStorage.removeItem(SAPAT_STORAGE_KEY_PAYMENTS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_AUDIT_LOGS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_REVIEWS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_CURRENT_VENDOR);
    localStorage.removeItem(SAPAT_STORAGE_KEY_STUDENT_VENDOR);
    this.saveVendors(INITIAL_VENDORS);
    this.saveMenu(INITIAL_MENU);
    this.saveOrders(INITIAL_ORDERS);
    this.savePayments(INITIAL_PAYMENTS);
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
    this.saveReviews(INITIAL_REVIEWS);
    this.saveSettings(INITIAL_SETTINGS);
    this.setCurrentVendorId('vendor-lita');
    this.setStudentSelectedVendor('all');
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'all' } }));
  }
}

if (typeof window !== 'undefined') {
  window.SapatStorage = SapatStorage;
}

export {
  SapatStorage,
  INITIAL_VENDORS,
  INITIAL_MENU,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS
};
