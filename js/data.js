// Initial mock data for Sapat Mobile Prototype
const SAPAT_STORAGE_KEY_MENU = 'sapat_menu_items_v1';
const SAPAT_STORAGE_KEY_ORDERS = 'sapat_orders_v1';
const SAPAT_STORAGE_KEY_SETTINGS = 'sapat_settings_v1';
const SAPAT_STORAGE_KEY_ROLE = 'sapat_current_role_v1';

// Seed Menu Items (Authentic Filipino School Canteen Meals)
const INITIAL_MENU = [
  {
    id: 'dish-1',
    name: 'Classic Chicken Adobo with Rice',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 65,
    description: 'Tender chicken braised in soy sauce, cane vinegar, garlic, and cracked peppercorn. Served with piping hot steamed rice.',
    dailyLimit: 45,
    reservedServings: 24, // 21 remaining
    isAvailable: true,
    suggestedPrep: 45, // Based on historical Monday demand
    historicalAvg: 42,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
    tags: ['Best Seller', 'High Protein'],
    prepNote: 'Morning batch ready at 10:00 AM'
  },
  {
    id: 'dish-2',
    name: 'Pork Sinigang sa Sampalok',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 70,
    description: 'Sour tamarind soup with soft pork ribs, kangkong, radish, and string beans. Perfectly comforting for lunch.',
    dailyLimit: 35,
    reservedServings: 32, // 3 remaining!
    isAvailable: true,
    suggestedPrep: 35,
    historicalAvg: 34,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    tags: ['Soup Favorite', 'Almost Full'],
    prepNote: 'Cooked fresh at 11:00 AM'
  },
  {
    id: 'dish-3',
    name: 'Crispy Lumpiang Shanghai (6 pcs)',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 45,
    description: 'Crispy fried mini spring rolls filled with seasoned ground meat and minced carrots. Comes with sweet chili dip.',
    dailyLimit: 40,
    reservedServings: 40, // 0 remaining -> SOLD OUT!
    isAvailable: true,
    suggestedPrep: 50,
    historicalAvg: 48,
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
    tags: ['Sold Out', 'Snack'],
    prepNote: 'Preparation limit reached for today'
  },
  {
    id: 'dish-4',
    name: 'Pancit Canton Guisado',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 40,
    description: 'Stir-fried egg noodles with shredded chicken, crunchy cabbage, carrots, and calamansi on the side.',
    dailyLimit: 30,
    reservedServings: 14, // 16 remaining
    isAvailable: true,
    suggestedPrep: 30,
    historicalAvg: 28,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    tags: ['Merienda Hit'],
    prepNote: 'Afternoon recess batch available'
  },
  {
    id: 'dish-5',
    name: 'Beef Tapa Silog Bowl',
    category: 'rice-meals',
    categoryName: 'Kanin at Ulam',
    price: 75,
    description: 'Savory sweet cured beef slices paired with fragrant garlic fried rice and a sunny-side egg.',
    dailyLimit: 25,
    reservedServings: 18, // 7 remaining
    isAvailable: true,
    suggestedPrep: 25,
    historicalAvg: 24,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    tags: ['All-Day Breakfast'],
    prepNote: 'Includes fried egg and atchara'
  },
  {
    id: 'dish-6',
    name: 'Ginataang Kalabasa at Sitaw',
    category: 'veggies',
    categoryName: 'Gulay & Healthy',
    price: 45,
    description: 'Squash chunks and string beans stewed in thick coconut milk with a hint of ginger and shrimp essence.',
    dailyLimit: 20,
    reservedServings: 8, // 12 remaining
    isAvailable: true,
    suggestedPrep: 20,
    historicalAvg: 18,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegetarian Friendly', 'Nutritious'],
    prepNote: 'Rich in Vitamin A'
  },
  {
    id: 'dish-7',
    name: 'Chilled House Sago’t Gulaman',
    category: 'drinks',
    categoryName: 'Inumin',
    price: 25,
    description: 'Traditional brown sugar syrup cooler loaded with chewy tapioca pearls and diced grass jelly.',
    dailyLimit: 50,
    reservedServings: 22, // 28 remaining
    isAvailable: true,
    suggestedPrep: 50,
    historicalAvg: 45,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    tags: ['Refreshing', 'Cold'],
    prepNote: 'Served ice cold'
  },
  {
    id: 'dish-8',
    name: 'Crispy Caramel Turon (2 pcs)',
    category: 'merienda',
    categoryName: 'Meryenda',
    price: 30,
    description: 'Sweet Saba bananas and ripe jackfruit slices wrapped in lumpia pastry, glazed with caramelized brown sugar.',
    dailyLimit: 30,
    reservedServings: 19, // 11 remaining
    isAvailable: true,
    suggestedPrep: 35,
    historicalAvg: 32,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    tags: ['Warm Treat'],
    prepNote: 'Fried fresh every morning'
  }
];

// Seed Orders
const INITIAL_ORDERS = [
  {
    id: 'SPT-9021',
    studentName: 'Maria Santos',
    studentId: '2024-0891',
    gradeSection: 'Grade 11 - STEM A',
    pickupTime: '11:30 AM (Lunch Shift 1)',
    specialInstructions: 'Paki-hiwalay po ang sabaw kung maaari',
    items: [
      { id: 'dish-1', name: 'Classic Chicken Adobo with Rice', price: 65, quantity: 1 },
      { id: 'dish-7', name: 'Chilled House Sago’t Gulaman', price: 25, quantity: 1 }
    ],
    totalAmount: 90,
    totalServings: 2,
    status: 'Ready for Pickup', // Pending, Confirmed, Preparing, Ready for Pickup, Completed, Cancelled
    createdAt: '2026-11-08 08:30 AM',
    timeline: [
      { status: 'Preordered', time: '8:30 AM', done: true },
      { status: 'Confirmed', time: '8:45 AM', done: true },
      { status: 'Preparing', time: '10:45 AM', done: true },
      { status: 'Ready for Pickup', time: '11:15 AM', done: true },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  {
    id: 'SPT-9022',
    studentName: 'Juan Dela Cruz',
    studentId: '2024-0412',
    gradeSection: 'Grade 12 - ABM B',
    pickupTime: '12:15 PM (Lunch Shift 2)',
    specialInstructions: 'Extra calamansi po',
    items: [
      { id: 'dish-2', name: 'Pork Sinigang sa Sampalok', price: 70, quantity: 2 }
    ],
    totalAmount: 140,
    totalServings: 2,
    status: 'Preparing',
    createdAt: '2026-11-08 09:10 AM',
    timeline: [
      { status: 'Preordered', time: '9:10 AM', done: true },
      { status: 'Confirmed', time: '9:25 AM', done: true },
      { status: 'Preparing', time: '11:00 AM', done: true },
      { status: 'Ready for Pickup', time: '--', done: false },
      { status: 'Completed', time: '--', done: false }
    ]
  },
  {
    id: 'SPT-9018',
    studentName: 'Bea Alonzo',
    studentId: '2024-1102',
    gradeSection: 'Grade 10 - Rizal',
    pickupTime: '9:45 AM (Morning Recess)',
    specialInstructions: '',
    items: [
      { id: 'dish-4', name: 'Pancit Canton Guisado', price: 40, quantity: 1 },
      { id: 'dish-8', name: 'Crispy Caramel Turon (2 pcs)', price: 30, quantity: 1 }
    ],
    totalAmount: 70,
    totalServings: 2,
    status: 'Completed',
    createdAt: '2026-11-08 07:45 AM',
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
  canteenName: "Ate Lita's Healthy Canteen (Stall #3)",
  schoolName: "Ramon Magsaysay High School Main Canteen",
  operatingHours: "7:00 AM - 4:30 PM",
  prepCutoffTime: "30 minutes before slot",
  studentProfile: {
    name: "Maria Santos",
    studentId: "2024-0891",
    gradeSection: "Grade 11 - STEM A",
    contact: "0917-555-0891",
    preordersCount: 14,
    wasteSavedKg: 4.8
  }
};

// Storage Handler with helper methods
class SapatStorage {
  static getMenu() {
    try {
      const data = localStorage.getItem(SAPAT_STORAGE_KEY_MENU);
      if (!data) {
        this.saveMenu(INITIAL_MENU);
        return INITIAL_MENU;
      }
      return JSON.parse(data);
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
      return JSON.parse(data);
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
    localStorage.removeItem(SAPAT_STORAGE_KEY_MENU);
    localStorage.removeItem(SAPAT_STORAGE_KEY_ORDERS);
    localStorage.removeItem(SAPAT_STORAGE_KEY_SETTINGS);
    this.saveMenu(INITIAL_MENU);
    this.saveOrders(INITIAL_ORDERS);
    this.saveSettings(INITIAL_SETTINGS);
    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'all' } }));
  }
}

window.SapatStorage = SapatStorage;

