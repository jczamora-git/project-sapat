/**
 * SAPAT Intelligence — Centralized Mock Intelligence & Historical Data
 * Reusable dataset for kitchen operations, demand forecasting, customer taste analysis,
 * and student feedback simulation.
 */

export const MOCK_ACADEMIC_CALENDAR = [
  { date: '2026-11-03', day: 'Tuesday', event: 'Midterm Examination Week', impact: 'High early morning & 11:30 AM lunch rush (+25% volume)' },
  { date: '2026-11-04', day: 'Wednesday', event: 'Midterm Examination Week', impact: 'Shortened lunch breaks; high express window demand' },
  { date: '2026-11-05', day: 'Thursday', event: 'College of Engineering Tech Summit', impact: 'Heavy afternoon merienda traffic' },
  { date: '2026-11-06', day: 'Friday', event: 'University Organization Day', impact: 'Extended 12:00 PM - 2:00 PM lunch dwell time' },
  { date: '2026-11-09', day: 'Monday', event: 'Regular Academic Schedule', impact: 'Steady baseline across all 3 pickup shifts' },
  { date: '2026-11-10', day: 'Tuesday', event: 'College Lab Days (Tomorrow)', impact: 'Predicted rain showers (+15% hot soup demand)' }
];

export const MOCK_HISTORICAL_LOGS = {
  'vendor-lita': [
    { date: '2026-11-02', day: 'Monday', predictedDemand: 96, prepared: 95, preordered: 78, claimed: 93, walkIn: 15, cancelledNoShow: 1, unsold: 1, accuracy: 97.9, wasteSavedKg: 26.0 },
    { date: '2026-11-03', day: 'Tuesday', predictedDemand: 112, prepared: 110, preordered: 92, claimed: 108, walkIn: 17, cancelledNoShow: 1, unsold: 1, accuracy: 98.2, wasteSavedKg: 30.2 },
    { date: '2026-11-04', day: 'Wednesday', predictedDemand: 106, prepared: 105, preordered: 88, claimed: 102, walkIn: 15, cancelledNoShow: 1, unsold: 2, accuracy: 97.1, wasteSavedKg: 28.6 },
    { date: '2026-11-05', day: 'Thursday', predictedDemand: 100, prepared: 100, preordered: 82, claimed: 97, walkIn: 15, cancelledNoShow: 1, unsold: 2, accuracy: 97.0, wasteSavedKg: 27.2 },
    { date: '2026-11-06', day: 'Friday', predictedDemand: 116, prepared: 115, preordered: 96, claimed: 112, walkIn: 17, cancelledNoShow: 1, unsold: 2, accuracy: 97.4, wasteSavedKg: 31.4 }
  ],
  'vendor-ben': [
    { date: '2026-11-02', day: 'Monday', predictedDemand: 86, prepared: 85, preordered: 70, claimed: 82, walkIn: 12, cancelledNoShow: 1, unsold: 2, accuracy: 96.5, wasteSavedKg: 23.0 },
    { date: '2026-11-03', day: 'Tuesday', predictedDemand: 96, prepared: 95, preordered: 80, claimed: 92, walkIn: 13, cancelledNoShow: 1, unsold: 2, accuracy: 96.8, wasteSavedKg: 25.8 },
    { date: '2026-11-04', day: 'Wednesday', predictedDemand: 91, prepared: 90, preordered: 75, claimed: 87, walkIn: 12, cancelledNoShow: 1, unsold: 2, accuracy: 96.7, wasteSavedKg: 24.4 },
    { date: '2026-11-05', day: 'Thursday', predictedDemand: 90, prepared: 90, preordered: 74, claimed: 87, walkIn: 14, cancelledNoShow: 1, unsold: 2, accuracy: 96.7, wasteSavedKg: 24.4 },
    { date: '2026-11-06', day: 'Friday', predictedDemand: 102, prepared: 100, preordered: 85, claimed: 97, walkIn: 13, cancelledNoShow: 1, unsold: 2, accuracy: 97.0, wasteSavedKg: 27.2 }
  ],
  'vendor-cora': [
    { date: '2026-11-02', day: 'Monday', predictedDemand: 76, prepared: 75, preordered: 62, claimed: 72, walkIn: 11, cancelledNoShow: 1, unsold: 2, accuracy: 96.0, wasteSavedKg: 20.2 },
    { date: '2026-11-03', day: 'Tuesday', predictedDemand: 86, prepared: 85, preordered: 71, claimed: 81, walkIn: 11, cancelledNoShow: 1, unsold: 3, accuracy: 95.3, wasteSavedKg: 22.7 },
    { date: '2026-11-04', day: 'Wednesday', predictedDemand: 81, prepared: 80, preordered: 66, claimed: 77, walkIn: 12, cancelledNoShow: 1, unsold: 2, accuracy: 96.3, wasteSavedKg: 21.6 },
    { date: '2026-11-05', day: 'Thursday', predictedDemand: 80, prepared: 80, preordered: 65, claimed: 77, walkIn: 13, cancelledNoShow: 1, unsold: 2, accuracy: 96.3, wasteSavedKg: 21.6 },
    { date: '2026-11-06', day: 'Friday', predictedDemand: 87, prepared: 85, preordered: 72, claimed: 82, walkIn: 11, cancelledNoShow: 1, unsold: 2, accuracy: 96.5, wasteSavedKg: 23.0 }
  ],
  'vendor-green': [
    { date: '2026-11-02', day: 'Monday', predictedDemand: 71, prepared: 70, preordered: 58, claimed: 67, walkIn: 10, cancelledNoShow: 1, unsold: 2, accuracy: 95.7, wasteSavedKg: 18.8 },
    { date: '2026-11-03', day: 'Tuesday', predictedDemand: 82, prepared: 80, preordered: 68, claimed: 77, walkIn: 10, cancelledNoShow: 1, unsold: 2, accuracy: 96.3, wasteSavedKg: 21.6 },
    { date: '2026-11-04', day: 'Wednesday', predictedDemand: 76, prepared: 75, preordered: 63, claimed: 72, walkIn: 10, cancelledNoShow: 1, unsold: 2, accuracy: 96.0, wasteSavedKg: 20.2 },
    { date: '2026-11-05', day: 'Thursday', predictedDemand: 76, prepared: 75, preordered: 61, claimed: 72, walkIn: 12, cancelledNoShow: 1, unsold: 2, accuracy: 96.0, wasteSavedKg: 20.2 },
    { date: '2026-11-06', day: 'Friday', predictedDemand: 81, prepared: 80, preordered: 69, claimed: 77, walkIn: 9, cancelledNoShow: 1, unsold: 2, accuracy: 96.3, wasteSavedKg: 21.6 }
  ],
  'vendor-tess': [
    { date: '2026-11-02', day: 'Monday', predictedDemand: 122, prepared: 120, preordered: 98, claimed: 117, walkIn: 20, cancelledNoShow: 1, unsold: 2, accuracy: 97.5, wasteSavedKg: 32.8 },
    { date: '2026-11-03', day: 'Tuesday', predictedDemand: 137, prepared: 135, preordered: 112, claimed: 132, walkIn: 21, cancelledNoShow: 1, unsold: 2, accuracy: 97.8, wasteSavedKg: 37.0 },
    { date: '2026-11-04', day: 'Wednesday', predictedDemand: 132, prepared: 130, preordered: 106, claimed: 126, walkIn: 21, cancelledNoShow: 1, unsold: 3, accuracy: 96.9, wasteSavedKg: 35.3 },
    { date: '2026-11-05', day: 'Thursday', predictedDemand: 142, prepared: 140, preordered: 115, claimed: 136, walkIn: 22, cancelledNoShow: 1, unsold: 3, accuracy: 97.1, wasteSavedKg: 38.1 },
    { date: '2026-11-06', day: 'Friday', predictedDemand: 147, prepared: 145, preordered: 122, claimed: 142, walkIn: 21, cancelledNoShow: 1, unsold: 2, accuracy: 97.9, wasteSavedKg: 39.8 }
  ]
};

export const MOCK_STUDENT_FEEDBACK = {
  'vendor-lita': {
    sentimentScore: 92,
    totalReviews: 128,
    flavorRatings: {
      tenderness: 94,
      seasoning: 89,
      temperature: 96,
      portionSize: 91
    },
    keyStrengths: [
      'Sinigang broth acidity has 98% student approval',
      'Chicken Adobo meat tenderness rated exceptional by engineering students',
      'Pickup temperature is hot and ready on scheduled slot'
    ],
    improvementsNeeded: [
      '18% request extra calamansi or spiced soy dipping cups with Adobo',
      '12% requested more leafy kangkong greens in Sinigang soup'
    ],
    recentReviews: [
      {
        id: 'rev-lita-1',
        studentName: 'Bianca Santos',
        initials: 'BS',
        dept: 'BS Computer Science • 3rd Year',
        rating: 5,
        dishName: 'Chicken Adobo',
        comment: 'Tender chicken and very savory sauce. Pickup pass was scanned in 3 seconds at Counter 2!',
        timestamp: '2 hours ago',
        tag: 'Quick Pickup'
      },
      {
        id: 'rev-lita-2',
        studentName: 'Joshua Reyes',
        initials: 'JR',
        dept: 'BS Civil Engineering • 2nd Year',
        rating: 4.5,
        dishName: 'Pork Sinigang sa Sampalok',
        comment: 'Super sour and comforting. Would appreciate a bit more kangkong next time.',
        timestamp: 'Yesterday',
        tag: 'Broth Quality'
      },
      {
        id: 'rev-lita-3',
        studentName: 'Camille Tan',
        initials: 'CT',
        dept: 'BA Communication • 4th Year',
        rating: 5,
        dishName: 'Crispy Lumpiang Shanghai',
        comment: 'Stayed crunchy even after picking up 10 minutes into the slot. Best lunch lumpia in campus!',
        timestamp: '2 days ago',
        tag: 'Crunch'
      }
    ]
  },
  'vendor-ben': {
    sentimentScore: 90,
    totalReviews: 114,
    flavorRatings: {
      crispiness: 95,
      garlicAroma: 93,
      eggCook: 88,
      portionSize: 92
    },
    keyStrengths: [
      'Sinangag garlic aroma rated best in main canteen',
      'Beef Tapa marinade flavor balance rated 94% positive',
      'Hotdog meal popular among first-year students'
    ],
    improvementsNeeded: [
      '15% ask for option of sunny-side up runny yolk vs fully cooked egg',
      '10% request extra vinegar garlic dip packets'
    ],
    recentReviews: [
      {
        id: 'rev-ben-1',
        studentName: 'Kevin Diaz',
        initials: 'KD',
        dept: 'BS Information Technology • 2nd Year',
        rating: 5,
        dishName: 'Special Beef Tapsilog',
        comment: 'Beef is tender and savory, not chewy at all. Generous garlic rice!',
        timestamp: '3 hours ago',
        tag: 'Hearty'
      },
      {
        id: 'rev-ben-2',
        studentName: 'Rachel Go',
        initials: 'RG',
        dept: 'BS Accountancy • 1st Year',
        rating: 4.5,
        dishName: 'Pork Tocilog Special',
        comment: 'Sweet and caramelized tocino. Very fast express counter handover.',
        timestamp: 'Yesterday',
        tag: 'Fast Service'
      }
    ]
  },
  'vendor-cora': {
    sentimentScore: 89,
    totalReviews: 96,
    flavorRatings: {
      freshness: 94,
      vegetableCook: 92,
      sauceRichness: 87,
      portionSize: 90
    },
    keyStrengths: [
      'Gulay dishes taste truly home-cooked without artificial MSG',
      'Pinakbet vegetable texture is crisp, never soggy'
    ],
    improvementsNeeded: [
      '14% request spicier option for Bicol Express style dishes',
      '8% ask for larger vegetable-to-rice serving ratios'
    ],
    recentReviews: [
      {
        id: 'rev-cora-1',
        studentName: 'Marco Lim',
        initials: 'ML',
        dept: 'BS Biology • 3rd Year',
        rating: 5,
        dishName: 'Pinakbet Tagalog with Bagnet',
        comment: 'Crunchy ampalaya and sitaw with flavorful bagoong. Healthiest lunch in campus.',
        timestamp: '5 hours ago',
        tag: 'Nutritious'
      }
    ]
  },
  'vendor-green': {
    sentimentScore: 91,
    totalReviews: 88,
    flavorRatings: {
      freshness: 96,
      dressingFlavor: 92,
      portionSize: 88,
      temperature: 94
    },
    keyStrengths: [
      'Crisp organic salad greens sourced fresh daily',
      'Grilled chicken breast tender and well-seasoned'
    ],
    improvementsNeeded: [
      '16% request extra dressing cups on the side',
      '9% request high-protein quinoa upgrade option'
    ],
    recentReviews: [
      {
        id: 'rev-green-1',
        studentName: 'Angela Cruz',
        initials: 'AC',
        dept: 'BS Psychology • 4th Year',
        rating: 5,
        dishName: 'Grilled Chicken Garden Salad Bowl',
        comment: 'Clean and refreshing lunch. Helps me stay awake during 1:00 PM lectures.',
        timestamp: '4 hours ago',
        tag: 'Healthy'
      }
    ]
  },
  'vendor-tess': {
    sentimentScore: 94,
    totalReviews: 142,
    flavorRatings: {
      sweetnessBalance: 93,
      meriendaCrisp: 96,
      portionSize: 94,
      temperature: 95
    },
    keyStrengths: [
      'Turon caramel coating is perfectly brittle and not burned',
      'Banana Cue sugar crunch rated top merienda choice on campus'
    ],
    improvementsNeeded: [
      '12% request cold sago gulaman drink pairing bundle',
      '6% request langka (jackfruit) slivers in regular turon'
    ],
    recentReviews: [
      {
        id: 'rev-tess-1',
        studentName: 'Jerome David',
        initials: 'JD',
        dept: 'BS Electrical Engineering • 2nd Year',
        rating: 5,
        dishName: 'Special Turon with Langka',
        comment: 'Crispy, sweet, and comforting afternoon merienda. Never soggy!',
        timestamp: '1 hour ago',
        tag: 'Merienda Favorite'
      }
    ]
  }
};

export const MOCK_REQUESTED_MEALS = {
  'vendor-lita': [
    {
      dishName: 'Kare-Kare with Homemade Bagoong',
      category: 'Special Stew',
      votes: 86,
      topDept: 'College of Engineering',
      suggestedPrice: 75,
      projectedDailyDemand: 34,
      confidence: '91% High Demand',
      notes: 'Ranked #1 requested comfort food for Wednesday lab schedules'
    },
    {
      dishName: 'Bicol Express Spicy Pork Bowl',
      category: 'Spicy Rice Meal',
      votes: 64,
      topDept: 'BS Computer Science',
      suggestedPrice: 70,
      projectedDailyDemand: 28,
      confidence: '86% Moderate Demand',
      notes: 'High demand for savory coconut chili profile'
    },
    {
      dishName: 'Sinigang na Bangus Belly sa Bayabas',
      category: 'Fish Soup',
      votes: 48,
      topDept: 'College of Education',
      suggestedPrice: 80,
      projectedDailyDemand: 22,
      confidence: '79% Niche Demand',
      notes: 'Guava broth requested as alternative to tamarind'
    }
  ],
  'vendor-ben': [
    {
      dishName: 'Spicy Pork Sisilog with Calamansi',
      category: 'Silog Special',
      votes: 94,
      topDept: 'College of Engineering & CS',
      suggestedPrice: 75,
      projectedDailyDemand: 42,
      confidence: '95% Strong Demand',
      notes: 'Sizzling sisig with egg and garlic rice is the top requested silog combo'
    },
    {
      dishName: 'Corned Beef Silog with Caramelized Onions',
      category: 'Breakfast Silog',
      votes: 52,
      topDept: 'BA Communication',
      suggestedPrice: 65,
      projectedDailyDemand: 24,
      confidence: '82% Moderate Demand',
      notes: 'Requested for morning 7:30 AM class pre-orders'
    }
  ],
  'vendor-cora': [
    {
      dishName: 'Ginisang Monggo with Tinapa & Malunggay',
      category: 'Nutritious Stew',
      votes: 72,
      topDept: 'College of Science',
      suggestedPrice: 55,
      projectedDailyDemand: 30,
      confidence: '89% High Demand',
      notes: 'Traditional Friday monggo meal with high protein and low cost'
    }
  ],
  'vendor-green': [
    {
      dishName: 'Tofu Quinoa Teriyaki Bowl',
      category: 'Plant Protein',
      votes: 61,
      topDept: 'College of Arts & Sciences',
      suggestedPrice: 75,
      projectedDailyDemand: 26,
      confidence: '84% Moderate Demand',
      notes: 'Requested as vegetarian alternative to chicken breast'
    }
  ],
  'vendor-tess': [
    {
      dishName: 'Warm Ginataang Bilo-Bilo with Langka',
      category: 'Warm Merienda',
      votes: 89,
      topDept: 'All Colleges',
      suggestedPrice: 40,
      projectedDailyDemand: 46,
      confidence: '93% High Demand',
      notes: 'Anticipated rain showers will drive high demand for warm coconut dessert'
    }
  ]
};

export const MOCK_TOMORROW_FORECAST = {
  'vendor-lita': {
    forecastDate: 'Tomorrow • Tuesday, Nov 10',
    weatherCondition: 'Scattered afternoon rain showers • 27°C',
    weatherImpact: '+18% demand boost on hot soup meals (Sinigang)',
    campusSchedule: 'College of Engineering Midterm Reviews',
    scheduleImpact: '+12% pre-orders for Lunch Shift 1 (11:30 AM)',
    dishes: [
      {
        name: 'Pork Sinigang sa Sampalok',
        projectedDemand: 52,
        recommendedTarget: 50,
        currentLimit: 40,
        recommendation: 'Increase batch +10 portions',
        rationale: 'Rainy Tuesday forecast + exam rush historically drives a 25% surge for piping hot tamarind broth.'
      },
      {
        name: 'Chicken Adobo',
        projectedDemand: 44,
        recommendedTarget: 45,
        currentLimit: 40,
        recommendation: 'Maintain optimal target (45 portions)',
        rationale: 'Stable baseline favorite across mid-week lab schedules.'
      },
      {
        name: 'Crispy Lumpiang Shanghai (6 pcs)',
        projectedDemand: 36,
        recommendedTarget: 35,
        currentLimit: 30,
        recommendation: 'Increase batch +5 portions',
        rationale: 'Popular combo add-on for group pre-orders.'
      }
    ]
  },
  'vendor-ben': {
    forecastDate: 'Tomorrow • Tuesday, Nov 10',
    weatherCondition: 'Cloudy with cool morning breeze • 25°C',
    weatherImpact: '+14% early morning breakfast pre-orders',
    campusSchedule: 'Morning 8:00 AM Departmental Exams',
    scheduleImpact: '+20% rush before 9:00 AM class bells',
    dishes: [
      {
        name: 'Special Beef Tapsilog',
        projectedDemand: 48,
        recommendedTarget: 45,
        currentLimit: 40,
        recommendation: 'Increase target +5 portions',
        rationale: 'High breakfast velocity expected from exam students arriving early.'
      },
      {
        name: 'Pork Tocilog Special',
        projectedDemand: 36,
        recommendedTarget: 35,
        currentLimit: 35,
        recommendation: 'Maintain current target (35 portions)',
        rationale: 'Order velocity aligns smoothly with typical Tuesday morning pacing.'
      }
    ]
  }
};
