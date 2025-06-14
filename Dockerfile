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

# Expose the port the app runs on
EXPOSE 9002

# Install PM2 globally
RUN yarn global add pm2

# Copy PM2 process file
COPY process.json .

# Specify the command to run the application using pm2-runtime
CMD ["pm2-runtime", "process.json"]
