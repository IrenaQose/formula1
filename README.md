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
This repository contains a Formula 1 application with three main components:

- **Frontend (FE)**: Web interface for interacting with F1 data.
- **Backend (BE)**: Handles logic to:
    - Query the Ergast API
    - Check for existing data in the DB
    - Store missing data
    - Stop service on any failure
- **Database (DB)**: PostgreSQL instance for storing F1-related data.

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


## API Documentation

The service includes interactive API documentation powered by Swagger. Once the service is running, you can access the documentation at:

```
http://localhost:3000/api
```


⚙️ Backend Behavior
On startup, the backend will:

- Run migration scripts to create tables and insert seasons from year 2005 until 2025.

- Read the data from json files (drivers, driver-standings, results, races, constructors), this way the initial data is loaded quicker

- Check if data already exists in the database.

- If not found, insert into the DB.

- This ensures full data consistency before exposing the application.

⚙️ Frontend Behavior
- On FE we will show a list of all the seasons from 2005 -current year

- On click of one season we will fetch the results of that season

- For the current year consistency with the recent races, the BE will fetch for us the current results from the Ergast api

- To improve: Once the current year results are fetched save on localstorage and next time we display those data in case ergast api takes long 

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




