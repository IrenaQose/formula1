# 🏎️ Formula 1 Application

## 📦 Architecture Overview

```
+-----------------------+
|      Docker Host      |
|  (Docker Compose)     |
+----------+------------+
           |
           v
+---------------------------+
|        Docker Network     |
+---------------------------+
     |        |        |
     v        v        v
+--------+ +--------+ +----------+
|   FE   | |   BE   | |   DB     |
| (UI)   | | Logic  | | PostgreSQL|
|        | |        | |          |
+--------+ +--------+ +----------+
               |
               v
         +------------+
         | Ergast API |
         | (External) |
         +------------+

```

### Components

- **Frontend (FE)**: Web interface for interacting with F1 data.
- **Backend (BE)**: Handles logic to:
    - Query the Ergast API
    - Check for existing data in the DB
    - Store missing data
    - Stop service on any failure
- **Database (DB)**: PostgreSQL instance for storing F1-related data.

This repository contains a Formula 1 application with three main components:
- PostgreSQL Database
- Backend Service
- Frontend Application

## 🚀 Setup instructions

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Running the project

1. Clone the repository:

```bash
    git clone https://github.com/IrenaQose/formula1
    cd formula1
```

2. To run the application on the root directory run: 

```bash
    docker compose up -d
```

3. The services will start in the following order:
  - Postgres
  - BE
  - FE

⚙️ Backend Behavior
On startup, the backend will:

- Attempt to fetch data from a list of required Ergast API endpoints.

- Check if data already exists in the database.

- If not found, insert into the DB.

- If any request fails, the service will terminate immediately.

- If any request fails with 429(too many requests), the service will retry the api call up to 5 times with an exponential delay

- This ensures full data consistency before exposing the application.

📁 Directory Structure

```
├── backend/
│   ├── Dockerfile
│   └── src/
├── frontend/
│   ├── Dockerfile
│   └── src/
├── docker-compose.yml
└── README.md

```

> ⚠️ **Warning:** The first time when running docker it will take around 5 -6 min. Keep an eye on the logs of the service if the api call to ergast has failed most probably due to too many requests.
> If so, run it again


