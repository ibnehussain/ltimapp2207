// storage.js — manages recent searches in localStorage

/** @type {string} localStorage key used to persist recent city searches. */
const STORAGE_KEY = 'weather_recent_cities';

/** @type {number} Maximum number of recent cities to store. */
const MAX_RECENT = 5;

/**
 * Retrieve the list of recently searched cities from localStorage.
 *
 * @returns {string[]} Ordered array of city name strings (most-recent first),
 *   or an empty array if nothing has been saved or parsing fails.
 */
function getRecentCities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Persist a city name to the recent-searches list.
 *
 * Duplicate entries (case-insensitive) are removed before prepending the new
 * city so that the list always reflects the latest search order.  The list is
 * capped at {@link MAX_RECENT} entries.
 *
 * @param {string} city - The city name to save.  Whitespace is trimmed; empty
 *   strings are ignored.
 * @returns {void}
 */
function saveCity(city) {
  const trimmed = city.trim();
  if (!trimmed) return;

  let cities = getRecentCities().filter(c => c.toLowerCase() !== trimmed.toLowerCase());
  cities.unshift(trimmed);
  cities = cities.slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}
