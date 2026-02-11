FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration production

RUN npm install -g serve

EXPOSE 4200

CMD ["serve", "-s", "dist/app-orcafacil/browser", "-l", "4200"]
