# Formula 1 Application

This repository contains a Formula 1 application with three main components:
- PostgreSQL Database
- Backend Service
- Frontend Application

## Run the application as a monorepo

1. Clone the repository:

```bash
    git clone <repository-url>
    cd formula1
```

2. On the docker-compose.yml, add the environment values:
For example:
    backend: 
        - DB_USERNAME= f1
        - DB_PASSWORD= f1
        - DB_DATABASE= f1

    postgres:
        - POSTGRES_USER: f1
        - POSTGRES_PASSWORD: f1
        - POSTGRES_DB: f1


3. To run the application on the root directory run: 

```bash
    docker compose up --build
```


## To run the applications as standalone

- Docker and Docker Compose
- Node.js (for frontend and backend services) - Node version 20.x.x or higher
- PostgreSQL client (optional, for direct database access)

### 1. Database Setup

The application uses PostgreSQL as its database. To start the database:

1. Navigate to the docker directory:
```bash
cd formula1_docker
```

2. Start the database container:
```bash
docker compose up -d
```


### 2. Backend Service Setup

The backend service is located in the `formula1_service` directory:

1. Navigate to the service directory:
```bash
cd formula1_service
```

2. Install dependencies:
```bash
npm install
```

3. Run the migratons to create the tables and instert the seasons
```bash
npm run migration:run 
```

4. Duplicate .env.example file and rename as .env 

5. Start the service:
```bash
npm start
```

The service will start on the default port (typically 3000).

### 3. Frontend Setup

The frontend application is located in the `formula1_frontend` directory:

1. Navigate to the frontend directory:
```bash
cd formula1_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:8080` (or the next available port if 8080 is in use).

## Development

- The database data is persisted in the `formula1_docker/data` directory
- The backend service provides the API endpoints for the frontend
- The frontend application provides the user interface

## Stopping the Application

1. To stop the frontend and backend services, press `Ctrl+C` in their respective terminal windows

2. To stop the database:
```bash
cd formula1_docker
docker-compose down
```

## Troubleshooting

- If the database fails to start, ensure no other service is using port 5432
- If the frontend or backend services fail to start, check if their respective ports are available
- For database connection issues, verify that the database container is running using `docker ps`

## Additional Information

- Database migrations and seed data are handled by the backend service
- The frontend application communicates with the backend service through REST API endpoints
- All components are configured to work together out of the box 


## Helper commands

docker compose down -v  # Clean up any existing containers and volumes
docker compose up -d --build  # Rebuild and start services
