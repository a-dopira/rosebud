cd frontend
start /min cmd /k "npm start"

cd ../backend
call .venv\Scripts\activate
cd backrose
start /min cmd /k "python manage.py runserver"
