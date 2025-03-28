FROM node:18.20-alpine3.19 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build