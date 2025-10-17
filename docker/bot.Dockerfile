# Build stage
FROM node:18-alpine as builder

WORKDIR /bot

# Copy package files first to leverage Docker cache
COPY bot/package*.json ./

RUN npm install typescript @types/node ts-node discord.js kafkajs dotenv @types/kafkajs

# Create tsconfig.json
COPY bot/tsconfig.json ./

# Copy the entire bot directory
COPY bot/ ./
COPY docker/.docker.env ./.env

# Build TypeScript code
RUN npx tsc

# Production stage
FROM node:18-alpine

WORKDIR /bot

# Copy package files
COPY --from=builder /bot/package*.json ./

# Install production dependencies only
RUN npm install --only=production \
    retry-ts

# Copy built files and env
COPY --from=builder /bot/dist ./dist
COPY --from=builder /bot/.env ./.env

# Add startup script
COPY docker/wait-for-kafka.sh ./
RUN chmod +x wait-for-kafka.sh

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Use the wait script as entrypoint
ENTRYPOINT ["./wait-for-kafka.sh"]
CMD ["node", "dist/index.js"]