# Pehsaan — Minimal LinkedIn-like DBMS Project

Full-stack LinkedIn-style app built around your MySQL schema:
**MySQL** → **Node.js / Express REST API** → **React (Vite)** frontend.

## Features
- Sign up / log in (JWT auth, bcrypt-hashed passwords) — `Users`
- Profile with editable name, education history, work experience, and skills —
  `Education` + `Schools`, `Employment` + `Companies`, `Skills` + `UserSkills`
- Add a school/company by typing its name (created automatically if it doesn't exist yet)
- Create / delete posts, and a feed of your own + your accepted connections' posts — `Posts`
- Send / accept / reject connection requests, and browse your network — `UserConnections`
- Search people by name or username

This intentionally matches your schema as given — no likes/comments tables, since those weren't in it.

## Tech stack
- **Database**: MySQL
- **Backend**: Node.js, Express, mysql2, bcryptjs, jsonwebtoken
- **Frontend**: React 18 + Vite + React Router (no CSS framework, plain stylesheet)

## Project structure
```
pehsaan/
├── backend/
│   ├── server.js            # Express app entry point
│   ├── db.js                 # MySQL connection pool
│   ├── schema.sql            # Your schema, prefixed with a CREATE DATABASE
│   ├── .env.example
│   ├── middleware/auth.js    # JWT verification
│   └── routes/
│       ├── auth.js           # register, login
│       ├── users.js          # profile (joins education/employment/skills), search
│       ├── schools.js        # search/create schools
│       ├── companies.js      # search/create companies
│       ├── education.js      # add/remove your education entries
│       ├── employment.js     # add/remove your job entries
│       ├── skills.js         # search master list, attach/detach on your profile
│       ├── connections.js    # request/accept/reject, list, pending, status
│       └── posts.js          # feed, create, delete
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx            # routes
        ├── AuthContext.jsx    # logged-in user state
        ├── api.js             # fetch wrapper + JWT handling
        ├── index.css
        ├── components/
        │   ├── Navbar.jsx
        │   └── PostCard.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Feed.jsx
            ├── Network.jsx
            └── Profile.jsx
```

## Setup

### 1. Database
Make sure MySQL is running, then:
```bash
mysql -u root -p < backend/schema.sql
```
This creates `linkedin_db` and all eight tables from your schema.

### 2. Install dependencies

Run these commands from the project root (`pehsaan/`):

```bash
npm install --prefix backend
npm install --prefix frontend
npm install
```

These install the backend packages, frontend packages, and the root-level
launcher used to run both applications together.

### 3. Configure the backend

Create the backend environment file from its example:

**Windows (Command Prompt or PowerShell):**

```powershell
copy backend\.env.example backend\.env
```

**macOS/Linux:**

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and set `DB_PASSWORD` and a random `JWT_SECRET`.

### 4. Run the application
```bash
npm run dev
```
This starts both the backend API and the frontend together. The API runs at
`http://localhost:5000`, and the frontend opens at `http://localhost:5173`. It
talks to the API at `http://localhost:5000/api` (see `API_BASE` at the top of
`frontend/src/api.js` if you need to change that).

## Schema notes
- `Users.password` stores a bcrypt hash, not plaintext.
- `UserConnections` is a single directed row per request (`user_id` = requester, `connection_id` = receiver). Accepting/rejecting updates that row's `status` rather than inserting a second one; the app queries both directions when listing a user's connections.
- Adding an education or employment entry looks up `Schools`/`Companies` by exact name first and only inserts a new row if there's no match, so you don't get duplicate schools/companies from typos-free re-entry.

## Ideas for extending it
- Add a `Likes` / `Comments` table if you want that back — the old vanilla-JS version had both.
- Add pagination to the feed (`LIMIT`/`OFFSET`) as post volume grows.
- Swap JWT-in-localStorage for httpOnly cookies for stronger XSS protection in production.
- Add a proper autocomplete dropdown for school/company name instead of free-text + exact-match lookup.
