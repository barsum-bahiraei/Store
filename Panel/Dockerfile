FROM node:24.21.0-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24.21.0-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24.21.0-alpine AS build-env
ARG VITE_API_BASE_URL
ARG VITE_MINIO_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_MINIO_BASE_URL=$VITE_MINIO_BASE_URL
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN test -n "$VITE_API_BASE_URL" \
    && test -n "$VITE_MINIO_BASE_URL" \
    && npm run build

FROM node:24.21.0-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env --chown=node:node /app/node_modules /app/node_modules
COPY --from=build-env --chown=node:node /app/build /app/build
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
EXPOSE 3000
USER node
CMD ["npm", "run", "start"]
