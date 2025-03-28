FROM python:3.10

WORKDIR /app

# Копирование requirements.txt из корня проекта
COPY requirements.txt .

# Установка зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода backrose
COPY backrose/ ./backrose/

# Копирование entrypoint.sh
COPY backrose/entrypoint.sh ./backrose/entrypoint.sh

# Создание директорий для медиа и статических файлов
RUN mkdir -p /app/media
RUN mkdir -p /app/staticfiles

# Установка прав на выполнение
RUN chmod +x /app/backrose/entrypoint.sh

ENV PYTHONUNBUFFERED=1

# Запуск через entrypoint.sh
CMD ["sh", "/app/backrose/entrypoint.sh"]