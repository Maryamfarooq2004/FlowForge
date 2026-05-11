# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# Stage 3: Production Image
FROM node:22-alpine
WORKDIR /app

# Copy backend dependencies and build
COPY server/package*.json ./
RUN npm ci --production
COPY --from=backend-builder /app/dist ./dist

# Copy frontend build to backend's public folder
COPY --from=frontend-builder /app/dist ./public

# Final environment settings
EXPOSE 5000
CMD ["node", "dist/server.js"]
