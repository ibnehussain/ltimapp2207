"""
app.py — Flask application factory for the Weather Dashboard backend.

Creates and configures the Flask app with CORS, caching, and blueprint
registration.  Run directly (``python app.py``) for local development; use
a WSGI server such as gunicorn for production.
"""

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
    """Create and configure the Flask application.

    Returns:
        Flask: A fully configured Flask application instance with CORS enabled
        for the ``/weather`` endpoint, in-memory response caching, and the
        weather blueprint registered.
    """
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
