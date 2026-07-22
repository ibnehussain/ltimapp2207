# API Reference

The Weather Dashboard exposes a single REST endpoint served by the Flask backend.

---

## Base URL

```
http://127.0.0.1:5000
```

For production deployments, replace this with your Azure Web App URL.

---

## Endpoints

### `GET /weather`

Returns current weather conditions and a 5-day forecast for the requested
location.

#### Query Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `city`    | string | Optional | Name of the city to look up (max 100 characters). |
| `lat`     | float  | Optional | Latitude of the location (e.g. `51.5`). |
| `lon`     | float  | Optional | Longitude of the location (e.g. `-0.1`). |

Either `city` **or** both `lat` and `lon` must be provided.

#### Example Requests

```
GET /weather?city=London
GET /weather?city=New%20York
GET /weather?lat=51.5&lon=-0.1
```

#### Success Response — `200 OK`

```json
{
  "city": "London",
  "country": "GB",
  "temperature": 18.5,
  "feels_like": 17.2,
  "humidity": 72,
  "wind_speed": 5.1,
  "condition": "Partly Cloudy",
  "icon": "⛅",
  "forecast": [
    {
      "date": "2026-07-22",
      "high": 20.1,
      "low": 13.4,
      "condition": "Clear",
      "icon": "☀️"
    },
    {
      "date": "2026-07-23",
      "high": 19.0,
      "low": 12.8,
      "condition": "Overcast",
      "icon": "☁️"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `city` | string | Resolved city display name. |
| `country` | string | ISO 3166-1 alpha-2 country code (e.g. `"GB"`). Empty for coordinate lookups. |
| `temperature` | float | Current temperature in °C (1 decimal place). |
| `feels_like` | float | Apparent / "feels like" temperature in °C. |
| `humidity` | integer | Relative humidity in %. |
| `wind_speed` | float | Wind speed at 10 m altitude in m/s. |
| `condition` | string | Human-readable weather condition label. |
| `icon` | string | Emoji representing the current weather condition. |
| `forecast` | array | Up to 5 daily forecast objects (see below). |

#### Forecast Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date in `YYYY-MM-DD` format. |
| `high` | float | Daily maximum temperature in °C. |
| `low` | float | Daily minimum temperature in °C. |
| `condition` | string | Human-readable condition label. |
| `icon` | string | Emoji representing the daily condition. |

---

#### Error Responses

| HTTP Status | Condition | Example Body |
|-------------|-----------|--------------|
| `400 Bad Request` | Neither `city` nor `lat`/`lon` provided, or city name exceeds 100 characters. | `{"error": "Provide either city or lat & lon query parameters."}` |
| `404 Not Found` | City name could not be resolved by the geocoding API. | `{"error": "City not found."}` |
| `500 Internal Server Error` | Unexpected value or data error from the weather service. | `{"error": "<message>"}` |
| `503 Service Unavailable` | The upstream Open-Meteo API is unreachable or returned an error. | `{"error": "Weather service is unavailable. Please try again later."}` |

---

## WMO Weather Codes

The backend maps [WMO weather interpretation codes](https://open-meteo.com/en/docs) to human-readable labels and emojis.

| Code(s) | Condition | Icon |
|---------|-----------|------|
| 0 | Clear | ☀️ |
| 1 | Mainly Clear | 🌤️ |
| 2 | Partly Cloudy | ⛅ |
| 3 | Overcast | ☁️ |
| 45, 48 | Fog / Icy Fog | 🌫️ |
| 51, 53 | Light / Moderate Drizzle | 🌦️ |
| 55 | Heavy Drizzle | 🌧️ |
| 61, 63, 65 | Light / Moderate / Heavy Rain | 🌧️ |
| 71, 73, 75 | Light / Moderate / Heavy Snow | ❄️ |
| 77 | Snow Grains | 🌨️ |
| 80, 81 | Rain / Heavy Showers | 🌧️ |
| 82 | Violent Showers | ⛈️ |
| 85, 86 | Snow / Heavy Snow Showers | 🌨️ |
| 95, 96, 99 | Thunderstorm | ⛈️ |

---

## Upstream Services

The backend relies on two free, key-less Open-Meteo APIs:

| Service | URL |
|---------|-----|
| Geocoding | `https://geocoding-api.open-meteo.com/v1/search` |
| Weather forecast | `https://api.open-meteo.com/v1/forecast` |
