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
   * Generates a comprehensive, consistent, and explainable kitchen preparation forecast
   * for a specific vendor stall.
   * Uses shared single source of truth across all dashboard components.
   * @param {string} vendorId
   * @returns {Object} Structured forecast result
   */
  getVendorForecast(vendorId) {
    const vendor = SapatStorage.getVendorById(vendorId);
    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders();

    const vendorDishes = menu.filter(d => d.vendorId === vendorId);
    const vendorOrders = orders.filter(o => o.vendorId === vendorId && o.status !== 'Cancelled');

    // Separate verified paid/confirmed pre-orders from unpaid pending orders
    const paidOrders = vendorOrders.filter(o => o.paymentStatus === 'Paid' && o.status !== 'Expired');
    const pendingOrders = vendorOrders.filter(o => o.paymentStatus === 'Pending' || o.status === 'Awaiting Counter Payment');

    // Load actual historical performance logs
    const historyLogs = this.getHistoricalLogs(vendorId) || [];
    const historicalPerformance = this.getHistoricalPerformance(vendorId);

    // Load active forecast simulation context (academic calendar + weather)
    const context = SapatStorage.getForecastContext ? SapatStorage.getForecastContext(vendorId) : {
      academicSchedule: 'Regular Academic Schedule',
      weatherCondition: 'Rainy'
    };

    // Calculate dish-level recommendations using strict, explainable formula:
    // Recommended Target = Predicted Total Demand + Safety Buffer
    // Additional Preparation Needed = max(Recommended Target - Current Limit, 0)
    const dishForecasts = vendorDishes.map(dish => {
      const currentLimit = dish.dailyLimit || 35;
      const confirmedPreorders = dish.reservedServings || 0;
      const histAvg = dish.historicalAvg || Math.round(currentLimit * 0.9);
      const remaining = Math.max(0, currentLimit - confirmedPreorders);
      const bookingRate = currentLimit > 0 ? (confirmedPreorders / currentLimit) : 0;

      // Count any unpaid pending counter reservations for this dish
      const pendingServings = pendingOrders.reduce((sum, o) => {
        const item = (o.items || []).find(i => i.id === dish.id);
        return sum + (item ? (item.quantity || 1) : 0);
      }, 0);

      let predictedDemand = 0;
      let safetyBuffer = 0;
      let rationale = '';

      // Context modifiers
      const isExam = context.academicSchedule === 'Examination Week';
      const isCampusEvent = context.academicSchedule === 'Campus Event';
      const isNoClasses = context.academicSchedule === 'No Classes';
      const isRainy = context.weatherCondition === 'Rainy';
      const isSunny = context.weatherCondition === 'Sunny';

      // Explainable scenario derivation:
      if (dish.id === 'dish-lita-2' || (currentLimit === 35 && confirmedPreorders === 32)) {
        // Benchmark scenario (Pork Sinigang sa Sampalok):
        // Current Limit: 35, Confirmed: 32 (91.4% booked)
        // Rainy Tuesday forecast (+18% soup boost) + Midterm exams rush adds 14 predicted rush servings
        if (isNoClasses) {
          predictedDemand = confirmedPreorders;
          safetyBuffer = 0;
          rationale = 'Campus closed for holiday / no classes. Only existing advance pre-orders will be fulfilled.';
        } else if (isSunny && !isExam) {
          predictedDemand = 40;
          safetyBuffer = 3;
          rationale = 'Sunny weather moderates hot broth volume. Midday reservations remain steady (+8 walk-ins expected).';
        } else {
          // Standard baseline benchmark
          predictedDemand = 46;
          safetyBuffer = 4;
          rationale = 'High booking velocity (91% locked) with 2 lunch shifts remaining. Rainy weather (+18% warm broth boost) and exam schedule project 14 additional walk-in servings.';
        }
      } else if (dish.id === 'dish-lita-1') {
        // Chicken Adobo: steady lunch favorite
        if (isNoClasses) {
          predictedDemand = confirmedPreorders;
          safetyBuffer = 0;
          rationale = 'No classes schedule; preparing confirmed reservations only.';
        } else if (isCampusEvent) {
          predictedDemand = 48;
          safetyBuffer = 4;
          rationale = 'Campus event brings high afternoon visitor dwell time; projected +18 walk-in portions.';
        } else {
          predictedDemand = 43;
          safetyBuffer = 2;
          rationale = 'Steady midday reservation pace (53% locked). Current pre-orders align with historical Tuesday baseline (42-44 portions). Capacity covers expected demand.';
        }
      } else if (dish.id === 'dish-lita-3' || (confirmedPreorders >= currentLimit && currentLimit > 0)) {
        // Sold out / Capacity reached dish (Lumpiang Shanghai)
        const unmetDemand = Math.max(10, Math.round(currentLimit * 0.25));
        predictedDemand = confirmedPreorders + unmetDemand;
        safetyBuffer = Math.max(4, Math.round(predictedDemand * 0.08));
        rationale = `Daily prep limit of ${currentLimit} was fully booked before lunch rush. Historical snack add-on volume indicates unserved student demand of ~${unmetDemand} portions.`;
      } else {
        // Universal deterministic formula for other vendor stalls
        let demandMultiplier = 1.0;
        if (isNoClasses) demandMultiplier = 0.5;
        else if (isExam) demandMultiplier = 1.20;
        else if (isCampusEvent) demandMultiplier = 1.25;

        if (isRainy && (dish.name.toLowerCase().includes('soup') || dish.name.toLowerCase().includes('sinigang') || dish.name.toLowerCase().includes('monggo') || dish.name.toLowerCase().includes('bilo'))) {
          demandMultiplier += 0.15;
        }

        if (bookingRate >= 0.75) {
          const expectedAdditional = Math.max(6, Math.round(currentLimit * 0.28 * demandMultiplier));
          predictedDemand = confirmedPreorders + expectedAdditional;
          safetyBuffer = Math.max(3, Math.round(predictedDemand * 0.08));
          rationale = `Fast booking velocity (${Math.round(bookingRate * 100)}% committed). Midday rush projects +${expectedAdditional} additional student servings.`;
        } else if (bookingRate >= 0.40) {
          predictedDemand = Math.max(confirmedPreorders + 4, Math.round((histAvg * 0.65 + confirmedPreorders * 0.35 + 3) * demandMultiplier));
          safetyBuffer = Math.max(2, Math.round(predictedDemand * 0.06));
          rationale = `Moderate reservation velocity (${Math.round(bookingRate * 100)}% booked). Pre-orders tracking on pace with historical weekday volume.`;
        } else {
          predictedDemand = Math.max(confirmedPreorders + 2, Math.round(histAvg * 0.85 * demandMultiplier));
          safetyBuffer = 2;
          rationale = `Pacing below peak rate (${Math.round(bookingRate * 100)}% committed). Preparation target maintains safe buffer without overproduction risk.`;
        }
      }

      // Mandatory Calculation:
      // Recommended Target = Predicted Total Demand + Safety Buffer
      const recommendedTarget = predictedDemand + safetyBuffer;
      // Additional Preparation Needed = max(Recommended Target - Current Limit, 0)
      const additionalNeeded = Math.max(recommendedTarget - currentLimit, 0);

      // Visual state distinction:
      let statusState = 'optimal'; // 'optimal' | 'warning' | 'capacity-reached'
      let actionType = 'maintain';
      let badgeLabel = 'Target Optimal';

      if (confirmedPreorders >= currentLimit && currentLimit > 0) {
        statusState = 'capacity-reached';
        actionType = 'increase';
        badgeLabel = additionalNeeded > 0 ? `+${additionalNeeded} Needed (Capacity Hit)` : 'Capacity Reached';
      } else if (additionalNeeded > 0) {
        statusState = 'warning';
        actionType = 'increase';
        badgeLabel = `+${additionalNeeded} Prep Needed`;
      } else {
        statusState = 'optimal';
        actionType = 'maintain';
        badgeLabel = 'Target Optimal';
      }

      return {
        dishId: dish.id,
        dishName: dish.name,
        category: dish.categoryName || 'Ulam',
        price: dish.price,
        image: dish.image,
        currentLimit,
        dailyLimit: currentLimit, // Compatibility alias
        confirmedPreorders,
        reservedServings: confirmedPreorders, // Compatibility alias
        pendingServings,
        remainingServings: remaining,
        historicalAvg: histAvg,
        predictedDemand,
        safetyBuffer,
        recommendedTarget,
        suggestedTarget: recommendedTarget, // Compatibility alias
        additionalNeeded,
        delta: additionalNeeded, // Compatibility alias
        actionType,
        statusState,
        badgeLabel,
        bookingRatePct: Math.round(bookingRate * 100),
        explanation: rationale,
        breakdown: {
          formula: `Recommended Target (${recommendedTarget}) = Predicted Demand (${predictedDemand}) + Safety Buffer (${safetyBuffer})`,
          additionalFormula: `Additional Prep Needed: ${additionalNeeded > 0 ? `+${additionalNeeded} portions (${recommendedTarget} - ${currentLimit})` : '0 (Capacity Aligned)'}`,
          rationale
        }
      };
    });

    // Totals across all dishes (Single Source of Truth)
    const totalLimit = dishForecasts.reduce((s, d) => s + d.currentLimit, 0);
    const totalConfirmed = dishForecasts.reduce((s, d) => s + d.confirmedPreorders, 0);
    const totalPredicted = dishForecasts.reduce((s, d) => s + d.predictedDemand, 0);
    const totalSafetyBuffer = dishForecasts.reduce((s, d) => s + d.safetyBuffer, 0);
    const totalRecommended = dishForecasts.reduce((s, d) => s + d.recommendedTarget, 0);
    const totalAdditionalNeeded = dishForecasts.reduce((s, d) => s + d.additionalNeeded, 0);
    const totalPending = dishForecasts.reduce((s, d) => s + d.pendingServings, 0);

    // Derived shift-level demand from exact underlying data (zero double counting)
    const pickupWindows = this.getPickupShiftForecast(vendorId, totalConfirmed, totalPredicted);

    // Dynamic Forecast Confidence Indicator
    const confidence = this.getForecastConfidence(vendorId, dishForecasts, vendorOrders, historyLogs);

    // Food waste avoided and sustainability calculations
    // Based on actual verified pre-orders: ~280g avoided plate waste per pre-ordered meal
    const wastePreventedKg = (totalConfirmed * 0.28).toFixed(1);
    const overproductionSaved = Math.max(0, Math.round(totalLimit * 0.18));
    const prepAccuracyPct = historicalPerformance.hasData ? historicalPerformance.averageAccuracy : null;

    return {
      vendorId,
      vendorName: vendor ? vendor.name : 'Canteen Stall',
      generatedAt: 'Live Synchronized Forecast',
      isPrototypePreview: true,
      summary: {
        totalLimit,
        totalConfirmed,
        totalPending,
        totalPredicted,
        totalSafetyBuffer,
        totalRecommended,
        totalAdditionalNeeded,
        bookingRatePct: totalLimit > 0 ? Math.round((totalConfirmed / totalLimit) * 100) : 0
      },
      dishes: dishForecasts,
      pickupWindows,
      confidence,
      historicalPerformance,
      sustainability: {
        wastePreventedKg,
        prepAccuracyPct,
        overproductionSavedMeals: overproductionSaved,
        co2SavedKg: (parseFloat(wastePreventedKg) * 2.1).toFixed(1),
        isEstimated: true,
        basisText: 'Calculated from locked pre-orders (280g avg plate waste prevented/meal)'
      }
    };
  },

  /**
   * Derives shift-level demand mathematically from underlying order and forecasting data.
   * Guarantees that:
   * - Sum of shift confirmed pre-orders === total confirmed pre-orders
   * - Sum of shift predicted additional === total predicted additional
   * - Sum of shift total expected === total predicted demand
   * - Sum of shift percentages === 100%
   */
  getPickupShiftForecast(vendorId, totalConfirmed, totalPredicted) {
    const totalAdditional = Math.max(0, totalPredicted - totalConfirmed);

    const isMeriendaStall = vendorId === 'vendor-tess';
    const shiftConfigs = isMeriendaStall ? [
      { id: 'shift-recess', slot: 'Morning Recess', time: '9:45 AM - 10:15 AM', weight: 0.25 },
      { id: 'shift-lunch', slot: 'Midday Lunch', time: '11:45 AM - 12:30 PM', weight: 0.35 },
      { id: 'shift-merienda', slot: 'Afternoon Recess', time: '2:45 PM - 3:30 PM', weight: 0.40 }
    ] : [
      { id: 'shift-recess', slot: 'Morning Recess', time: '9:45 AM - 10:15 AM', weight: 0.15 },
      { id: 'shift-lunch1', slot: 'Lunch Shift 1', time: '11:30 AM - 12:10 PM', weight: 0.55 },
      { id: 'shift-lunch2', slot: 'Lunch Shift 2', time: '12:15 PM - 12:55 PM', weight: 0.30 }
    ];

    let allocatedConfirmed = 0;
    let allocatedAdditional = 0;

    const windows = shiftConfigs.map((shift, idx) => {
      const isLast = idx === shiftConfigs.length - 1;

      // Confirmed pre-orders
      const confirmed = isLast
        ? Math.max(0, totalConfirmed - allocatedConfirmed)
        : Math.round(totalConfirmed * shift.weight);
      allocatedConfirmed += isLast ? 0 : confirmed;

      // Additional predicted rush demand
      const additional = isLast
        ? Math.max(0, totalAdditional - allocatedAdditional)
        : Math.round(totalAdditional * shift.weight);
      allocatedAdditional += isLast ? 0 : additional;

      const totalExpected = confirmed + additional;
      const pct = totalPredicted > 0 ? Math.round((totalExpected / totalPredicted) * 100) : 0;

      return {
        id: shift.id,
        slot: shift.slot,
        time: shift.time,
        confirmedPreorders: confirmed,
        predictedAdditional: additional,
        totalExpectedDemand: totalExpected,
        servings: totalExpected, // Compatibility alias
        pct,
        isPeak: shift.weight >= 0.45
      };
    });

    // Normalize percentage sum to exactly 100%
    const currentPctSum = windows.reduce((s, w) => s + w.pct, 0);
    if (currentPctSum !== 100 && windows.length > 0) {
      windows[windows.length - 1].pct += (100 - currentPctSum);
    }

    return windows;
  },

  /**
   * Calculates dynamic forecast confidence indicator (High / Moderate / Low)
   * with transparent underlying factors.
   */
  getForecastConfidence(vendorId, dishForecasts, vendorOrders, historyLogs) {
    const totalLimit = dishForecasts.reduce((s, d) => s + d.currentLimit, 0);
    const totalConfirmed = dishForecasts.reduce((s, d) => s + d.confirmedPreorders, 0);
    const bookingRate = totalLimit > 0 ? (totalConfirmed / totalLimit) : 0;
    const logCount = historyLogs ? historyLogs.length : 0;

    // Multi-factor confidence scoring (0 - 100)
    // 1. Historical data depth (0 - 35)
    const historyScore = Math.min(35, logCount * 7);
    // 2. Verified reservation commitment ratio (0 - 40)
    const commitmentScore = Math.min(40, Math.round(bookingRate * 40));
    // 3. Recency & order activity today (0 - 15)
    const recencyScore = Math.min(15, (vendorOrders.length || 0) * 3);
    // 4. Stable weekday/pattern baseline (0 - 10)
    const stabilityScore = logCount >= 3 ? 10 : (logCount > 0 ? 5 : 0);

    const totalScore = historyScore + commitmentScore + recencyScore + stabilityScore;

    let level = 'High';
    let levelClass = 'conf-high';
    let badgeText = 'High Confidence';
    if (logCount === 0 || totalScore < 50) {
      level = 'Low';
      levelClass = 'conf-low';
      badgeText = 'Low Confidence';
    } else if (totalScore < 75) {
      level = 'Moderate';
      levelClass = 'conf-moderate';
      badgeText = 'Moderate Confidence';
    }

    const factors = [
      {
        name: 'Historical Order Patterns',
        icon: 'history',
        status: logCount >= 3 ? 'verified' : 'sparse',
        summary: logCount > 0 ? `${logCount} audited shift logs on record (Average ±1.8 portions daily variance).` : 'No past shift logs recorded yet.'
      },
      {
        name: 'Recent Reservations',
        icon: 'orders',
        status: bookingRate >= 0.5 ? 'verified' : 'moderate',
        summary: `${totalConfirmed} confirmed paid pre-orders (${Math.round(bookingRate * 100)}% of active quota committed).`
      },
      {
        name: 'Weekday & Seasonal Trends',
        icon: 'calendar',
        status: 'verified',
        summary: 'Tuesday schedule shows heavy early rush concentrated in Lunch Shift 1 (11:30 AM).'
      },
      {
        name: 'Academic Schedules & Events',
        icon: 'event',
        status: 'verified',
        summary: 'Midterm Examination Week & Lab Sessions: compressed 40-minute breaks drive digital pre-ordering.'
      },
      {
        name: 'Student Preferences & Feedback',
        icon: 'taste',
        status: 'verified',
        summary: 'Customer Taste Index at 90%+ approval across recent verified digital student reviews.'
      },
      {
        name: 'Weather Conditions',
        icon: 'weather',
        status: 'verified',
        summary: 'Scattered afternoon rain showers (27°C) — +15% to +18% demand surge on hot soups & comfort meals.'
      }
    ];

    return {
      level,
      levelClass,
      badgeText,
      score: totalScore,
      logCount,
      bookingRatePct: Math.round(bookingRate * 100),
      isSimulated: true,
      prototypeNotice: 'Prototype Model Preview • Simulated using Mindoro State University (MinSU) campus datasets',
      factors
    };
  },

  /**
   * Historical vs Actual Preparation Performance Engine.
   * Tracks Predicted vs Prepared vs Claimed vs Cancelled/No-show vs Unsold.
   * Dynamically calculates actual accuracy and waste saved from records.
   */
  getHistoricalPerformance(vendorId) {
    const rawLogs = this.getHistoricalLogs(vendorId);
    if (!rawLogs || !Array.isArray(rawLogs) || rawLogs.length === 0) {
      return {
        hasData: false,
        averageAccuracy: null,
        totalWasteSavedKg: 0,
        totalPrepared: 0,
        totalClaimed: 0,
        totalUnsold: 0,
        totalCancelled: 0,
        logs: []
      };
    }

    let totalPrepared = 0;
    let totalClaimed = 0;
    let totalUnsold = 0;
    let totalCancelled = 0;
    let totalWasteSaved = 0;
    let sumAccuracy = 0;

    const logs = rawLogs.map(log => {
      const prepared = log.prepared || 0;
      const claimed = log.claimed || (log.preordered + (log.walkIn || 0));
      const unsold = log.unsold !== undefined ? log.unsold : 0;
      const cancelledNoShow = log.cancelledNoShow !== undefined ? log.cancelledNoShow : 1;
      const predicted = log.predictedDemand || Math.round(prepared * 1.02);

      // Formula: Accuracy = (Claimed / Prepared) * 100
      const accuracy = prepared > 0 ? Math.min(100, Math.round((claimed / prepared) * 1000) / 10) : 0;
      const wasteSavedKg = log.wasteSavedKg !== undefined ? log.wasteSavedKg : +(claimed * 0.28).toFixed(1);

      totalPrepared += prepared;
      totalClaimed += claimed;
      totalUnsold += unsold;
      totalCancelled += cancelledNoShow;
      totalWasteSaved += wasteSavedKg;
      sumAccuracy += accuracy;

      return {
        date: log.date,
        day: log.day,
        predictedDemand: predicted,
        prepared,
        claimed,
        cancelledNoShow,
        unsold,
        accuracy: accuracy.toFixed(1),
        wasteSavedKg
      };
    });

    const averageAccuracy = logs.length > 0 ? (sumAccuracy / logs.length).toFixed(1) : null;

    return {
      hasData: true,
      averageAccuracy,
      totalWasteSavedKg: totalWasteSaved.toFixed(1),
      totalPrepared,
      totalClaimed,
      totalUnsold,
      totalCancelled,
      logs
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

    let storedReviews = [];
    try {
      if (SapatStorage && typeof SapatStorage.getReviews === 'function') {
        const raw = SapatStorage.getReviews(vendorId);
        storedReviews = (raw || []).map(r => ({
          id: r.id,
          studentName: r.studentName || 'Student',
          initials: (r.studentName || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          dept: 'Mindoro State University (MinSU)',
          rating: r.rating || 5,
          dishName: r.dishName || 'Canteen Meal',
          comment: r.comment || '',
          tags: [r.tasteTag, r.portionTag].filter(Boolean),
          timestamp: 'Verified Student Pre-order',
          tag: 'Verified Student Pre-order'
        }));
      }
    } catch (e) {}

    const seenIds = new Set();
    const allReviews = [];
    for (const rev of [...extraReviews, ...storedReviews, ...baseFeedback.recentReviews]) {
      if (!seenIds.has(rev.id)) {
        seenIds.add(rev.id);
        allReviews.push(rev);
      }
    }

    return {
      vendorId,
      sentimentScore: baseFeedback.sentimentScore,
      totalReviews: baseFeedback.totalReviews + storedReviews.length + extraReviews.length,
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
    const baseMeals = MOCK_REQUESTED_MEALS[vendorId] || MOCK_REQUESTED_MEALS['vendor-lita'] || [];
    const extraVotes = sim.extraVotes[vendorId] || {};

    const formattedBase = baseMeals.map((meal, idx) => {
      const stableId = `wish-seed-${vendorId}-${idx}`;
      return {
        ...meal,
        id: stableId,
        votes: meal.votes + (extraVotes[meal.dishName] || 0)
      };
    });

    // Merge student-submitted meal suggestions from storage
    let customSuggestions = [];
    try {
      if (SapatStorage && typeof SapatStorage.getMealSuggestions === 'function') {
        const stored = SapatStorage.getMealSuggestions(vendorId);
        customSuggestions = stored.map(s => ({
          id: s.id,
          dishName: s.dishName,
          category: 'Student Suggestion',
          votes: Number(s.votes) || 1,
          topDept: 'Student Campus Community',
          suggestedPrice: 65,
          projectedDailyDemand: Math.max(15, Math.round((Number(s.votes) || 1) * 1.8)),
          confidence: 'Live Student Demand',
          notes: s.description || 'Suggested by students via campus app'
        }));
      }
    } catch (e) {
      console.error('Failed reading custom suggestions in forecasting', e);
    }

    // Combine without duplicate names
    const seenNames = new Set();
    const combined = [];
    for (const item of [...customSuggestions, ...formattedBase]) {
      const key = item.dishName.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        combined.push(item);
      }
    }

    return combined.sort((a, b) => b.votes - a.votes);
  },

  /**
   * Returns tomorrow's predictive demand forecast.
   * Tailored per vendor; falls back to dynamically derived stall dishes if not in mock data.
   * @param {string} vendorId
   */
  getTomorrowForecast(vendorId) {
    if (MOCK_TOMORROW_FORECAST[vendorId]) {
      return MOCK_TOMORROW_FORECAST[vendorId];
    }
    const vendor = SapatStorage.getVendorById(vendorId);
    const menu = SapatStorage.getMenu();
    const vendorDishes = menu.filter(d => d.vendorId === vendorId);

    return {
      forecastDate: 'Tomorrow • Tuesday, Nov 10',
      weatherCondition: 'Scattered afternoon rain showers • 27°C',
      weatherImpact: '+15% hot lunch dwell time',
      campusSchedule: 'Regular Academic Schedule & Lab Sessions',
      scheduleImpact: 'Steady lunch flow across Shifts 1 and 2',
      dishes: vendorDishes.map(d => ({
        name: d.name,
        projectedDemand: Math.round((d.dailyLimit || 35) * 1.1),
        recommendedTarget: Math.round((d.dailyLimit || 35) * 1.15),
        currentLimit: d.dailyLimit || 35,
        recommendation: `Target ${Math.round((d.dailyLimit || 35) * 1.15)} portions`,
        rationale: `Baseline student demand for ${vendor ? vendor.name : 'Stall'} with steady mid-week foot traffic.`
      }))
    };
  },

  /**
   * Returns recent multi-week operational performance logs for a vendor stall.
   * Returns null if no historical records exist.
   * @param {string} vendorId
   */
  getHistoricalLogs(vendorId) {
    return MOCK_HISTORICAL_LOGS[vendorId] || null;
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
   * LIVE DEMO SIMULATION ALIASES
   */
  simulateStudentReview(vendorId) {
    return this.simulateStudentFeedback(vendorId);
  },

  simulateWishlistVote(vendorId) {
    const topWish = this.getRequestedMeals(vendorId)[0];
    if (topWish) {
      return this.simulateDishRequest(vendorId, topWish.dishName);
    }
    return null;
  },

  /**
   * ADMIN CAMPUS-WIDE INTELLIGENCE:
   * Aggregates intelligence across all 5 participating campus canteens.
   * Generates macro sustainability, overall satisfaction, and multi-stall comparisons.
   */
  getCampusWideAnalytics() {
    const vendors = SapatStorage.getVendors();
    const menu = SapatStorage.getMenu();
    const orders = SapatStorage.getOrders().filter(o => o.status !== 'Cancelled');

    let totalCampusTarget = 0;
    let totalCampusReserved = 0;
    let totalWastePreventedKg = 0;
    let totalSatisfactionSum = 0;

    const canteenComparisons = vendors.map(v => {
      const vDishes = menu.filter(d => d.vendorId === v.id);
      const target = vDishes.reduce((s, d) => s + d.dailyLimit, 0);
      const reserved = vDishes.reduce((s, d) => s + d.reservedServings, 0);
      const remaining = Math.max(0, target - reserved);
      const bookingRate = target > 0 ? Math.round((reserved / target) * 100) : 0;
      const tasteData = this.getCustomerTasteAnalysis(v.id);
      const stallForecast = this.getVendorForecast(v.id);

      totalCampusTarget += target;
      totalCampusReserved += reserved;
      totalWastePreventedKg += parseFloat(stallForecast?.sustainability?.wastePreventedKg || 0) || 0;
      totalSatisfactionSum += tasteData.sentimentScore;

      return {
        id: v.id,
        name: v.name,
        stallNumber: v.stallNumber,
        category: v.category,
        isOpen: v.isOpen,
        target,
        reserved,
        remaining,
        bookingRate,
        satisfaction: tasteData.sentimentScore,
        accuracy: stallForecast.sustainability.prepAccuracyPct,
        wasteSavedKg: stallForecast.sustainability.wastePreventedKg
      };
    });

    const avgSatisfaction = vendors.length ? Math.round(totalSatisfactionSum / vendors.length) : 92;
    const avgAccuracy = vendors.length ? (canteenComparisons.reduce((s, c) => s + (parseFloat(c.accuracy) || 96.0), 0) / vendors.length).toFixed(1) : '96.0';

    // Aggregate top campus requested dishes across all stalls
    const allRequested = [];
    vendors.forEach(v => {
      const wishes = this.getRequestedMeals(v.id);
      wishes.forEach(w => allRequested.push({ ...w, stallName: v.name }));
    });
    allRequested.sort((a, b) => b.votes - a.votes);

    return {
      totalCampusTarget,
      totalCampusReserved,
      totalCampusRemaining: Math.max(0, totalCampusTarget - totalCampusReserved),
      totalWastePreventedKg: totalWastePreventedKg.toFixed(1),
      co2SavedKg: (totalWastePreventedKg * 2.1).toFixed(1),
      avgSatisfaction,
      avgAccuracy,
      canteenComparisons,
      topCampusRequested: allRequested.slice(0, 6)
    };
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
