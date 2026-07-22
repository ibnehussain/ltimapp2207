from flask import Blueprint, jsonify, request
from services.weather_service import get_weather_by_city, get_weather_by_coords

weather_bp = Blueprint('weather', __name__)


@weather_bp.route('/weather')
def weather():
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
