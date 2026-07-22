# Architecture Overview

This document describes the high-level architecture of the Weather Dashboard
application, the responsibilities of each component, and the data flow between
them.

---

## System Diagram

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                             │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  frontend/                           │  │
│  │                                                      │  │
│  │  index.html  ──► css/styles.css                      │  │
│  │       │                                              │  │
│  │       └──► js/storage.js  (localStorage)             │  │
│  │       └──► js/ui.js       (DOM rendering)            │  │
│  │       └──► js/api.js      (HTTP fetch)               │  │
│  │       └──► js/app.js      (event wiring)             │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │  GET /weather?city=…             │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTP (port 5000)
┌─────────────────────────▼──────────────────────────────────┐
│                     backend/                               │
│                                                            │
│  app.py  (Flask factory + CORS + Cache)                    │
│    └──► routes/weather.py   (Blueprint: GET /weather)      │
│              └──► services/weather_service.py              │
│                        │                                   │
└────────────────────────┼───────────────────────────────────┘
                         │ HTTPS
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                │
 Open-Meteo         Open-Meteo            │
 Geocoding API      Forecast API          │
 (city → lat/lon)  (lat/lon → weather)   │
```

---

## Component Responsibilities

### Frontend

| File | Responsibility |
|------|----------------|
| `index.html` | Application shell; static markup for all UI sections. |
| `css/styles.css` | Glassmorphism theme, responsive layout, animations. |
| `js/app.js` | Entry point; registers DOM event listeners and orchestrates the other modules. |
| `js/api.js` | All `fetch` calls to the Flask backend; throws typed errors on non-2xx responses. |
| `js/ui.js` | All DOM reads and writes: spinner, error banner, weather card, forecast cards, unit toggle. |
| `js/storage.js` | `localStorage` helpers: persists and retrieves the last 5 searched cities. |

### Backend

| File | Responsibility |
|------|----------------|
| `app.py` | Flask application factory (`create_app`); wires CORS, caching, and blueprints. |
| `config.py` | `Config` class; reads settings from environment variables via `python-dotenv`. |
| `routes/weather.py` | `GET /weather` endpoint; validates query parameters and maps exceptions to HTTP status codes. |
| `services/weather_service.py` | Geocoding (city → lat/lon) and weather data fetching from Open-Meteo; normalises the response into a flat dictionary. |

---

## Data Flow

### City Search

```
User types city name → handleCitySearch()
  → fetchWeatherByCity(city)               [api.js]
      → GET /weather?city=London           [Flask route]
          → get_weather_by_city("London")  [weather_service.py]
              → Open-Meteo Geocoding API   → lat/lon
              → Open-Meteo Forecast API    → weather JSON
          ← normalised dict
      ← JSON 200
  → renderWeather(data)                    [ui.js]
  → saveCity(city)                         [storage.js]
  → renderRecentSearches(cities)           [ui.js]
```

### Geolocation Search

```
User clicks 📍 → handleGeolocation()
  → navigator.geolocation.getCurrentPosition()
      → fetchWeatherByCoords(lat, lon)     [api.js]
          → GET /weather?lat=…&lon=…       [Flask route]
              → get_weather_by_coords()    [weather_service.py]
                  → Open-Meteo Forecast API
              ← normalised dict
          ← JSON 200
      → renderWeather(data)               [ui.js]
```

---

## Key Design Decisions

### No API Key Required
Weather data is fetched from [Open-Meteo](https://open-meteo.com/), a
free, open-source weather API that requires no registration or API key.

### Backend as a Thin Proxy
The Flask backend serves two purposes:
1. **Geocoding** — translates a city name into latitude/longitude coordinates
   using the Open-Meteo geocoding endpoint (not available client-side due to
   CORS restrictions on some browsers).
2. **Response caching** — uses Flask-Caching (`SimpleCache`) to cache API
   responses for 10 minutes, reducing upstream calls and improving response
   times for repeated queries.

### Frontend-Served Separately
During local development the frontend (`frontend/index.html`) is opened
directly in the browser as a `file://` URL or served by any static server.
Flask-CORS is configured to allow cross-origin requests from any origin to
the `/weather` route, enabling this workflow without a build step.

For production (Azure deployment) the frontend can be served directly from
Flask — see the **Serve Frontend via Flask** section in
[`README.md`](../README.md).

### Temperature Unit Toggle
The raw API payload always returns temperatures in **°C**.  Unit conversion is
done entirely in the browser (`ui.js: convertTemp`) so no extra API calls are
needed when the user toggles between °C and °F.  The last fetched payload is
cached in the `lastData` variable for this purpose.

### Recent Searches
The last 5 city searches are persisted in `localStorage` (key:
`weather_recent_cities`) and rendered as clickable pill buttons.  No server
state is required.

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | HTML5, CSS3, Vanilla JavaScript | — |
| Backend | Python, Flask | 3.10+ / 3.x |
| Cross-Origin | Flask-CORS | latest |
| Response Cache | Flask-Caching (`SimpleCache`) | latest |
| HTTP Client | `requests` | latest |
| Weather Data | Open-Meteo API | free tier |
| Deployment | Azure App Service (Linux) | Python 3.12 runtime |
