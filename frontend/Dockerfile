FROM node:18.20-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV REACT_APP_API_URL=/api/
ENV BUILD_PATH=/app/build

RUN npm run build