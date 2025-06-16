# Use a lightweight Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files for better Docker layer caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application (including tsconfig.json and src)
COPY . .

# Ensure TypeScript is available globally in container
RUN yarn add typescript --dev

# Build the TypeScript project
RUN yarn build

# Verify dist/ was created
RUN if [ ! -d "dist" ]; then echo "❌ Build failed: dist/ folder not found"; exit 1; fi

# Expose the application port
EXPOSE 9002

# Install PM2 to manage the Node process
RUN yarn global add pm2

# Copy the PM2 process file
COPY process.json .

# Start the app using PM2 runtime
CMD ["pm2-runtime", "process.json"]
