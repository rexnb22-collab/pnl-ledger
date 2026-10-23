/**
 * Economic Calendar API Service
 * Fetches real-time economic events from financecalendar.com
 */

const API_BASE = 'https://www.financecalendar.com/wp-json/fc/v1/calendar';

/**
 * Fetch economic calendar events
 * @param {Object} options - Filter options
 * @param {string} options.countries - Comma-separated country codes (e.g., 'US,EU,GB')
 * @param {string} options.impact - Impact level: 'high', 'medium', 'low'
 * @param {number} options.limit - Maximum number of events to return
 * @returns {Promise<Array>} Array of economic events
 */
export async function fetchEconomicEvents(options = {}) {
  const {
    countries = 'US,EU,GB',
    impact = 'high,medium',
    limit = 20,
  } = options;

  const params = new URLSearchParams({
    country: countries,
    impact,
    limit: limit.toString(),
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    // Return empty array on error to allow fallback to mock data
    return [];
  }
}

/**
 * Transform API events to internal format
 * @param {Array} apiEvents - Events from API
 * @returns {Array} Transformed events
 */
export function transformAPIEvents(apiEvents) {
  return apiEvents.map((event) => {
    // Parse time from time_utc (format: "2026-10-28T18:00:00+00:00")
    let timeStr = '00:00';
    let dateStr = 'Today';
    let eventTimeObj = null;

    if (event.time_utc) {
      eventTimeObj = new Date(event.time_utc);
      const hours = eventTimeObj.getUTCHours();
      const minutes = eventTimeObj.getUTCMinutes();
      timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const year = eventTimeObj.getUTCFullYear();
      const month = (eventTimeObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = eventTimeObj.getUTCDate().toString().padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    } else if (event.time_et) {
      // Fallback to ET time
      timeStr = event.time_et;
      dateStr = event.date || 'Today';
    }

    return {
      id: event.id || `api-${Date.now()}-${Math.random()}`,
      time: timeStr,
      date: dateStr,
      currency: event.country === 'US' ? 'USD' : event.country === 'EU' ? 'EUR' : 'USD',
      impact: (event.impact || 'MEDIUM').toUpperCase(),
      event: event.title || event.name || 'Economic Event',
      forecast: event.consensus || null,
      previous: event.prior || null,
      actual: event.actual || null,
      affectedAssets: ['XAUUSD'],
      notes: event.note || '',
      // Store the UTC time object for accurate parsing
      utcTime: eventTimeObj,
    };
  });
}

/**
 * Get upcoming economic events (sorted by time)
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} Upcoming events
 */
export async function getUpcomingEvents(options = {}) {
  const apiEvents = await fetchEconomicEvents(options);
  return transformAPIEvents(apiEvents);
}
