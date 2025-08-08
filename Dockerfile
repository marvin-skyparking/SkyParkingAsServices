# Use the official Node.js image as the base image
FROM node:20-alpine

# Create and set the working directory for the application
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package*.json ./

# Install application dependencies
RUN yarn install

# Install PM2 globally
RUN yarn global add pm2

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose the port the app runs on
EXPOSE 9002

# Optional: PM2 Plus monitoring keys
# ENV PM2_PUBLIC_KEY tlgfd06ksdbv7s6
# ENV PM2_SECRET_KEY k4p0r7198v3bx13

# Run with PM2 in runtime mode (for Docker)
CMD ["pm2-runtime", "dist/index.js"]
