/**
 * Gold Price API Service
 * Fetches real-time gold (XAU/USD) spot prices from xaus.com
 */

const API_BASE = 'https://xaus.com/api/v1/spot';

/**
 * Fetch current gold spot price
 * @param {Object} options - Fetch options
 * @param {string} options.currency - Currency code (default: 'USD')
 * @param {string} options.unit - Unit: 'troy_oz', 'gram', 'kg' (default: 'troy_oz')
 * @returns {Promise<Object>} Gold price data
 */
export async function fetchGoldPrice(options = {}) {
  const {
    currency = 'USD',
    unit = 'troy_oz',
  } = options;

  const params = new URLSearchParams({
    currency,
    unit,
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return null;
  }
}

/**
 * Format gold price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency code
 * @returns {string} Formatted price string
 */
export function formatGoldPrice(price, currency = 'USD') {
  if (price === null || price === undefined) return '---';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate price change percentage
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {Object} Change data with value and percentage
 */
export function calculatePriceChange(currentPrice, previousPrice) {
  if (!currentPrice || !previousPrice) {
    return { value: 0, percentage: 0, direction: 'neutral' };
  }

  const value = currentPrice - previousPrice;
  const percentage = (value / previousPrice) * 100;
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  return { value, percentage, direction };
}
