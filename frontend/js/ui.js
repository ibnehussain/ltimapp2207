// ui.js — all DOM read/write operations

let currentUnit = 'C';
let lastData = null;

function showSpinner() {
  document.getElementById('spinner').classList.remove('hidden');
  document.getElementById('error-banner').classList.add('hidden');
  document.getElementById('weather-result').classList.add('hidden');
  document.getElementById('forecast-section').classList.add('hidden');
}

function hideSpinner() {
  document.getElementById('spinner').classList.add('hidden');
}

function showError(message) {
  hideSpinner();
  const banner = document.getElementById('error-banner');
  banner.textContent = message;
  banner.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-banner').classList.add('hidden');
}

function convertTemp(celsius) {
  if (currentUnit === 'F') {
    return ((celsius * 9) / 5 + 32).toFixed(1) + ' °F';
  }
  return celsius.toFixed(1) + ' °C';
}

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

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

function toggleUnit() {
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  document.getElementById('unit-btn').textContent =
    currentUnit === 'C' ? '°C / °F' : '°F / °C';
  if (lastData) renderWeather(lastData);
}

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
