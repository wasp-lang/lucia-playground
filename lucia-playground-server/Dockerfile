FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

COPY . /app

RUN npm install

RUN npx prisma generate

CMD ["npm", "start"]
