# Payment System

A backend payment management system built with **Node.js (Express)**, **PostgreSQL**, and **Redis**.  
It supports user authentication, account management, and payment operations such as **deposit**, **withdraw**, and **transfer** between users.  
The project is containerized with **Docker** and follows a clean, layered architecture.

---

## Technologies Used

| Category | Technology |
|-----------|-------------|
| **Runtime** | Node.js (Express.js) |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Containerization** | Docker |
| **Validation** | Joi |
| **Environment Management** | dotenv |
| **HTTP Status Handling** | http-status-codes |
| **Authentication** | JWT |

---

## Start Application

```bash
# Copy environment variables file
cp .env.example .env

# Build and start all containers in the background
docker-compose up --build -d

# For regular startups (without rebuilding images), you can simply run:
docker-compose up -d
```

## Stop Application
```bash
# Stop application
docker-compose down
```