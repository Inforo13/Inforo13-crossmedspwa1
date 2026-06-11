# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Set building environments
ENV NODE_ENV=production

# Run the build script (runs vite build & compiles the Express server to dist/)
RUN npm run build

# Expose the production port
EXPOSE 8080

# Configure default PORT for Cloud Run compatibility
ENV PORT=8080

# Set execution command
CMD ["npm", "run", "start"]
