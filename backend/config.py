"""
config.py — Application configuration for the Weather Dashboard backend.

Settings are read from environment variables (populated via a ``.env`` file).
Import the ``Config`` class into ``create_app()`` to apply the settings to the
Flask instance.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Flask configuration loaded from environment variables.

    Attributes:
        CACHE_TYPE (str): Flask-Caching backend — ``'SimpleCache'`` uses an
            in-process dictionary, suitable for single-process deployments.
        CACHE_DEFAULT_TIMEOUT (int): Number of seconds a cached response is
            considered fresh (default: 600 s / 10 min).
        DEBUG (bool): Enables Flask's debug mode and auto-reloader when the
            ``FLASK_ENV`` environment variable is set to ``'development'``.
    """

    CACHE_TYPE            = 'SimpleCache'
    CACHE_DEFAULT_TIMEOUT = 600   # 10 minutes
    DEBUG                 = os.environ.get('FLASK_ENV') == 'development'
