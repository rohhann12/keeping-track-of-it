FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Install dev dependencies for building
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm install 
# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
