#!/bin/sh

until [ -f /app/frontend/build/index.html ]
do
  echo "assembling frontend..."
  sleep 2
done

python manage.py collectstatic --clear --no-input

python manage.py runserver 0.0.0.0:8000