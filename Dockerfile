FROM node:22-alpine

WORKDIR /usr/kubek

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "app.js"]