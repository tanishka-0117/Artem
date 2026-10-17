# Artem

Artem is an AI-powered interview preparation and placement-readiness platform. It helps users understand their strengths, identify weaknesses, and improve through targeted practice.

## Features

- Personalized dashboard and progress tracking
- Practice questions and question bank
- AI-powered mock interviews
- Coding practice
- Resume analysis
- Learning roadmaps
- Authentication, email verification, and password recovery

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Zustand
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **AI and services:** OpenAI/Groq/Gemini providers, Nodemailer, Cloudinary

## Project structure

```text
Artem/
├── FrontEnd/   # React client application
└── BackEnd/    # Express API server
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB connection URI

## Getting started

### 1. Configure the backend

```powershell
cd BackEnd
Copy-Item .env.example .env
```

Update `BackEnd/.env` with at least a MongoDB URI and JWT secret. Configure an AI provider if you want to use AI interview or resume-analysis features. Do not commit `.env` or real credentials.

### 2. Install dependencies

```powershell
cd BackEnd
npm install

cd ..\FrontEnd
npm install
```

### 3. Start the development servers

In one terminal:

```powershell
cd BackEnd
npm run dev
```

In another terminal:

```powershell
cd FrontEnd
npm run dev
```

The frontend runs at [http://localhost:5173](http://localhost:5173) and proxies API requests to the backend at [http://localhost:5000](http://localhost:5000).

## Environment variables

The available backend variables are documented in [`BackEnd/.env.example`](./BackEnd/.env.example), including:

- Server and frontend URLs
- MongoDB connection details
- JWT configuration
- AI provider credentials
- Cloudinary file storage
- SMTP email settings
- Code execution service URL

## Available commands

### Frontend

Run these commands from `FrontEnd/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run frontend tests |

### Backend

Run these commands from `BackEnd/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode |
| `npm run build` | Compile the TypeScript backend |
| `npm start` | Start the compiled API |
| `npm run lint` | Run ESLint |
| `npm test` | Run backend tests |
| `npm run seed` | Seed the database with sample data |

## API health check

Once the backend is running, verify it is available with:

```text
GET http://localhost:5000/api/health
```

The endpoint returns a JSON response with `status: "ok"` when the server is healthy.
