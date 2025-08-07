# Use the official Node.js image as the base image
FROM node:20-alpine

# Install PM2 globally
RUN npm install -g pm2

# Optional: Set PM2 key metrics environment variables
ENV PM2_PUBLIC_KEY=tlgfd06ksdbv7s6
ENV PM2_SECRET_KEY=k4p0r7198v3bx13

# Create and set the working directory for the application
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package*.json ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose the port the app runs on
EXPOSE 9000

# Run the app using PM2 (in production mode)
CMD ["pm2-runtime", "dist/app.js"]
