#!/bin/sh

# if smth goes wrong, exit
set -e

until [ -f /app/frontend/build/index.html ]
do
  sleep 2
done

echo "Frontend is done"

python manage.py migrate --no-input

python manage.py collectstatic --clear --no-input

gunicorn backrose.wsgi:application --bind 0.0.0.0:8000 --workers 2