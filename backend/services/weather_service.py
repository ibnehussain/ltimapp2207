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
    return WMO_CODES.get(code, ('Unknown', '🌡️'))


def get_weather_by_city(city: str) -> dict:
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
    return _fetch_weather(lat=lat, lon=lon, city='Your Location', country='')


def _fetch_weather(lat: float, lon: float, city: str, country: str) -> dict:
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
