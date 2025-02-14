
FROM node:alpine AS build
WORKDIR /app

RUN apk add --no-cache ffmpeg \
  && npm install -g typescript


COPY package*.json ./
RUN npm install


COPY . .

COPY .env .env



RUN npx prisma generate


RUN npm run build


ENV NODE_ENV=production


EXPOSE 3000


CMD npx prisma migrate deploy && npm start