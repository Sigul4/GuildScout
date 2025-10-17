FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files for the app directory
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY app/ .

# Copy prisma schema
COPY app/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000