// app.js — wires up events and orchestrates API + UI + storage

/**
 * Bootstrap the application once the DOM is fully loaded.
 *
 * Renders any persisted recent searches and attaches all event listeners for
 * city search, geolocation, and the temperature-unit toggle.
 */
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

/**
 * Handle a city-name weather search triggered by the search button or Enter key.
 *
 * Reads the value from the ``#city-input`` field, calls the API, renders the
 * result, saves the search, and refreshes the recent-searches list.  Does
 * nothing if the input is empty.
 *
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * Handle a geolocation weather lookup triggered by the 📍 button.
 *
 * Requests the browser's current position; on success, fetches weather for
 * the returned coordinates and populates the city input field with the
 * resolved city name.  Displays an appropriate error message if geolocation
 * is unsupported or the user denies the permission prompt.
 *
 * @returns {void}
 */
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
