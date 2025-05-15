# -------- Stage 1: Builder --------
    FROM node:20-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Install dependencies
    COPY package.json yarn.lock ./
    RUN yarn install --frozen-lockfile
    
    # Copy the rest of the source code
    COPY . .
    
    # Build the TypeScript project
    RUN yarn build
    
    # -------- Stage 2: Production --------
    FROM node:20-alpine
    
    # Set working directory
    WORKDIR /app
    
    # Copy only the production dependencies
    COPY package.json yarn.lock ./
    RUN yarn install --frozen-lockfile --production
    
    # Copy the compiled output from the builder stage
    COPY --from=builder /app/dist ./dist
    
    # Expose the application port
    EXPOSE 9002
    
    # Start the application
    CMD ["node", "dist/index.js"]
    