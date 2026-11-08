/**
 * SAPAT Intelligence — Kitchen Preparation & Demand Forecasting Service
 * Architecture-ready service boundary for AI/ML integration.
 * Provides deterministic prototype forecasts, customer taste analysis,
 * feedback summarization, meal request analysis, and presentation simulation methods.
 */

import { SapatStorage } from '../storage.js';
import {
  MOCK_ACADEMIC_CALENDAR,
  MOCK_HISTORICAL_LOGS,
  MOCK_STUDENT_FEEDBACK,
  MOCK_REQUESTED_MEALS,
  MOCK_TOMORROW_FORECAST
} from '../data/intelligence.data.js';

const SIM_STORAGE_KEY = 'sapat_intelligence_sim_v2';

function getSimState() {
  try {
    const raw = localStorage.getItem(SIM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { extraReviews: {}, extraVotes: {}, simRushCount: 0 };
  } catch (e) {
    return { extraReviews: {}, extraVotes: {}, simRushCount: 0 };
  }
}

function saveSimState(state) {
  try {
    localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed saving sim state', e);
  }
}

export const ForecastingService = {
  /**
   * Generates a comprehensive kitchen preparation forecast for a specific vendor stall.
   * @param {string} vendorId
   * @returns {Object} Structured forecast result
   */
  getVendorForecast(vendorId) {
    const vendor = SapatStorage.getVendorById(vendorId);
    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();

    const vendorDishes = menu.filter(d => d.vendorId === vendorId);
    const vendorOrders = orders.filter(o => o.vendorId === vendorId && o.status !== 'Cancelled');

    // Calculate dish-level recommendations
    const dishForecasts = vendorDishes.map(dish => {
      const reserved = dish.reservedServings || 0;
      const limit = dish.dailyLimit || 40;
      const histAvg = dish.historicalAvg || Math.round(limit * 0.9);
      const remaining = Math.max(0, limit - reserved);
      const bookingRate = limit > 0 ? (reserved / limit) : 0;

      // Realistic deterministic forecast logic:
      // Combines historical baseline + current booking velocity
      let predictedDemand = Math.round(histAvg * 0.4 + reserved * 0.8 + limit * 0.2);
      predictedDemand = Math.max(reserved, Math.min(predictedDemand, limit + 15));

      let suggestedTarget = limit;
      let actionType = 'maintain';
      let delta = 0;
      let riskLevel = 'safe';
      let explanation = '';

      if (bookingRate >= 0.75 || reserved >= limit - 5) {
        // High demand scenario: suggest expanding batch to capture unmet demand
        delta = Math.ceil((predictedDemand - limit) / 5) * 5;
        if (delta <= 0) delta = 5;
        suggestedTarget = limit + delta;
        actionType = 'increase';
        riskLevel = 'stockout-risk';
        explanation = `High reservation velocity (${Math.round(bookingRate * 100)}% locked). Forecast predicts +${delta} portions needed to prevent lunch stockout.`;
      } else if (bookingRate < 0.35 && histAvg < limit - 5) {
        // Low demand scenario: suggest safe trim to avoid overproduction
        delta = Math.min(5, Math.floor((limit - Math.max(reserved + 5, histAvg)) / 5) * 5);
        if (delta > 0 && (limit - delta) >= reserved) {
          suggestedTarget = limit - delta;
          actionType = 'decrease';
          riskLevel = 'surplus-risk';
          explanation = `Pre-orders tracking below historical average. Trimming target by ${delta} portions protects against ingredient spoilage.`;
        } else {
          suggestedTarget = limit;
          actionType = 'maintain';
          riskLevel = 'safe';
          explanation = `Reservations aligned with typical midday kitchen pace. Current target of ${limit} portions is optimal.`;
        }
      } else {
        // Balanced scenario
        suggestedTarget = limit;
        actionType = 'maintain';
        riskLevel = 'safe';
        explanation = `Steady order velocity. Current daily target of ${limit} portions maintains safe buffer without overproduction.`;
      }

      return {
        dishId: dish.id,
        dishName: dish.name,
        category: dish.categoryName || 'Ulam',
        price: dish.price,
        image: dish.image,
        dailyLimit: limit,
        reservedServings: reserved,
        remainingServings: remaining,
        historicalAvg: histAvg,
        predictedDemand,
        suggestedTarget,
        actionType,
        delta,
        riskLevel,
        bookingRatePct: Math.round(bookingRate * 100),
        explanation
      };
    });

    // Calculate pickup slot distribution based on vendor orders
    const slotCounts = {
      'Morning Recess (9:45 AM)': 0,
      'Lunch Shift 1 (11:30 AM)': 0,
      'Lunch Shift 2 (12:15 PM)': 0,
      'Afternoon Dismissal (3:30 PM)': 0
    };

    vendorOrders.forEach(o => {
      const time = o.pickupTime || '';
      if (time.includes('9:45') || time.toLowerCase().includes('recess')) {
        slotCounts['Morning Recess (9:45 AM)'] += o.totalServings || 1;
      } else if (time.includes('11:30') || time.includes('Shift 1')) {
        slotCounts['Lunch Shift 1 (11:30 AM)'] += o.totalServings || 1;
      } else if (time.includes('12:15') || time.includes('Shift 2')) {
        slotCounts['Lunch Shift 2 (12:15 PM)'] += o.totalServings || 1;
      } else {
        slotCounts['Lunch Shift 1 (11:30 AM)'] += o.totalServings || 1;
      }
    });

    const totalOrderServings = Object.values(slotCounts).reduce((a, b) => a + b, 0);
    const pickupWindows = [
      {
        slot: 'Morning Recess',
        time: '9:45 AM - 10:15 AM',
        servings: totalOrderServings > 0 ? slotCounts['Morning Recess (9:45 AM)'] : 12,
        pct: totalOrderServings > 0 ? Math.round((slotCounts['Morning Recess (9:45 AM)'] / totalOrderServings) * 100) : 18
      },
      {
        slot: 'Lunch Shift 1',
        time: '11:30 AM - 12:10 PM',
        servings: totalOrderServings > 0 ? slotCounts['Lunch Shift 1 (11:30 AM)'] : 38,
        pct: totalOrderServings > 0 ? Math.round((slotCounts['Lunch Shift 1 (11:30 AM)'] / totalOrderServings) * 100) : 54
      },
      {
        slot: 'Lunch Shift 2',
        time: '12:15 PM - 12:55 PM',
        servings: totalOrderServings > 0 ? slotCounts['Lunch Shift 2 (12:15 PM)'] : 20,
        pct: totalOrderServings > 0 ? Math.round((slotCounts['Lunch Shift 2 (12:15 PM)'] / totalOrderServings) * 100) : 28
      }
    ];

    // Sustainability and accuracy metrics
    const totalLimit = vendorDishes.reduce((s, d) => s + d.dailyLimit, 0);
    const totalReserved = vendorDishes.reduce((s, d) => s + d.reservedServings, 0);
    const wastePreventedKg = (totalReserved * 0.28).toFixed(1); // Avg 280g food waste prevented per pre-ordered meal
    const accuracyScore = Math.min(98.5, Math.max(91.0, 93.5 + (totalReserved / (totalLimit || 1)) * 5)).toFixed(1);
    const overproductionSaved = Math.max(0, Math.round(totalLimit * 0.18));

    return {
      vendorId,
      vendorName: vendor ? vendor.name : 'Canteen Stall',
      generatedAt: 'Live Shift Forecast',
      isPrototypePreview: true,
      dishes: dishForecasts,
      pickupWindows,
      sustainability: {
        wastePreventedKg,
        prepAccuracyPct: accuracyScore,
        overproductionSavedMeals: overproductionSaved,
        co2SavedKg: (wastePreventedKg * 2.1).toFixed(1)
      }
    };
  },

  /**
   * Returns student taste analysis and feedback summary for a vendor.
   * @param {string} vendorId
   */
  getCustomerTasteAnalysis(vendorId) {
    const sim = getSimState();
    const baseFeedback = MOCK_STUDENT_FEEDBACK[vendorId] || MOCK_STUDENT_FEEDBACK['vendor-lita'];
    const extraReviews = sim.extraReviews[vendorId] || [];

    const allReviews = [...extraReviews, ...baseFeedback.recentReviews];
    const avgScore = baseFeedback.sentimentScore;

    return {
      vendorId,
      sentimentScore: avgScore,
      totalReviews: baseFeedback.totalReviews + extraReviews.length,
      flavorRatings: baseFeedback.flavorRatings,
      keyStrengths: baseFeedback.keyStrengths,
      improvementsNeeded: baseFeedback.improvementsNeeded,
      recentReviews: allReviews
    };
  },

  /**
   * Returns student-requested wishlist dishes for a vendor.
   * @param {string} vendorId
   */
  getRequestedMeals(vendorId) {
    const sim = getSimState();
    const baseMeals = MOCK_REQUESTED_MEALS[vendorId] || MOCK_REQUESTED_MEALS['vendor-lita'];
    const extraVotes = sim.extraVotes[vendorId] || {};

    return baseMeals.map(meal => ({
      ...meal,
      votes: meal.votes + (extraVotes[meal.dishName] || 0)
    })).sort((a, b) => b.votes - a.votes);
  },

  /**
   * Returns tomorrow's predictive demand forecast.
   * @param {string} vendorId
   */
  getTomorrowForecast(vendorId) {
    return MOCK_TOMORROW_FORECAST[vendorId] || MOCK_TOMORROW_FORECAST['vendor-lita'];
  },

  /**
   * Returns recent multi-week operational performance logs.
   * @param {string} vendorId
   */
  getHistoricalLogs(vendorId) {
    return MOCK_HISTORICAL_LOGS[vendorId] || MOCK_HISTORICAL_LOGS['vendor-lita'];
  },

  /**
   * LIVE DEMO SIMULATION:
   * Simulates rush reservations on a stall's primary meal to demonstrate real-time AI adaptation.
   */
  simulateRushOrders(vendorId, count = 5) {
    const menu = SapatStorage.getMenu();
    const vendorDishes = menu.filter(d => d.vendorId === vendorId);
    if (!vendorDishes.length) return false;

    // Pick the most popular dish (e.g. first dish)
    const targetDish = vendorDishes[0];
    targetDish.reservedServings = (targetDish.reservedServings || 0) + count;
    SapatStorage.saveMenu(menu);

    const sim = getSimState();
    sim.simRushCount = (sim.simRushCount || 0) + count;
    saveSimState(sim);

    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'simulation' } }));
    return { dishName: targetDish.name, newReserved: targetDish.reservedServings };
  },

  /**
   * LIVE DEMO SIMULATION:
   * Adds an illustrative student review to show live feedback updating.
   */
  simulateStudentFeedback(vendorId, studentName = 'Jasmine Perez', rating = 5, comment = 'Super fresh and flavorful. Claimed my order in 10 seconds via the QR scanner counter!') {
    const sim = getSimState();
    if (!sim.extraReviews[vendorId]) sim.extraReviews[vendorId] = [];

    const newReview = {
      id: `sim-rev-${Date.now()}`,
      studentName,
      initials: studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      dept: 'BS Computer Science • Live Demo',
      rating,
      dishName: 'Main Canteen Selection',
      comment,
      timestamp: 'Just now (Simulated)',
      tag: 'Verified Student Pre-order'
    };

    sim.extraReviews[vendorId].unshift(newReview);
    saveSimState(sim);

    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'feedback-sim' } }));
    return newReview;
  },

  /**
   * LIVE DEMO SIMULATION:
   * Adds a student vote to a requested menu item.
   */
  simulateDishRequest(vendorId, dishName) {
    const sim = getSimState();
    if (!sim.extraVotes[vendorId]) sim.extraVotes[vendorId] = {};
    sim.extraVotes[vendorId][dishName] = (sim.extraVotes[vendorId][dishName] || 0) + 1;
    saveSimState(sim);

    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'wishlist-sim' } }));
    return { dishName, addedVotes: sim.extraVotes[vendorId][dishName] };
  },

  /**
   * LIVE DEMO SIMULATION:
   * Resets simulation overrides and restores standard baseline.
   */
  resetSimulation(vendorId) {
    localStorage.removeItem(SIM_STORAGE_KEY);
    // Reset any dish over-reservations back to sensible defaults if simulated
    const menu = SapatStorage.getMenu();
    menu.forEach(d => {
      if (d.reservedServings > d.dailyLimit) {
        d.reservedServings = Math.round(d.dailyLimit * 0.7);
      }
    });
    SapatStorage.saveMenu(menu);

    window.dispatchEvent(new CustomEvent('sapat:data-updated', { detail: { type: 'sim-reset' } }));
    return true;
  }
};
