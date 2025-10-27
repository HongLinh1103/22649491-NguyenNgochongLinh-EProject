# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files trước để tối ưu cache
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port (phải trùng với PORT trong .env)
EXPOSE 3001

# Start service
CMD ["npm", "start"]
