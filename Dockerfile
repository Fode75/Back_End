FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl python3 python3-pip && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY bot/requirements.txt bot/
RUN pip3 install --no-cache-dir -r bot/requirements.txt --break-system-packages
COPY . .
RUN npx prisma generate
ENV NODE_ENV=production
EXPOSE 3000
RUN chmod +x start.sh
CMD ["sh", "start.sh"]
