# rosebud

rose management website

## functionality

- jwt httponly authorization with csrf cookie
- add/remove roses and related stuff (fungi, pests, groups etc.)
- add a specific info for each rose (fungicides/pesticides, photos, videos etc.)
- basic search/filter

## tech stuff

- django rest framework
- react
- tailwind css
- docker + nginx + gunicorn
- pytest

django api + react frontend. jwt auth with httponly cookies. sqlite3 by default.

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
python -m venv .venv
source venv/bin/activate
pip install -r backrose/requirements.txt
```

env file is the same

frontend:

```bash
cd frontend
npm install && npm start
```

env_file:

```bash
BUILD_PATH=../backrose/frontend/build
```

## api

```bash
POST /api/auth/token/     # login
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

covers auth + api endpoints + basic validation

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
