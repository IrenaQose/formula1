FROM node:20-alpine

WORKDIR /app

# Install postgres client for wait script
RUN apk add --no-cache postgresql-client

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# RUN npm run migration:run

# Make the wait script executable
RUN chmod +x wait-for-postgres.sh

EXPOSE 3000

CMD ["npm", "run", "start"] 