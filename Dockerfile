FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Run as the non-root `node` user; mounted volumes (e.g. the audit log) must be
# writable by uid 1000.
USER node
ENTRYPOINT ["node", "dist/index.js"]