/**
 * Trading Bot Safety Radar System
 * Real-time economic calendar monitoring for XAU/USD and forex trading bots
 */

/**
 * Parse event date and time to Date object
 * @param {Object} event - Event object with date and time
 * @param {Date} currentTime - Current time for reference
 * @returns {Date} Event time as Date object
 */
function parseEventTime(event, currentTime = new Date()) {
  const now = currentTime;

  // If we have UTC time from API, use it directly
  if (event.utcTime && event.utcTime instanceof Date) {
    return event.utcTime;
  }

  const today = now.toISOString().split('T')[0];

  // Handle different date formats
  let eventDate = event.date;
  if (eventDate === 'Today') {
    eventDate = today;
  } else if (eventDate === 'Tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    eventDate = tomorrow.toISOString().split('T')[0];
  }

  // Parse time (format: "HH:MM" or "HH:MM GMT")
  const timeStr = event.time || '00:00';
  const timeParts = timeStr.split(' ')[0]; // Remove timezone if present
  const [hours, minutes] = timeParts.split(':').map(Number);

  const eventTime = new Date(now);

  // Handle YYYY-MM-DD format
  if (eventDate.includes('-')) {
    const [year, month, day] = eventDate.split('-').map(Number);
    eventTime.setFullYear(year, month - 1, day);
  } else {
    // Fallback for other formats
    eventTime.setDate(parseInt(eventDate, 10) || now.getDate());
  }

  eventTime.setHours(hours, minutes, 0, 0);

  return eventTime;
}

/**
 * Calculate the next high/medium impact economic event
 * @param {Array} events - Economic events array
 * @param {Date} currentTime - Current time
 * @returns {Object|null} Next event or null
 */
export function getNextHighImpactEvent(events, currentTime = new Date()) {
  const now = currentTime;

  // Filter events with HIGH or MEDIUM impact
  const highImpactEvents = events.filter(e => {
    const isHighImpact = e.impact === 'HIGH' || e.impact === 'MEDIUM';
    return isHighImpact;
  });

  if (highImpactEvents.length === 0) return null;

  // Parse event times
  const eventsWithTime = highImpactEvents.map(e => {
    const eventTime = parseEventTime(e, now);
    return { ...e, eventTime };
  });

  // Filter events that are in the future or just happened (within last 15 minutes)
  const futureOrRecentEvents = eventsWithTime.filter(e => {
    const timeSinceEvent = now - e.eventTime;
    const minutesSinceEvent = timeSinceEvent / (1000 * 60);
    // Include events in the future OR events that happened in the last 15 minutes
    return e.eventTime > now || minutesSinceEvent <= 15;
  });

  if (futureOrRecentEvents.length === 0) return null;

  // Sort by time and return the next one
  futureOrRecentEvents.sort((a, b) => a.eventTime - b.eventTime);
  return futureOrRecentEvents[0] || null;
}

/**
 * Calculate remaining time in seconds
 * @param {Date} currentTime - Current time
 * @param {Date} eventTime - Event time
 * @returns {number} Remaining seconds
 */
export function calculateRemainingSeconds(currentTime, eventTime) {
  const diff = eventTime - currentTime;
  return Math.max(0, Math.floor(diff / 1000));
}

/**
 * Format seconds to MM:SS format
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time
 */
export function formatTimeRemaining(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to Moroccan Darija
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time in Darija
 */
export function formatTimeDarija(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}س ${minutes}د ${secs}ث`;
  if (minutes > 0) return `${minutes}د ${secs}ث`;
  return `${secs}ث`;
}

/**
 * Determine safety status based on remaining time
 * @param {number} remainingSeconds - Remaining seconds until event
 * @param {Date} eventTime - Event time
 * @param {Date} currentTime - Current time
 * @returns {Object} Safety status
 */
export function determineSafetyStatus(remainingSeconds, eventTime, currentTime = new Date()) {
  const timeSinceEvent = currentTime - eventTime;
  const minutesSinceEvent = timeSinceEvent / (1000 * 60);

  // Event just published or within 15 minutes
  if (minutesSinceEvent >= 0 && minutesSinceEvent <= 15) {
    return {
      status: 'VOLATILE',
      color: '#f59e0b',
      colorClass: 'text-warn',
      bgColorClass: 'bg-warn/20',
      borderColorClass: 'border-warn/50',
      message: '⚠️ الخبر صدر حالياً! اترك البوت متوقفاً حتى استقرار السبريد والشارت',
      banner: '⚠️ الخبر صدر حالياً! اترك البوت متوقفاً حتى استقرار السبريد والشارت',
      isPulsing: true,
    };
  }

  // Less than 30 minutes remaining
  if (remainingSeconds > 0 && remainingSeconds <= 30 * 60) {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return {
      status: 'DANGER',
      color: '#ef4444',
      colorClass: 'text-loss',
      bgColorClass: 'bg-loss/20',
      borderColorClass: 'border-loss/50',
      message: `🚨 إنذار مبكر: باقي ${minutes} دقيقة و ${seconds} ثانية على الخبر! حَبّـس البوت دابـا (PAUSE BOT NOW)`,
      banner: `🚨 إنذار مبكر: باقي ${minutes} دقيقة و ${seconds} ثانية على الخبر! حَبّـس البوت دابـا (PAUSE BOT NOW)`,
      isPulsing: true,
    };
  }

  // Safe zone
  return {
    status: 'SAFE',
    color: '#10b981',
    colorClass: 'text-profit',
    bgColorClass: 'bg-profit/20',
    borderColorClass: 'border-profit/50',
    message: 'الوضع آمن - الروبوتات تعمل بشكل طبيعي',
    banner: 'الوضع آمن - الروبوتات تعمل بشكل طبيعي',
    isPulsing: false,
  };
}

/**
 * Generate complete radar data JSON
 * @param {Array} events - Economic events
 * @param {Date} currentTime - Current time
 * @returns {Object} Complete radar data
 */
export function generateRadarData(events, currentTime = new Date()) {
  const nextEvent = getNextHighImpactEvent(events, currentTime);
  
  if (!nextEvent) {
    return {
      status: 'SAFE',
      remaining_seconds: 0,
      time_formatted: '00:00',
      event_title: null,
      impact: null,
      currency: null,
      banner_message: 'الوضع آمن - ما فيش أخبار قادمة اليوم',
      color: '#10b981',
      isPulsing: false,
    };
  }
  
  const remainingSeconds = calculateRemainingSeconds(currentTime, nextEvent.eventTime);
  const safetyStatus = determineSafetyStatus(remainingSeconds, nextEvent.eventTime, currentTime);
  
  return {
    status: safetyStatus.status,
    remaining_seconds: remainingSeconds,
    time_formatted: formatTimeRemaining(remainingSeconds),
    event_title: nextEvent.event,
    impact: nextEvent.impact,
    currency: nextEvent.currency,
    banner_message: safetyStatus.banner,
    detailed_message: safetyStatus.message,
    color: safetyStatus.color,
    colorClass: safetyStatus.colorClass,
    bgColorClass: safetyStatus.bgColorClass,
    borderColorClass: safetyStatus.borderColorClass,
    isPulsing: safetyStatus.isPulsing,
    eventTime: nextEvent.eventTime,
  };
}
