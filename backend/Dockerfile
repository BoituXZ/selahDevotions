# backend/Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src ./src
COPY tsconfig.json .

# Set environment
ENV NODE_ENV=production
# Note: We removed ENV PORT=8080. We let Cloud Run inject it.

# Start command
CMD ["bun", "run", "src/index.ts"]