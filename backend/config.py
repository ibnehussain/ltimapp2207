import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    CACHE_TYPE            = 'SimpleCache'
    CACHE_DEFAULT_TIMEOUT = 600   # 10 minutes
    DEBUG                 = os.environ.get('FLASK_ENV') == 'development'
