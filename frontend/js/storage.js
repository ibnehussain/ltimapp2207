// storage.js — manages recent searches in localStorage

const STORAGE_KEY = 'weather_recent_cities';
const MAX_RECENT = 5;

function getRecentCities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCity(city) {
  const trimmed = city.trim();
  if (!trimmed) return;

  let cities = getRecentCities().filter(c => c.toLowerCase() !== trimmed.toLowerCase());
  cities.unshift(trimmed);
  cities = cities.slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}
