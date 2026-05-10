FROM node:22-alpine
WORKDIR /app

# The context is the repository root, so we must point to the server/ directory
COPY server/package*.json ./

# Install ALL dependencies (including devDependencies like tsc)
RUN npm ci

# Copy the rest of the backend code
COPY server/ .

# Run the backend build
RUN npm run build

# Remove devDependencies for production
RUN npm prune --production

EXPOSE 5000
CMD ["node", "dist/server.js"]
