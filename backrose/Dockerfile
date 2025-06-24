FROM python:3.12-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backrose/ .

RUN chmod +x /app/entrypoint.sh

ENV PYTHONUNBUFFERED=1

CMD ["sh", "/app/entrypoint.sh"]