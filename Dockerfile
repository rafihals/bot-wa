# Multi-stage build for optimized image size
FROM node:20-alpine AS builder

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY src ./src
COPY examples ./examples
COPY user-response ./user-response

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built files from builder stage
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/examples ./examples
COPY user-response ./user-response
COPY public ./public

# Create directories for persistent data
RUN mkdir -p /app/state /app/auth_info_baileys /app/public

# Expose port for web interface
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start the bot
CMD ["node", "lib/index.js"]
