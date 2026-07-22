// api.js — handles all fetch calls to the Flask backend

/** @type {string} Base URL of the Flask backend. */
const BASE_URL = 'http://127.0.0.1:5000';

/**
 * Fetch current weather and forecast data for a named city.
 *
 * Calls ``GET /weather?city=<city>`` on the Flask backend.
 *
 * @async
 * @param {string} city - The city name to look up.
 * @returns {Promise<Object>} Resolved weather payload from the API.
 * @throws {Error} If the HTTP response is not OK; the error message is taken
 *   from the JSON ``error`` field when available, otherwise falls back to the
 *   HTTP status code.
 */
async function fetchWeatherByCity(city) {
  const encodedCity = encodeURIComponent(city.trim());
  const response = await fetch(`${BASE_URL}/weather?city=${encodedCity}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  return response.json();
}

/**
 * Fetch current weather and forecast data for a geographic coordinate pair.
 *
 * Calls ``GET /weather?lat=<lat>&lon=<lon>`` on the Flask backend.
 *
 * @async
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 * @returns {Promise<Object>} Resolved weather payload from the API.
 * @throws {Error} If the HTTP response is not OK; the error message is taken
 *   from the JSON ``error`` field when available, otherwise falls back to the
 *   HTTP status code.
 */
async function fetchWeatherByCoords(lat, lon) {
  const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  return response.json();
}
