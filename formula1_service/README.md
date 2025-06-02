# Formula 1 Service

A NestJS service that provides Formula 1 data, including seasons, races, drivers, constructors, and results.

## Features

- Fetches and stores Formula 1 data from the Ergast API
- Provides RESTful endpoints for accessing Formula 1 data
- Supports data import for specific seasons
- Includes comprehensive API documentation via Swagger

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy the example environment file
cp .env.example .env

# Update the environment variables in .env
```

## Database Setup

```bash
# Run migrations
npm run migration:run

# Seed the database with initial data (optional)
npm run seed
```

## Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

The service includes interactive API documentation powered by Swagger. Once the service is running, you can access the documentation at:

```
http://localhost:3000/api
```

### Available API Endpoints

The Swagger UI provides detailed documentation for all available endpoints, including:

- **Seasons**
  - `GET /seasons` - List all seasons
  - `GET /seasons/champions` - Get seasons with their champions

- **Races**
  - `GET /races` - List all races
  - `GET /races/:year` - Get races for a specific year
  - `POST /races/import/:year` - Import races for a year

- **Drivers**
  - `GET /drivers` - List all drivers
  - `POST /drivers/import/:year` - Import drivers for a year

- **Constructors**
  - `GET /constructors` - List all constructor teams
  - `POST /constructors/import/:year` - Import constructors for a year

### Features of the Swagger Documentation

- Interactive API testing
- Request/response schemas
- Authentication requirements (if any)
- Example requests and responses
- Model definitions
- Query parameter descriptions

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Pre setup
Install node version 20.x.x

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```



