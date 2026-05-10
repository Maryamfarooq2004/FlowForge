FROM node:22-alpine
WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies to keep the image small
RUN npm prune --production

EXPOSE 5000
CMD ["node", "dist/server.js"]
