# ClassEdge Backend

ClassEdge backend provides secure REST APIs, JWT + Google OAuth2 authentication, core CRUD modules, analytics, and real AI-backed services (Gemini/OpenAI).

## Features

- JWT + Google OAuth2 auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/verify-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/oauth2/authorization/google`)
- Notes CRUD APIs (`/api/notes`)
- Task APIs (`/api/tasks`)
- Quiz + summarizer + assistant APIs backed by Gemini/OpenAI (`/api/quiz`, `/api/ai/*`)
- Dashboard analytics API (`/api/analytics/dashboard`)
- Timetable API, persisted per user (`/api/timetable`)
- Class lesson plans, attendance records, and role-checked classroom rosters
- Teacher-published learning library (`/api/library/modules`), read-only for students
- Authenticated, persisted realtime class chat (`/api/classrooms/{id}/messages`, `/ws/chat`)
- Student leave requests with teacher review and admin-managed fee records (`/api/school/**`)
- Gemini/OpenAI assistant, summarizer, and quiz generation (`/api/ai/**`, `/api/quiz/**`)
- Swagger/OpenAPI at `/swagger-ui.html`

## Tech Stack

- Java 21
- Spring Boot 3.3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- MySQL (Docker) / H2 (default local)
- Lombok
- Maven

## Run Locally

```bash
mvn -f backend/pom.xml clean verify
mvn -f backend/pom.xml spring-boot:run
```

## Deploy with Docker

This repository includes a `Dockerfile` and `docker-compose.yml` for generic containerized deployment.

### Required environment variables

- `DB_URL` with a JDBC PostgreSQL URL such as `jdbc:postgresql://postgres:5432/classedge`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS` with your frontend URL
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

### Docker notes

- The provided `docker-compose.yml` automatically starts a PostgreSQL database alongside the backend and frontend.
- Spring Boot connects to the postgres service automatically.

## Environment Variables

- `DB_URL`
- `DB_DRIVER`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`
