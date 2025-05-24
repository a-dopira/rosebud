# rosebud

rose management thing i built because i was tired of losing track of my garden treatments in random notebooks

## functionality

- jwt httponly authorization
- add/remove roses 
- track when you sprayed what pesticide/fungicide
- basic search/filter
- doesn't lose your data

## tech stuff

django api + react frontend. jwt auth with httponly cookies. sqlite by default but you can swap it.

tests managed with pytest

runs in docker with nginx doing the proxy dance.

## run it

### quick start

```bash
git clone this
cd rosebud
```

make a `.env` in `backrose/`:
```bash
SECRET_KEY=your-fancy-secret-key
DEBUG=False  
CORS_ALLOWED_ORIGINS=http://localhost:8000
CSRF_TRUSTED_ORIGINS=http://localhost:8000
```

```bash
docker-compose up --build
```

browse to localhost:8000

### manual install

backend:
```bash
cd backrose
python -m venv venv
source venv/bin/activate  # windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

frontend:
```bash
cd frontend
npm install && npm start
```

## api

```bash
POST /api/auth/login/     # login
POST /api/auth/logout/    # logout
GET  /api/roses/          # list roses
POST /api/roses/          # add rose
GET  /api/roses/{id}/     # get rose details
PUT  /api/roses/{id}/     # update rose
DELETE /api/roses/{id}/   # delete rose
```

standard rest api. auth tokens in httponly cookies with csrf protection.

## tests

```bash
cd backrose && pytest
```

covers auth + api endpoints + basic validation. not 100% coverage but the important stuff works.

## docker details

- nginx serves react build + proxies /api/ to django
- django runs the api
- sqlite file gets persisted in volume
- media files (rose photos) also persisted

nginx config handles the proxy headers properly for django's csrf/cors stuff.

## notes

- admin at /admin/ if you need it
- csrf cookies set to Strict (change to None if cross-domain)
- access tokens expire in 5min, refresh tokens in 10 days
- change the jwt settings in settings.py if needed

can be easily switched to work on your local machine
