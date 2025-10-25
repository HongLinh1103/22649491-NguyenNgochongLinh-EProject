FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production || npm install
COPY . .
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "index.js"]
