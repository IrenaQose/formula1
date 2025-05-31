FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Run migrations before starting the service
RUN npm run migration:run

EXPOSE 3000

CMD ["npm", "run", "start"] 