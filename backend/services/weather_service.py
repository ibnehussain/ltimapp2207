"""
services/weather_service.py — Fetches weather data from Open-Meteo.

Two public entry points are provided:

* :func:`get_weather_by_city` — resolves a city name via the Open-Meteo
  geocoding API, then fetches weather for the returned coordinates.
* :func:`get_weather_by_coords` — fetches weather directly from a lat/lon
  pair (used for the browser Geolocation flow).

Both return a normalised dictionary ready to be serialised as JSON by the
Flask route layer.

External APIs used
------------------
* **Geocoding** — ``https://geocoding-api.open-meteo.com/v1/search``
* **Weather**   — ``https://api.open-meteo.com/v1/forecast``

No API key is required.
"""

import requests

GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
WEATHER_URL   = 'https://api.open-meteo.com/v1/forecast'

# WMO weather code → (condition label, emoji)
WMO_CODES = {
    0:  ('Clear',          '☀️'),
    1:  ('Mainly Clear',   '🌤️'),
    2:  ('Partly Cloudy',  '⛅'),
    3:  ('Overcast',       '☁️'),
    45: ('Fog',            '🌫️'),
    48: ('Icy Fog',        '🌫️'),
    51: ('Light Drizzle',  '🌦️'),
    53: ('Drizzle',        '🌦️'),
    55: ('Heavy Drizzle',  '🌧️'),
    61: ('Light Rain',     '🌧️'),
    63: ('Rain',           '🌧️'),
    65: ('Heavy Rain',     '🌧️'),
    71: ('Light Snow',     '❄️'),
    73: ('Snow',           '❄️'),
    75: ('Heavy Snow',     '❄️'),
    77: ('Snow Grains',    '🌨️'),
    80: ('Rain Showers',   '🌧️'),
    81: ('Heavy Showers',  '🌧️'),
    82: ('Violent Showers','⛈️'),
    85: ('Snow Showers',   '🌨️'),
    86: ('Heavy Snow Showers', '🌨️'),
    95: ('Thunderstorm',   '⛈️'),
    96: ('Thunderstorm',   '⛈️'),
    99: ('Thunderstorm',   '⛈️'),
}


def _wmo(code: int):
    """Look up a WMO weather interpretation code.

    Args:
        code (int): WMO weather code returned by Open-Meteo.

    Returns:
        tuple[str, str]: A ``(condition_label, emoji)`` pair.
        Falls back to ``('Unknown', '🌡️')`` for unrecognised codes.
    """
    return WMO_CODES.get(code, ('Unknown', '🌡️'))


def get_weather_by_city(city: str) -> dict:
    """Resolve a city name to coordinates and return weather data.

    Calls the Open-Meteo geocoding API to convert *city* into a
    latitude/longitude pair, then delegates to :func:`_fetch_weather`.

    Args:
        city (str): The city name to look up (e.g. ``'London'``).

    Returns:
        dict: Normalised weather payload — see :func:`_fetch_weather`.

    Raises:
        LookupError: If the geocoding API returns no results for *city*.
        requests.HTTPError: If either upstream HTTP request fails.
    """
    # Step 1: resolve city name → lat/lon
    geo_resp = requests.get(
        GEOCODING_URL,
        params={'name': city, 'count': 1, 'language': 'en', 'format': 'json'},
        timeout=5
    )
    geo_resp.raise_for_status()
    results = geo_resp.json().get('results')

    if not results:
        raise LookupError('City not found.')

    location = results[0]
    return _fetch_weather(
        lat=location['latitude'],
        lon=location['longitude'],
        city=location['name'],
        country=location.get('country_code', '').upper()
    )


def get_weather_by_coords(lat: float, lon: float) -> dict:
    """Return weather data for a specific latitude/longitude.

    Args:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.

    Returns:
        dict: Normalised weather payload — see :func:`_fetch_weather`.
        ``city`` is set to ``'Your Location'`` and ``country`` is empty.

    Raises:
        requests.HTTPError: If the upstream HTTP request fails.
    """
    return _fetch_weather(lat=lat, lon=lon, city='Your Location', country='')


def _fetch_weather(lat: float, lon: float, city: str, country: str) -> dict:
    """Fetch current conditions and a 5-day forecast from Open-Meteo.

    Args:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.
        city (str): Display name for the city (used in the response payload).
        country (str): ISO 3166-1 alpha-2 country code (e.g. ``'GB'``).

    Returns:
        dict: Normalised weather payload with the following keys:

        * ``city`` (str)
        * ``country`` (str)
        * ``temperature`` (float) — current temperature in °C.
        * ``feels_like`` (float) — apparent temperature in °C.
        * ``humidity`` (int) — relative humidity in %.
        * ``wind_speed`` (float) — wind speed in m/s.
        * ``condition`` (str) — human-readable condition label.
        * ``icon`` (str) — weather emoji.
        * ``forecast`` (list[dict]) — up to 5 daily forecast objects, each
          with ``date``, ``high``, ``low``, ``condition``, and ``icon``.

    Raises:
        requests.HTTPError: If the upstream HTTP request fails.
    """
    resp = requests.get(
        WEATHER_URL,
        params={
            'latitude':  lat,
            'longitude': lon,
            'current':   'temperature_2m,apparent_temperature,relativehumidity_2m,windspeed_10m,weathercode',
            'daily':     'temperature_2m_max,temperature_2m_min,weathercode',
            'timezone':  'auto',
            'forecast_days': 5,
        },
        timeout=5
    )
    resp.raise_for_status()
    data = resp.json()

    current  = data['current']
    daily    = data['daily']
    wmo_code = current['weathercode']
    condition, icon = _wmo(wmo_code)

    forecast = []
    for i in range(len(daily['time'])):
        day_condition, day_icon = _wmo(daily['weathercode'][i])
        forecast.append({
            'date':      daily['time'][i],
            'high':      round(daily['temperature_2m_max'][i], 1),
            'low':       round(daily['temperature_2m_min'][i], 1),
            'condition': day_condition,
            'icon':      day_icon,
        })

    return {
        'city':        city,
        'country':     country,
        'temperature': round(current['temperature_2m'], 1),
        'feels_like':  round(current['apparent_temperature'], 1),
        'humidity':    current['relativehumidity_2m'],
        'wind_speed':  current['windspeed_10m'],
        'condition':   condition,
        'icon':        icon,
        'forecast':    forecast[:5],
    }
