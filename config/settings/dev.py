from .base import *  # noqa

DEBUG = True

# Show SQL queries in development
LOGGING["loggers"]["django.db.backends"]["level"] = "DEBUG"  # type: ignore