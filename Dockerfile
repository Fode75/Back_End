FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma db push && node src/index.js"]
