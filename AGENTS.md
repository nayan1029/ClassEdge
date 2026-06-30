# StudyAce Agent Instructions

StudyAce is a full-stack student productivity app with a React/Vite frontend and a Spring Boot backend. Use the existing project docs for feature-level detail: [Readme.md](Readme.md) and [backend/README.md](backend/README.md).

## Working rules

- Make small, focused changes that follow the current code style and folder structure.
- Prefer existing abstractions over new ones. On the frontend, reuse the shared HTTP client in [frontend/src/services/http.js](frontend/src/services/http.js) and theme state in [frontend/src/context/ThemeContext.jsx](frontend/src/context/ThemeContext.jsx).
- Keep the current route structure in [frontend/src/routes/AppRoutes.jsx](frontend/src/routes/AppRoutes.jsx) and the app entry in [frontend/src/App.jsx](frontend/src/App.jsx).
- Do not edit generated output in `frontend/target/` or `backend/target/`.
- Avoid introducing new state-management or data-fetching libraries unless the change clearly needs them.
- Treat the root README as descriptive, not authoritative, when it conflicts with the current dependencies or code.

## Frontend conventions

- Frontend code lives under `frontend/src/` and uses React, Vite, Tailwind, React Router, and a small set of shared components/services.
- Route-level lazy loading is already in place, so keep new screens lazy-loaded unless there is a strong reason not to.
- Token handling is centralized through `frontend/src/services/tokenService.js`; do not duplicate localStorage auth logic in feature code.
- Global styling starts in [frontend/src/index.css](frontend/src/index.css); preserve the existing Tailwind-first approach.

## Backend conventions

- Backend code lives under `backend/src/main/java/com/studyace/` and is organized by concern: `config`, `controller`, `dto`, `entity`, `exception`, `repository`, `security`, `service`, and `util`.
- The backend targets Java 21 and Spring Boot 3.3.x with Maven.
- Prefer the existing REST, security, and WebSocket configuration patterns already present in the backend package tree.

## Validation

- Frontend build check: `cd frontend && npm run build`
- Backend validation: `mvn -f backend/pom.xml clean verify`
- Backend run check: `mvn -f backend/pom.xml spring-boot:run`

## Good entry points

- Frontend bootstrap: [frontend/src/main.jsx](frontend/src/main.jsx)
- Frontend route shell: [frontend/src/routes/AppRoutes.jsx](frontend/src/routes/AppRoutes.jsx)
- Frontend API client: [frontend/src/services/http.js](frontend/src/services/http.js)
- Backend build file: [backend/pom.xml](backend/pom.xml)
