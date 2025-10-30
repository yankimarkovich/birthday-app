# Default Dockerfile - Uses Development Configuration
# 
# For development: docker build -f Dockerfile.dev
# For production:  docker build -f Dockerfile.prod
#
# This default file uses development setup for convenience

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "run", "dev"]