# ClassEdge

**An AI-powered Learning Management System** built for students, teachers, and administrators — featuring real-time collaboration, Gemini-driven AI tools, and a full classroom workflow, all shipped as a production-ready Docker Compose stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18, Vite, Tailwind CSS, React Router, TanStack Query |
| **Backend** | Spring Boot 3.3, Spring Security, Spring Data JPA, Spring WebSocket (STOMP) |
| **Database** | PostgreSQL (production) · H2 in-memory (local dev, zero config) |
| **Auth** | JWT + BCrypt · Google OAuth2 |
| **AI** | Google Gemini API (configurable Gemini / OpenAI provider) |
| **Deployment** | Docker Compose (3-service stack: Nginx · Spring Boot · PostgreSQL) |

---

## Features

### 🔐 Authentication & Security
- **JWT authentication** — stateless tokens with configurable expiry and refresh window
- **BCrypt password hashing** — no plaintext credentials stored at any point
- **Google OAuth2 sign-in** — one-click login via Google Cloud credentials; degrades gracefully if unconfigured
- **Email verification** — token-based flow on registration; SMTP-ready, logs links to console when SMTP is unset
- **Password reset** — secure time-limited reset links delivered by email

### 🎓 Role-Based Access (3 Roles)
| Role | Capabilities |
|---|---|
| **Student** | Join classes via code, submit assignments, view grades, use all AI tools, manage personal tasks/notes/timetable |
| **Teacher** | Create classes, post announcements, create/grade assignments, view roster & submission counts |
| **Admin** | Platform-wide oversight *(role enforced by Spring Security at the API layer)* |

### 🏫 Virtual Classrooms
- Create classes (name, subject, section) or **join via a unique 6-character class code**
- **Stream tab** — threaded announcements with Markdown rendering
- **Classwork tab** — teacher creates assignments with points and due dates; students see submission status and grade inline
- **People tab** — full roster with role badges
- Assignment detail page: students submit text answers; teachers see all submissions and grade with feedback
- Classroom operations: teachers create lesson plans, mark attendance, and review student leave requests
- Shared learning library: teachers upload materials and students read or download them
- Realtime classroom chat with persisted message history
- Fee records: students view assigned balances and admins manage fee records

### 🤖 AI Tools (Gemini / OpenAI)
| Tool | What it does |
|---|---|
| **Study Assistant** | Conversational AI chatbot for any study question; streaming responses |
| **Notes Summarizer** | Upload PDF or PPT → get a structured AI-generated summary |
| **Quiz Generator** | Specify a topic and question count → receive a complete quiz with answers |
| **AI Lesson Planner** | Draft lesson objectives and a teachable class plan, then review it before publishing |
The Study Assistant, Summarizer, Quiz Generator, and AI Lesson Planner use the configured provider, with local fallback behavior when a provider is unavailable.

### ✅ Task Manager
- Create tasks with a title and deadline
- Automatic **deadline urgency coloring** (green → amber → red based on days remaining)
- Persistent task list per user; real-time stats bar (Total / Pending / Completed)

### 📓 Notes
- Personal CRUD note-taking with rich text
- Each note persisted per user in PostgreSQL

### 🗓️ Smart Timetable Generator
- Input your subjects and preferred slots; the AI generates a weekly schedule
- Saved per user — survives page refresh

### 📊 Analytics Dashboard
- Live stats cards: **Tasks Done · Notes · Quiz Runs · Focus Hours**
- Weekly productivity bar chart
- Rotating daily flash cards (flip-to-reveal Q&A)
- Quick-action shortcuts to all major sections

### 👤 Profile
- View and update account details
- Role and authentication provider shown

---

## Running Locally

### Backend (zero-config — uses H2 in-memory DB)

```bash
cd backend
mvn -B -DskipTests package
java -jar target/*.jar
```

The API starts on `http://localhost:8080`. All features that don't need external credentials (auth, tasks, notes, classrooms, timetable) work immediately.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` if your backend isn't on the default port:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Optional Integrations

These features degrade gracefully — the app runs normally without them; only the specific feature stays inactive.

### AI features (Study Assistant, Summarizer, Quiz, Lesson Planner)

```
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
# — or —
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
```

These variables must be set in the environment of the **backend process** before Spring Boot starts. Spring Boot does not load a `.env` file automatically. In PowerShell, for example:

```powershell
$env:AI_PROVIDER = 'gemini'
$env:GEMINI_API_KEY = 'your_gemini_key'
mvn -f backend/pom.xml spring-boot:run
```

With an authenticated session, `GET http://localhost:8080/api/ai/status` reports the selected provider, model, and whether its key was loaded (it never returns the key). Gemini API errors are written to the backend log. Summarizer, quiz generation, and lesson-plan drafting use Gemini when configured; they otherwise report `provider: local-ai-fallback` in their response.

### Email (verification + password reset)

```
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_address@gmail.com
MAIL_PASSWORD=your_app_password
```

Without these, verification and reset links are printed to the backend console instead.

### Google OAuth2

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

Set the authorized redirect URI in Google Cloud Console to `<your-backend-url>/login/oauth2/code/google`. Without these, the "Continue with Google" button is hidden.

### Frontend origin (for email link generation)

```
FRONTEND_URL=http://localhost:5173
```

---

## Docker Compose Deployment

One command builds and starts all three services:

```bash
docker-compose up --build -d
```

| Service | Port | Description |
|---|---|---|
| `frontend` | `3000` | React SPA served by Nginx |
| `backend` | `8080` | Spring Boot REST + WebSocket API |
| `postgres` | `5432` | PostgreSQL 15 with persistent volume |

Pass secrets via environment variables or a `.env` file alongside `docker-compose.yml`:

```
DB_URL=jdbc:postgresql://postgres:5432/classedge
DB_USERNAME=root
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_key
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
MAIL_ENABLED=true
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

---

## Project Structure

```
ClassEdge/
├── frontend/          React + Vite SPA
│   └── src/
│       ├── api/       Feature-scoped Axios modules
│       ├── components/common/   Shared UI (Button, Card, Input, Loader…)
│       ├── context/   ThemeContext (dark / light)
│       ├── layouts/   MainLayout, ProtectedApp wrapper
│       ├── pages/     Route-level page components (lazy-loaded)
│       ├── routes/    AppRoutes.jsx
│       └── services/  http.js (Axios client), session.js (token handling)
├── backend/           Spring Boot REST + WebSocket API
│   └── src/main/java/com/classedge/
│       ├── config/    CORS, Security, WebSocket, OAuth2 config
│       ├── controller/  REST endpoints
│       ├── dto/       Request / Response objects
│       ├── entity/    JPA entities (User, Task, Note, Classroom…)
│       ├── repository/  Spring Data JPA repositories
│       ├── security/  JWT filter, OAuth2 handler, UserDetailsService
│       └── service/   Business logic (AI, Auth, Email, Tasks…)
└── scripts/           Local dev helper scripts
```

---

## API Reference

Interactive Swagger / OpenAPI docs available at `http://localhost:8080/swagger-ui.html` when the backend is running.

Key endpoint groups:

| Prefix | Description |
|---|---|
| `/api/auth/**` | Register, login, verify-email, forgot/reset-password |
| `/oauth2/authorization/google` | Google OAuth2 redirect |
| `/api/tasks` | Task CRUD |
| `/api/notes` | Notes CRUD |
| `/api/timetable` | Generate and fetch timetable |
| `/api/ai/**` | Study assistant, summarizer, AI provider status |
| `/api/quiz` | AI quiz generation |
| `/api/classrooms/**` | Classroom and membership management |
| `/api/classrooms/{id}/attendance` | Teacher attendance marking and student attendance view |
| `/api/classrooms/{id}/lesson-plans` | Teacher plans and class member reading |
| `/api/classrooms/{id}/messages` and `/ws/chat` | Persisted realtime classroom chat |
| `/api/library/modules` | Teacher module uploads and student downloads |
| `/api/school/leave-requests` | Student leave requests and class teacher review |
| `/api/school/fees` | Student fee view and admin fee management |
| `/api/classrooms/{id}/announcements` | Classroom stream |
| `/api/assignments/**` | Assignment and submission management |
| `/api/analytics/dashboard` | Dashboard stats |
