FROM node:20.9.0-alpine3.18 AS builder

WORKDIR /root/build

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY libs/types/package.json libs/types/

RUN npm install

ARG VITE_FIREBASE_CONFIG
ARG VITE_API_URL
ARG VITE_MAPBOX_TOKEN

COPY apps/web/index.html apps/web/tsconfig.app.json apps/web/tsconfig.json apps/web/tsconfig.node.json apps/web/vite.config.ts apps/web/
COPY apps/web/src apps/web/src/
COPY apps/web/public apps/web/public/

COPY apps/server/tsconfig.json apps/server/
COPY apps/server/src apps/server/src/

COPY libs/types/tsconfig.json libs/types/
COPY libs/types/src libs/types/src/

RUN npm run -w apps/web build
RUN npm run -w apps/server build

RUN cp -R apps/web/dist apps/server/public
RUN cp -R apps/web/public apps/server/public

EXPOSE 8080

CMD ["npm", "run", "-w", "apps/server", "start:prod"]