// ui.js — all DOM read/write operations

/** @type {'C'|'F'} Currently active temperature unit. */
let currentUnit = 'C';

/**
 * The last weather payload returned by the API, retained so that switching
 * the temperature unit can re-render without another network call.
 *
 * @type {Object|null}
 */
let lastData = null;

/**
 * Show the loading spinner and hide all result/error sections.
 *
 * @returns {void}
 */
function showSpinner() {
  document.getElementById('spinner').classList.remove('hidden');
  document.getElementById('error-banner').classList.add('hidden');
  document.getElementById('weather-result').classList.add('hidden');
  document.getElementById('forecast-section').classList.add('hidden');
}

/**
 * Hide the loading spinner.
 *
 * @returns {void}
 */
function hideSpinner() {
  document.getElementById('spinner').classList.add('hidden');
}

/**
 * Display an error message in the error banner.
 *
 * Also hides the spinner so the user can take corrective action.
 *
 * @param {string} message - Human-readable error description.
 * @returns {void}
 */
function showError(message) {
  hideSpinner();
  const banner = document.getElementById('error-banner');
  banner.textContent = message;
  banner.classList.remove('hidden');
}

/**
 * Hide the error banner.
 *
 * @returns {void}
 */
function hideError() {
  document.getElementById('error-banner').classList.add('hidden');
}

/**
 * Convert a Celsius value to the currently active unit string.
 *
 * @param {number} celsius - Temperature in degrees Celsius.
 * @returns {string} Formatted temperature string, e.g. `"18.5 °C"` or
 *   `"65.3 °F"`.
 */
function convertTemp(celsius) {
  if (currentUnit === 'F') {
    return ((celsius * 9) / 5 + 32).toFixed(1) + ' °F';
  }
  return celsius.toFixed(1) + ' °C';
}

/**
 * Render the current weather and forecast sections for the given data.
 *
 * Caches the payload in {@link lastData} so the temperature toggle can
 * re-render without re-fetching.
 *
 * @param {Object} data - Weather payload returned by the API.
 * @param {string} data.city - City display name.
 * @param {string} data.country - ISO country code.
 * @param {number} data.temperature - Current temperature in °C.
 * @param {number} data.feels_like - Apparent temperature in °C.
 * @param {number} data.humidity - Relative humidity in %.
 * @param {number} data.wind_speed - Wind speed in m/s.
 * @param {string} data.condition - Human-readable condition label.
 * @param {string} data.icon - Weather emoji.
 * @param {Array<Object>} [data.forecast=[]] - Array of daily forecast objects.
 * @returns {void}
 */
function renderWeather(data) {
  lastData = data;
  hideSpinner();
  hideError();

  // Current weather
  document.getElementById('city-name').textContent =
    `${data.city}, ${data.country}`;
  document.getElementById('weather-date').textContent =
    new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  document.getElementById('temperature').textContent  = convertTemp(data.temperature);
  document.getElementById('feels-like').textContent   = convertTemp(data.feels_like);
  document.getElementById('humidity').textContent     = `${data.humidity} %`;
  document.getElementById('wind-speed').textContent   = `${data.wind_speed} m/s`;
  document.getElementById('condition').textContent    = data.condition;

  const icon = document.getElementById('weather-icon');
  icon.textContent = data.icon;
  icon.removeAttribute('src');
  icon.alt = data.condition;

  document.getElementById('weather-result').classList.remove('hidden');

  // Forecast
  renderForecast(data.forecast || []);
}

/**
 * Render the 5-day forecast cards.
 *
 * Clears any previously rendered cards before rendering the new ones.
 * The forecast section is only made visible when at least one day is provided.
 *
 * @param {Array<Object>} forecast - Array of daily forecast objects.
 * @param {string} forecast[].date - ISO date string (`YYYY-MM-DD`).
 * @param {number} forecast[].high - Daily high temperature in °C.
 * @param {number} forecast[].low - Daily low temperature in °C.
 * @param {string} forecast[].condition - Human-readable condition label.
 * @param {string} forecast[].icon - Weather emoji.
 * @returns {void}
 */
function renderForecast(forecast) {
  const container = document.getElementById('forecast-cards');
  container.innerHTML = '';

  forecast.forEach(day => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <span class="forecast-date">${formatDate(day.date)}</span>
      <span class="forecast-icon">${day.icon}</span>
      <span class="forecast-high">${convertTemp(day.high)}</span>
      <span class="forecast-low">${convertTemp(day.low)}</span>
      <span class="forecast-condition">${day.condition}</span>
    `;
    container.appendChild(card);
  });

  if (forecast.length > 0) {
    document.getElementById('forecast-section').classList.remove('hidden');
  }
}

/**
 * Format an ISO date string into a short, locale-friendly label.
 *
 * @param {string} dateStr - ISO date string in `YYYY-MM-DD` format.
 * @returns {string} Formatted date, e.g. `"Wed, 24 Jul"`.
 */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

/**
 * Toggle the active temperature unit between °C and °F.
 *
 * Updates the toggle button label and re-renders the current weather data
 * (if any) in the new unit.
 *
 * @returns {void}
 */
function toggleUnit() {
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  document.getElementById('unit-btn').textContent =
    currentUnit === 'C' ? '°C / °F' : '°F / °C';
  if (lastData) renderWeather(lastData);
}

/**
 * Render the recent-searches pill buttons below the search box.
 *
 * Hides the entire recent-searches section when the list is empty.
 *
 * @param {string[]} cities - Ordered array of recently searched city names.
 * @returns {void}
 */
function renderRecentSearches(cities) {
  const wrapper = document.getElementById('recent-searches');
  const list = document.getElementById('recent-list');
  list.innerHTML = '';

  if (!cities.length) {
    wrapper.classList.add('hidden');
    return;
  }

  cities.forEach(city => {
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.addEventListener('click', () => {
      document.getElementById('city-input').value = city;
      document.getElementById('get-weather-btn').click();
    });
    list.appendChild(btn);
  });

  wrapper.classList.remove('hidden');
}
