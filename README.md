# Task Manager App

A full-stack task management application with a Kanban-style board (Todo / In Progress / Done), JWT authentication, and a clean responsive UI.

---

## Live Demo

| Layer    | URL                                      |
|----------|------------------------------------------|
| Frontend | *(deploy to Vercel — link after deploy)* |
| Backend  | *(deploy to Render — link after deploy)* |

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

- **Auth** — Register, Login, Logout with JWT (access + refresh tokens)
- **Protected routes** — Unauthenticated users are redirected to `/login`
- **Silent token refresh** — Axios interceptor automatically refreshes expired access tokens
- **Task CRUD** — Create, read, update, delete tasks
- **Kanban board** — Three columns: Todo, In Progress, Done
- **Per-user isolation** — Each user only sees their own tasks
- **Loading & error states** — Skeleton loaders, inline error banners, delete confirmation
- **Responsive** — Works on mobile, tablet, and desktop

---

## Project Structure

```
Task_Manager_App/
├── backend/
│   ├── taskmanager/          # Django project (settings, urls, wsgi)
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                # Registration + JWT login endpoints
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── tasks/                # Task CRUD endpoints
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh              # Render build script
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── TaskForm.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    └── .env.example
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
git clone https://github.com/your-username/task-manager-app.git
cd task-manager-app
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

**Create the PostgreSQL database:**

```sql
CREATE DATABASE taskmanager_db;
```

**Configure environment variables:**

```bash
cp .env.example .env
# Edit .env with your DB credentials and a strong SECRET_KEY
```

**.env example:**

```
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

**Run migrations and start the server:**

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin
python manage.py runserver
```

Backend runs at `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# .env already points to http://localhost:8000/api for local dev
```

**Start the dev server:**

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

> The Vite dev server proxies `/api` requests to `http://localhost:8000`, so no CORS issues during development.

---

## API Documentation

All task endpoints require the `Authorization: Bearer <access_token>` header.

### Auth Endpoints

| Method | Endpoint            | Auth | Description                          |
|--------|---------------------|------|--------------------------------------|
| POST   | `/api/register/`    | No   | Register a new user                  |
| POST   | `/api/login/`       | No   | Login — returns access + refresh JWT |
| POST   | `/api/token/refresh/` | No | Refresh access token                 |
| GET    | `/api/me/`          | Yes  | Get current user profile             |

**Register request body:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "securepass123",
  "password2": "securepass123"
}
```

**Register / Login response:**
```json
{
  "user": { "id": 1, "username": "john", "email": "john@example.com" },
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

---

### Project Endpoints

| Method | Endpoint              | Description                           |
|--------|-----------------------|---------------------------------------|
| GET    | `/api/projects/`      | List all projects for the user        |
| POST   | `/api/projects/`      | Create a new project                  |
| GET    | `/api/projects/<id>/` | Get one project (includes task stats) |
| PUT    | `/api/projects/<id>/` | Update a project (partial OK)         |
| DELETE | `/api/projects/<id>/` | Delete a project                      |

---

### Task Endpoints (Nested Under Project)

| Method | Endpoint           | Description                  |
|--------|--------------------|------------------------------|
| GET    | `/api/projects/<project_id>/tasks/` | List all tasks for a project |
| POST   | `/api/projects/<project_id>/tasks/` | Create a new task in project |
| PUT    | `/api/projects/<project_id>/tasks/<id>/` | Update a task (partial OK) |
| DELETE | `/api/projects/<project_id>/tasks/<id>/` | Delete a task |

**Task object:**
```json
{
  "id": 1,
  "title": "Design the homepage",
  "description": "Create wireframes and mockups",
  "stage": "In Progress",
  "user": "john",
  "created_at": "2026-05-29T10:00:00Z",
  "updated_at": "2026-05-29T11:30:00Z"
}
```

**Valid stage values:** `"To Do"` | `"In Progress"` | `"Done"`
**Valid priority values:** `"Low"` | `"Medium"` | `"High"` | `"Critical"`

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
   ```
5. Click **Deploy**.

The `vercel.json` file handles SPA routing (all paths → `index.html`).

---

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `./build.sh`
4. Set **Start Command** to `gunicorn taskmanager.wsgi:application`
5. Add environment variables:

   | Key                    | Value                                      |
   |------------------------|--------------------------------------------|
   | `SECRET_KEY`           | A long random string                       |
   | `DEBUG`                | `False`                                    |
   | `DATABASE_URL`         | Render PostgreSQL connection string        |
   | `ALLOWED_HOSTS`        | `your-app.onrender.com`                    |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app`              |

6. Add a **PostgreSQL** database from the Render dashboard and copy the **Internal Database URL** into `DATABASE_URL`.

---

## Assumptions & Trade-offs

### Assumptions

- **Single-user task ownership** — tasks are private per user; no sharing or team features.
- **No email verification** — registration is immediate to keep the scope simple.
- **Flat stage model** — stages are a fixed enum (`To Do`, `In Progress`, `Done`) rather than user-defined labels.
- **Optimistic UI is not used** — all mutations wait for the server response before updating state, which is safer and simpler.

### Trade-offs

| Decision | Rationale |
|----------|-----------|
| JWT in `localStorage` | Simple to implement; acceptable for this scope. In a higher-security context, `httpOnly` cookies would be preferred to mitigate XSS risk. |
| No drag-and-drop | Keeps the UI simple and accessible. Stage can be changed via the Edit modal. |
| `partial=True` on PUT | Allows updating a single field (e.g., just the stage) without sending the full object, making the frontend simpler. |
| WhiteNoise for static files | Avoids needing a separate CDN/S3 bucket for a small project. |
| No pagination | Task lists are expected to be small per user for this assignment scope. |
| Django built-in `User` model | Sufficient for the requirements; avoids the complexity of a custom user model. |

---

## Environment Variables Reference

### Backend (`.env`)

| Variable               | Required | Description                          |
|------------------------|----------|--------------------------------------|
| `SECRET_KEY`           | Yes      | Django secret key                    |
| `DEBUG`                | Yes      | `True` for dev, `False` for prod     |
| `DATABASE_URL`         | No*      | Full DB URL (used on Render)         |
| `DB_NAME`              | No*      | PostgreSQL database name             |
| `DB_USER`              | No*      | PostgreSQL user                      |
| `DB_PASSWORD`          | No*      | PostgreSQL password                  |
| `DB_HOST`              | No*      | PostgreSQL host                      |
| `DB_PORT`              | No*      | PostgreSQL port (default 5432)       |
| `ALLOWED_HOSTS`        | Yes      | Comma-separated allowed hostnames    |
| `CORS_ALLOWED_ORIGINS` | Yes      | Comma-separated frontend origins     |

*Either `DATABASE_URL` or the individual `DB_*` variables are required.

### Frontend (`.env`)

| Variable             | Required | Description                    |
|----------------------|----------|--------------------------------|
| `VITE_API_BASE_URL`  | Yes      | Full URL to the backend `/api` |

---

## License

MIT
