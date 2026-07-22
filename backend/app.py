import sys
import os

# Allow imports from backend/ folder
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from flask_caching import Cache
from config import Config
from routes.weather import weather_bp

cache = Cache()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS so the frontend (file:// or different port) can call this API
    CORS(app, resources={r'/weather': {'origins': '*'}})

    # Initialise cache
    cache.init_app(app)

    # Register blueprints
    app.register_blueprint(weather_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=Config.DEBUG, port=5000)
