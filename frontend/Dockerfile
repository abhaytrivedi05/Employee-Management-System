# Use an official Node.js image to build the application
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Accept build argument for API URL
ARG REACT_APP_API_URL=http://localhost:8080/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY src ./src
COPY public ./public

# Build the application
RUN npm run build

# Use an official Nginx image to serve the application
FROM nginx:alpine

# Copy the build artifacts from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the default port for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
