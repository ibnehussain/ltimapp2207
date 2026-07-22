"""
routes/weather.py — Flask blueprint that exposes the ``GET /weather`` endpoint.

Accepts either a ``city`` query parameter or a ``lat``/``lon`` coordinate
pair, delegates the data retrieval to :mod:`services.weather_service`, and
returns the result as JSON.

Error responses
---------------
* **400** — Missing or invalid query parameters.
* **404** — City not found by the geocoding service.
* **500** — Unexpected value / data error from the weather service.
* **503** — The upstream weather service is unreachable or returned an error.
"""

from flask import Blueprint, jsonify, request
from services.weather_service import get_weather_by_city, get_weather_by_coords

weather_bp = Blueprint('weather', __name__)


@weather_bp.route('/weather')
def weather():
    """Return current weather and a 5-day forecast for the requested location.

    Query Parameters:
        city (str, optional): Name of the city to look up (max 100 characters).
        lat (float, optional): Latitude of the location.
        lon (float, optional): Longitude of the location.

    Either ``city`` **or** both ``lat`` and ``lon`` must be supplied.

    Returns:
        flask.Response: JSON object with weather data (HTTP 200) or an
        ``{"error": "<message>"}`` object with an appropriate HTTP error code.

    Example success response::

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
                {"date": "2026-07-24", "high": 20.1, "low": 13.4,
                 "condition": "Clear", "icon": "☀️"}
            ]
        }
    """
    city = request.args.get('city', '').strip()
    lat  = request.args.get('lat')
    lon  = request.args.get('lon')

    # ---- Input validation ----
    if not city and not (lat and lon):
        return jsonify({'error': 'Provide either city or lat & lon query parameters.'}), 400

    if city and len(city) > 100:
        return jsonify({'error': 'City name is too long.'}), 400

    try:
        if city:
            data = get_weather_by_city(city)
        else:
            data = get_weather_by_coords(float(lat), float(lon))

        return jsonify(data), 200

    except LookupError as e:
        return jsonify({'error': str(e)}), 404

    except ValueError as e:
        return jsonify({'error': str(e)}), 500

    except Exception:
        return jsonify({'error': 'Weather service is unavailable. Please try again later.'}), 503
