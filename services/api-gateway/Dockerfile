# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    pnpm install --frozen-lockfile; \
    else \
    npm ci; \
    fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install production dependencies only
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable && \
    pnpm install --frozen-lockfile --prod; \
    else \
    npm ci --only=production; \
    fi

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown -R node:node logs

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
