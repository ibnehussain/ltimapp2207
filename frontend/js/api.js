// api.js — handles all fetch calls to the Flask backend

const BASE_URL = 'http://127.0.0.1:5000';

async function fetchWeatherByCity(city) {
  const encodedCity = encodeURIComponent(city.trim());
  const response = await fetch(`${BASE_URL}/weather?city=${encodedCity}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  return response.json();
}

async function fetchWeatherByCoords(lat, lon) {
  const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  return response.json();
}
