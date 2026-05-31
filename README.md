# Task Manager App

A full-stack task management application with a Kanban-style board (To Do / In Progress / Done), JWT authentication, and a clean responsive UI.

---

## Live Demo

| Layer    | URL                                |
|----------|------------------------------------|
| Frontend | https://project-flow-manager.vercel.app |
| Backend  | https://project-flow-manager.onrender.com |

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite, React Router v6, Axios, Tailwind CSS |
| Backend  | Django 4.2, Django REST Framework, SimpleJWT    |
| Database | PostgreSQL                                      |
| Hosting  | Vercel (frontend), Render (backend)             |

---

## Features

- Auth - Register, Login (email + password), Logout with JWT (access + refresh tokens)
- Protected routes - Unauthenticated users are redirected to `/login`
- Silent token refresh - Axios interceptor auto-refreshes expired access tokens
- Project management - Create, read, update, delete projects
- Task management - Nested task CRUD under project boards
- Kanban board - Three stages: To Do, In Progress, Done
- Task fields - Title, Description, Assignee (required), Priority, Due Date (required)
- Email rule - Registration accepts only lowercase Gmail addresses ending with `@gmail.com`
- Per-user isolation - Each user sees only their own data
- Loading and error states - Skeleton loaders, inline error banners, delete confirmation
- Responsive UI - Mobile, tablet, desktop support

---

## Project Structure

```text
Task_Manager_App/
|-- backend/
|   |-- taskmanager/          # Django project (settings, urls, wsgi)
|   |-- users/                # Registration, login, profile endpoints
|   |-- tasks/                # Project + nested task CRUD endpoints
|   |-- manage.py
|   |-- requirements.txt
|   `-- build.sh
`-- frontend/
    |-- src/
    |   |-- pages/
    |   |   |-- Login.jsx
    |   |   |-- Register.jsx
    |   |   |-- Home.jsx
    |   |   |-- ProjectBoard.jsx
    |   |   `-- Onboarding.jsx
    |   |-- components/
    |   |-- context/
    |   |-- routes/
    |   `-- services/
    |-- index.html
    |-- vite.config.js
    |-- tailwind.config.js
    `-- vercel.json
```

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Clone the repository

```bash
git clone https://github.com/ShreyasPreetham/project-flow-manager.git
cd project-flow-manager
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create the PostgreSQL database:

```sql
CREATE DATABASE taskmanager_db;
```

Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your DB credentials and SECRET_KEY
```

Example `.env`:

```env
SECRET_KEY=your-very-secret-key
DEBUG=True
DB_NAME=taskmanager_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Run migrations and start server:

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Documentation

All protected endpoints require:

`Authorization: Bearer <access_token>`

### Auth Endpoints

| Method | Endpoint             | Auth | Description |
|--------|----------------------|------|-------------|
| POST   | `/api/register/`     | No   | Register new user |
| POST   | `/api/login/`        | No   | Login with email + password |
| POST   | `/api/token/refresh/`| No   | Refresh access token |
| GET    | `/api/me/`           | Yes  | Current user profile |

Login request body:

```json
{
  "email": "john@gmail.com",
  "password": "securepass123"
}
```

Login/Register response:

```json
{
  "user": { "id": 1, "username": "john", "email": "john@gmail.com" },
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

### Project Endpoints

| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| GET    | `/api/projects/`       | List all projects for logged-in user |
| POST   | `/api/projects/`       | Create project |
| GET    | `/api/projects/<id>/`  | Retrieve project with stats |
| PUT    | `/api/projects/<id>/`  | Update project |
| DELETE | `/api/projects/<id>/`  | Delete project |

### Task Endpoints (Nested under Project)

| Method | Endpoint                                  | Description |
|--------|-------------------------------------------|-------------|
| GET    | `/api/projects/<project_id>/tasks/`       | List tasks in project |
| POST   | `/api/projects/<project_id>/tasks/`       | Create task in project |
| PUT    | `/api/projects/<project_id>/tasks/<id>/`  | Update task |
| DELETE | `/api/projects/<project_id>/tasks/<id>/`  | Delete task |

Task object example:

```json
{
  "id": 1,
  "title": "Design the homepage",
  "description": "Create wireframes and mockups",
  "assignee": "john@gmail.com",
  "stage": "In Progress",
  "priority": "Medium",
  "due_date": "2026-06-03",
  "user": "john",
  "created_at": "2026-05-29T10:00:00Z",
  "updated_at": "2026-05-29T11:30:00Z"
}
```

Valid values:

- Stage: `To Do` | `In Progress` | `Done`
- Priority: `Low` | `Medium` | `High` | `Critical`

Required task fields in current app flow:

- `title`
- `assignee`
- `stage`
- `priority`
- `due_date`

Email validation in current app flow:

- Must be a valid email format
- Domain must be exactly `gmail.com`
- Email is normalized to lowercase

---

## Deployment

### Frontend -> Vercel

1. Push repo to GitHub.
2. Create new Vercel project and import repo.
3. Set root directory to `frontend`.
4. Set env var:

```env
VITE_API_BASE_URL=https://project-flow-manager.onrender.com/api
```

### Backend -> Render

1. Create new web service from GitHub repo.
2. Set root directory to `backend`.
3. Build command: `./build.sh`
4. Start command: `gunicorn taskmanager.wsgi:application`
5. Add required env vars (`SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`).

---

## Assumptions and Trade-offs

- Single-user ownership model (no team-sharing workflow)
- Fixed stage enum instead of custom workflow columns
- JWT in `localStorage` for assignment simplicity
- No drag-and-drop to keep scope compact

---

## License

MIT
