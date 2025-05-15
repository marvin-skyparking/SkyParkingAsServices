# Use a lightweight Node image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy dependency files first (for better Docker cache)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the project files
COPY . .

# Build the TypeScript project
RUN yarn build

# Set the command to run the app
CMD ["node", "dist/server.js"]
