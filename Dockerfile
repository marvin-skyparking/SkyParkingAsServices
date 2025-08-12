# Use the official Node.js image as the base image
FROM node:20-alpine

# Create and set the working directory for the application
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package*.json yarn.lock ./

# Install application dependencies
RUN yarn install

# Install PM2 globally
RUN yarn global add pm2

# Copy the rest of the application source code
COPY . .

# Copy New Relic configuration file
COPY newrelic.js ./newrelic.js

# Build the TypeScript code
RUN yarn build

# Expose the port the app runs on
EXPOSE 9002

# Set New Relic environment variables (replace with your values)
ENV NEW_RELIC_APP_NAME="IN-APP"
ENV NEW_RELIC_LICENSE_KEY="2efbafc35c0c43b5b53b1547a7f583b3FFFFNRAL"
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout


# Optional: PM2 Plus monitoring keys
ENV PM2_PUBLIC_KEY=tlgfd06ksdbv7s6
ENV PM2_SECRET_KEY=k4p0r7198v3bx13

# Start the application with Yarn
CMD ["yarn", "start"]
