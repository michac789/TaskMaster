import os

from app import create_app


if __name__ == '__main__':
    DEBUG = os.environ.get('DEBUG', 1)
    PORT = os.environ.get('PORT', 8000)
    ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '0.0.0.0')
    PROD = os.environ.get('PROD', 0)
    
    app = create_app('prod' if PROD else 'dev')
    app.run(debug=DEBUG, port=PORT, host=ALLOWED_HOSTS)
