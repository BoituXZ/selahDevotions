# backend/Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# 1. Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# 2. Copy source code
COPY src ./src
COPY tsconfig.json .

# 3. Environment setup
ENV NODE_ENV=production
ENV PORT=8080

# 4. Start command
EXPOSE 8080
CMD ["bun", "run", "src/index.ts"]