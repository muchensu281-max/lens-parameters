FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4173
ENV DATA_DIR=/data

RUN mkdir -p /data

EXPOSE 4173

CMD ["node", "server.js"]
