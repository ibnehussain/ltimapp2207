// app.js — wires up events and orchestrates API + UI + storage

document.addEventListener('DOMContentLoaded', () => {

  // Render any saved recent searches on load
  renderRecentSearches(getRecentCities());

  // ---- Search by city name ----
  document.getElementById('get-weather-btn').addEventListener('click', handleCitySearch);

  document.getElementById('city-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleCitySearch();
  });

  // ---- Use My Location ----
  document.getElementById('location-btn').addEventListener('click', handleGeolocation);

  // ---- Toggle °C / °F ----
  document.getElementById('unit-btn').addEventListener('click', toggleUnit);

});

async function handleCitySearch() {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return;

  showSpinner();

  try {
    const data = await fetchWeatherByCity(city);
    renderWeather(data);
    saveCity(city);
    renderRecentSearches(getRecentCities());
  } catch (err) {
    showError(err.message || 'Could not fetch weather. Please try again.');
  }
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  showSpinner();

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const data = await fetchWeatherByCoords(coords.latitude, coords.longitude);
        renderWeather(data);
        document.getElementById('city-input').value = data.city;
        saveCity(data.city);
        renderRecentSearches(getRecentCities());
      } catch (err) {
        showError(err.message || 'Could not fetch weather for your location.');
      }
    },
    () => {
      hideSpinner();
      document.getElementById('city-input').focus();
      showError('Location access denied. Please enter a city name manually.');
    }
  );
}
