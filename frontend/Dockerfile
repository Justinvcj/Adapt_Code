FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Start the application
CMD ["npm", "start"]
