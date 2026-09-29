# Artem — AI-Powered Interview Preparation Platform

Artem is a full-stack web application designed to help candidates prepare for technical interviews. It combines AI-powered interview simulation, a LeetCode-style coding workspace, resume analysis, a question bank, and personalized progress tracking into a single platform.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Frontend Architecture](#frontend-architecture)
- [Scripts](#scripts)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **React Router 6** | Client-side routing |
| **TanStack React Query** | Server state management & data fetching |
| **Zustand** | Client state management (auth, theme) |
| **Monaco Editor** | Code editor (VS Code engine) |
| **Recharts** | Data visualization & charts |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 4** | REST API server |
| **TypeScript** | Type safety |
| **MongoDB + Mongoose 8** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication via httpOnly cookies |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling (resume upload) |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin resource sharing |
| **express-rate-limit** | API rate limiting |
| **Zod** | Schema validation |
| **Nodemailer** | Email delivery (password reset, verification) |

### Testing
| Technology | Purpose |
|---|---|
| **Vitest** | Test runner (both frontend & backend) |
| **Testing Library** | React component testing |
| **Supertest** | HTTP endpoint testing |
| **mongodb-memory-server** | In-memory MongoDB for test isolation |

---

## Project Structure

```
Artem/
├── BackEnd/                        # Express.js REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts            # App configuration (env vars)
│   │   │   └── database.ts         # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT authentication middleware
│   │   │   ├── errorHandler.ts     # Global error & 404 handlers
│   │   │   └── upload.ts           # Multer file upload (PDF/DOC/DOCX, 5MB)
│   │   ├── models/
│   │   │   └── index.ts            # All Mongoose models (User, Resume, Interview, etc.)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # Register, login, logout, session check
│   │   │   ├── user.routes.ts      # Profile CRUD
│   │   │   ├── interview.routes.ts # AI interview sessions
│   │   │   ├── resume.routes.ts    # Resume upload, analysis, delete
│   │   │   ├── coding.routes.ts    # Coding problems & submissions
│   │   │   ├── question.routes.ts  # Question bank CRUD
│   │   │   └── progress.routes.ts  # Progress tracking & analytics
│   │   ├── app.ts                  # Express app setup (middleware, routes)
│   │   ├── server.ts               # Entry point — starts server
│   │   └── seed.ts                 # Database seeder (questions + coding problems)
│   ├── tests/
│   │   ├── setup.ts                # Test setup (in-memory MongoDB)
│   │   ├── interview.routes.test.ts
│   │   ├── progress.routes.test.ts
│   │   └── question.routes.test.ts
│   ├── uploads/                    # Uploaded resume files (gitignored)
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── FrontEnd/                       # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx   # Main app shell (sidebar + topbar + content)
│   │   │   │   ├── Sidebar.tsx     # Navigation sidebar (collapsible)
│   │   │   │   └── TopBar.tsx      # Top bar (search, theme toggle, notifications)
│   │   │   └── ui/
│   │   │       ├── Badge.tsx       # Badge, DifficultyBadge, AIBadge
│   │   │       ├── Button.tsx      # Button with variants, loading, icons
│   │   │       ├── Card.tsx        # Card, CardHeader, CardTitle
│   │   │       ├── Input.tsx       # Form inputs
│   │   │       ├── Modal.tsx       # Modal dialog
│   │   │       ├── ProgressBar.tsx # Linear + Circular progress indicators
│   │   │       ├── Skeleton.tsx    # Loading skeleton placeholders
│   │   │       ├── StateDisplay.tsx# EmptyState, ErrorState, LoadingState, ScoreCard
│   │   │       ├── Tabs.tsx        # Tabs + Dropdown components
│   │   │       └── Toast.tsx       # Toast notifications
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance (baseURL, interceptors)
│   │   │   ├── mockData.ts         # Mock data for UI development
│   │   │   └── utils.ts            # Utility functions (cn, formatDate, etc.)
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx       # Login page
│   │   │   │   ├── Register.tsx    # Registration page
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   └── VerifyEmail.tsx
│   │   │   ├── Dashboard.tsx       # Main dashboard with stats & charts
│   │   │   ├── Practice.tsx        # Practice categories
│   │   │   ├── AIInterview.tsx     # AI-powered mock interview
│   │   │   ├── Coding.tsx          # LeetCode-style coding workspace
│   │   │   ├── ResumeAnalyzer.tsx  # Resume upload & AI analysis
│   │   │   ├── QuestionBank.tsx    # Searchable question bank
│   │   │   ├── Progress.tsx        # Progress analytics & charts
│   │   │   ├── Roadmap.tsx         # Personalized learning roadmap
│   │   │   └── Profile.tsx         # User profile settings
│   │   ├── stores/
│   │   │   ├── authStore.ts        # Auth state (Zustand)
│   │   │   └── themeStore.ts       # Theme state — light/dark (Zustand)
│   │   ├── App.tsx                 # Root component — routing & auth guards
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Artem design tokens + base styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts          # Custom Tailwind theme (colors, typography, etc.)
│   ├── tsconfig.json
│   ├── vite.config.ts              # Vite config (aliases, proxy)
│   └── vitest.config.ts
│
├── Project Documents/              # Design docs, wireframes, planning
├── .gitignore
└── README.md                       # ← You are here
```

---

## Features

### 🏠 Dashboard
- Readiness score with circular progress
- Weekly performance chart (Recharts)
- Skill radar visualization
- AI-powered recommendations
- Recent activity feed
- Goal tracking

### 🤖 AI Interview
- Real-time AI-powered mock interviews
- Multiple interview types: Technical, HR, Behavioral, System Design, Resume-Based, Company-Specific
- Difficulty levels: Beginner, Intermediate, Advanced
- Per-dimension scoring (Technical, Communication, Problem Solving, etc.)
- AI-generated follow-up questions
- Session history with feedback

### 💻 Coding (LeetCode-Style)
- Problem list with search, difficulty filter, and category filter
- Split-pane workspace: problem description + code editor
- **Monaco Editor** with syntax highlighting, bracket matching, autocomplete
- Language support: JavaScript, Python, Java, C++
- Resizable panels with drag handle
- Test case viewer and result panel
- Code submission with status tracking
- Starter code templates per language

### 📄 Resume Analyzer
- Drag-and-drop file upload (PDF, DOC, DOCX — 5 MB max)
- Upload progress indicator
- AI-powered analysis (pluggable — currently mock, ready for OpenAI/Gemini integration)
- Resume Score + ATS Compatibility Score
- Detected skills & missing skills identification
- Weak description detection with AI improvement suggestions
- Grammar issue count
- Resume-based interview question generation
- Upload history with download & delete

### 📚 Question Bank
- 12+ seeded questions across 6 categories
- Categories: DSA, Web Development, System Design, DBMS, OOP, HR & Behavioral
- Difficulty filtering (Easy, Medium, Hard)
- Company tags (Amazon, Google, Meta, Microsoft, etc.)
- Search by title, topic, or tags

### 📊 Progress Tracking
- Per-topic performance breakdown
- Weekly trend charts
- Questions attempted vs. correct
- Interview score history
- Coding submission analytics

### 🗺️ Roadmap
- AI-generated personalized learning path
- Priority-ordered tasks based on weak areas
- Task completion tracking
- Category grouping (DSA, System Design, HR)

### 👤 Profile
- User profile management
- Target role & experience level
- Profile image support

### 🔐 Authentication
- JWT-based auth with httpOnly cookies
- Register, login, logout
- Session persistence (auto-check on app load)
- Password reset via email
- Email verification
- Protected routes with auth guards
- Guest-only routes (login/register redirect if already authenticated)

### 🎨 Design System
- **Dual theme**: Light & Dark mode with smooth transitions
- Custom design tokens via CSS variables
- Typography scale: Display → Caption (Inter font)
- Component library: Badge, Button, Card, Input, Modal, ProgressBar, Skeleton, Tabs, Toast
- AI-branded cards with glow effects
- Responsive layout with collapsible sidebar
- Micro-animations (fade, slide, scale, shimmer)

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **npm** (comes with Node.js)

### 1. Clone the repository
```bash
git clone <repo-url>
cd Artem
```

### 2. Set up the backend
```bash
cd BackEnd
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
```

### 3. Seed the database
```bash
npm run seed
```
This populates the database with sample questions and coding problems.

### 4. Start the backend server
```bash
npm run dev
```
Server starts at `http://localhost:5000`.

### 5. Set up the frontend
```bash
cd ../FrontEnd
npm install
```

### 6. Start the frontend dev server
```bash
npm run dev
```
App opens at `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` requests to the backend.

---

## Environment Variables

Create a `.env` file in the `BackEnd/` directory. See [`.env.example`](BackEnd/.env.example) for the full template.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/artem` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | `dev-secret-change-in-production` | Secret for signing JWTs |
| `JWT_EXPIRY` | No | `7d` | JWT token expiration |
| `AI_PROVIDER` | No | `openai` | AI service to use |
| `OPENAI_API_KEY` | No | — | OpenAI API key |
| `GROQ_API_KEY` | No | — | Groq API key |
| `GEMINI_API_KEY` | No | — | Google Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `EMAIL_HOST` | No | — | SMTP host |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_USER` | No | — | SMTP username |
| `EMAIL_PASSWORD` | No | — | SMTP password |
| `CODE_EXECUTOR_URL` | No | `http://localhost:5050` | Code execution service URL |

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login (sets httpOnly cookie) |
| POST | `/logout` | Yes | Logout (clears cookie) |
| GET | `/me` | Yes | Get current user |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get user profile |
| PUT | `/me` | Yes | Update profile |

### Interviews (`/api/interviews`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Create interview session |
| GET | `/` | Yes | List user's interviews |
| GET | `/:id` | Yes | Get interview detail |
| PUT | `/:id/answer` | Yes | Submit answer to a question |
| PUT | `/:id/complete` | Yes | Mark interview as complete |

### Resumes (`/api/resumes`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Yes | Upload resume (multipart/form-data, field: `resume`) |
| GET | `/` | Yes | List user's resumes |
| GET | `/:id` | Yes | Get resume detail |
| DELETE | `/:id` | Yes | Delete resume + file |

### Coding Problems (`/api/problems`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List problems (supports `?page`, `?category`, `?difficulty`) |
| GET | `/:id` | No | Get problem detail |
| POST | `/submissions` | Yes | Submit code solution |
| GET | `/submissions/:id` | Yes | Get submission result |

### Questions (`/api/questions`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List questions (supports filters) |
| GET | `/:id` | No | Get question detail |

### Progress (`/api/progress`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get progress summary |
| GET | `/analytics` | Yes | Get detailed analytics |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Unique, lowercase |
| `passwordHash` | String | bcrypt hashed, hidden from queries |
| `role` | Enum | `candidate` \| `admin` |
| `profileImage` | String | URL |
| `targetRole` | String | e.g., "Full Stack Developer" |
| `experienceLevel` | Enum | `Beginner` \| `Intermediate` \| `Advanced` |
| `isEmailVerified` | Boolean | Default: false |
| `resetPasswordToken` | String | For password reset |

### Resume
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Owner |
| `fileUrl` | String | Path to uploaded file |
| `fileName` | String | Original filename |
| `fileSize` | Number | Bytes |
| `skills` | [String] | Detected skills |
| `missingSkills` | [String] | Skills to add |
| `resumeScore` | Number | 0–100 |
| `atsScore` | Number | 0–100 |
| `weakDescriptions` | [{section, issue, suggestion}] | Improvement areas |
| `grammarIssues` | Number | Count |
| `suggestions` | [String] | AI improvement tips |
| `interviewQuestions` | [String] | Generated from resume |

### Interview
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Owner |
| `type` | Enum | Technical, HR, Behavioral, System Design, Resume Based, Company Specific |
| `difficulty` | Enum | Beginner, Intermediate, Advanced |
| `targetRole` | String | Target job role |
| `questions` | [Mixed] | AI-generated questions |
| `answers` | [Mixed] | User's answers |
| `score` | Mixed | Overall or per-dimension score |
| `feedback` | Mixed | AI feedback |
| `status` | Enum | `active` \| `completed` \| `abandoned` |

### CodingProblem
| Field | Type | Notes |
|---|---|---|
| `title` | String | Problem title |
| `description` | String | Full problem description |
| `difficulty` | Enum | Easy, Medium, Hard |
| `category` | String | e.g., Arrays, Stacks, Strings |
| `constraints` | [String] | Problem constraints |
| `examples` | [{input, output, explanation}] | Sample test cases |
| `testCases` | [Mixed] | Hidden from API queries |
| `solutions` | [Mixed] | Hidden from API queries |

### Submission
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Submitter |
| `problemId` | ObjectId → CodingProblem | Problem reference |
| `language` | Enum | C++, Java, Python, JavaScript |
| `code` | String | Submitted code |
| `status` | Enum | Accepted, Wrong Answer, Runtime Error, etc. |
| `runtime` | Number | Execution time (ms) |
| `memory` | Number | Memory usage (MB) |

### Question
| Field | Type | Notes |
|---|---|---|
| `title` | String | Question title |
| `description` | String | Full question text |
| `category` | String | DSA, Web Dev, System Design, DBMS, OOP, HR |
| `topic` | String | Sub-topic |
| `difficulty` | Enum | Easy, Medium, Hard |
| `answer` | String | Reference answer |
| `tags` | [String] | Searchable tags |
| `company` | String | Company association |

### Progress
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Owner |
| `topic` | String | Topic name |
| `questionsAttempted` | Number | Total attempts |
| `questionsCorrect` | Number | Correct answers |
| `averageScore` | Number | Running average |
| `lastPracticed` | Date | Last activity |

---

## Frontend Architecture

### Routing
All routes are lazy-loaded for code splitting:

| Path | Page | Auth |
|---|---|---|
| `/` | Dashboard | Protected |
| `/practice` | Practice Categories | Protected |
| `/ai-interview` | AI Interview | Protected |
| `/coding` | Coding Workspace | Protected |
| `/resume` | Resume Analyzer | Protected |
| `/questions` | Question Bank | Protected |
| `/progress` | Progress Analytics | Protected |
| `/roadmap` | Learning Roadmap | Protected |
| `/profile` | User Profile | Protected |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/forgot-password` | Forgot Password | Guest only |
| `/reset-password` | Reset Password | Guest only |
| `/verify-email` | Email Verification | Public |

### State Management
- **Server state**: TanStack React Query (caching, invalidation, refetching)
- **Auth state**: Zustand store (`authStore.ts`) — user, login, logout, session check
- **Theme state**: Zustand store (`themeStore.ts`) — light/dark toggle, persisted in localStorage

### Design Token System
CSS variables defined in `index.css`, mapped to Tailwind in `tailwind.config.ts`:
- **Surfaces**: `--background`, `--surface`, `--surface-soft`
- **Typography**: `--text-primary`, `--text-secondary`, `--text-muted`
- **Borders**: `--border`, `--border-strong`
- **Brand**: `--primary`, `--cyan`, `--purple`
- **Semantic**: `--success`, `--warning`, `--error`, `--info`
- **AI**: `--ai-bg`, `--ai-border`, `--ai-text`

Both light and dark themes are defined; switching is instant via `data-theme` attribute.

---

## Scripts

### Backend (`BackEnd/`)
```bash
npm run dev        # Start dev server with hot reload (tsx watch)
npm run build      # Compile TypeScript to dist/
npm run start      # Run production build
npm run seed       # Seed database with sample data
npm run test       # Run backend tests (Vitest)
npm run lint       # Lint source code
```

### Frontend (`FrontEnd/`)
```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run test       # Run frontend tests (Vitest)
npm run lint       # Lint source code
```

---

## License

This project is private and not licensed for public distribution.
