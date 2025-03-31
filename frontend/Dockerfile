FROM node:18.20-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV BUILD_PATH=/app/build

RUN npm run build