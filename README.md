# HackHub – Collaborative Hackathon Platform

HackHub is an all-in-one collaborative platform designed to help student teams organize, build, and pitch their hackathon projects efficiently. It brings together team coordination, task tracking, file sharing, real-time communication, and AI-powered startup pitch generation into a single glassmorphic workspace.

---

## 🌟 Key Features

- **🔐 User Authentication**: Secure registration and login using JWT tokens and bcrypt password hashing.
- **👥 Team Management**: Create teams, invite teammates with unique 8-character invite codes, and manage roles (Leader, Frontend, Backend, AI/ML).
- **📋 Kanban Task Board**: Organize project deliverables with a 3-column Kanban workflow (*To Do*, *In Progress*, *Done*).
- **⏱️ Hackathon Countdown Timer**: Live countdown widget with real-time percentage progress bar to keep teams on schedule.
- **📁 Team File Sharing**: Upload and download project documents, presentations, and design references scoped securely to your team via MongoDB GridFS.
- **🚀 AI Pitch Generator**: Turn rough bullet points into polished startup pitches and get instant AI recommendations powered by Google Gemini.
- **💬 Team Communication & Chat**: Central communication hub with conversation history and AI-driven discussion summarization.
- **📊 Progress Analytics**: Visual project completion analytics powered by Chart.js.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (v14 Page Router) & [React](https://react.dev/) 18
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom glassmorphism and animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **File Storage**: MongoDB GridFS via `multer`
- **Authentication**: JSON Web Tokens (JWT) & `bcrypt`

### AI & Microservices
- **Generative AI**: [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
- **Summarization Service**: Python Flask microservice using Hugging Face Transformers (`facebook/bart-large-cnn`)

---

## 📁 Project Structure

```text
HackHub---Hackathon-Platform/
├── ai-pitch/                 # Standalone Python scripts for pitch generation logic
│   ├── ai_assistant.py       # Execution plan generator
│   └── generate_pitch.py     # Pitch template formatter
├── ai-summarizer/            # Python Flask AI microservice
│   ├── app.py                # Flask server with BART summarization pipeline
│   └── requirements.txt      # Python dependencies (flask, torch, transformers)
├── backend/                  # Node.js & Express REST API
│   ├── config/               # Database connection configuration
│   ├── controllers/          # Business logic (auth, tasks, teams)
│   ├── middleware/           # JWT authentication middleware (protect)
│   ├── models/               # Mongoose schemas (User, Team, Task, Message)
│   ├── routes/               # API endpoints (auth, teams, tasks, files, gemini)
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express server entry point
├── components/               # Reusable React components
│   └── Layout.tsx            # App shell with responsive sidebar & user profile
├── context/                  # React Context providers
│   └── AppContext.tsx        # Global state (auth, timer, tasks, team)
├── pages/                    # Next.js Pages (Routes)
│   ├── _app.tsx              # App initialization & route protection
│   ├── _document.tsx         # HTML document & Google fonts configuration
│   ├── index.tsx             # Root redirect to /auth
│   ├── auth.tsx              # Login & Signup with animated visuals
│   ├── dashboard.tsx         # Hackathon overview, timer & progress chart
│   ├── tasks.tsx             # Interactive Kanban task board
│   ├── team.tsx              # Team roster, roles & invite code management
│   ├── team-setup.tsx        # Post-signup team creation wizard
│   ├── files.tsx             # GridFS file manager & reference links
│   ├── pitch.tsx             # AI-powered startup pitch generator
│   └── chat.tsx              # Team discussion room & AI chat summarizer
├── styles/                   # Styling & Theme definitions
│   └── globals.css           # Global Tailwind utilities, gradients & modals
├── tailwind.config.js        # Tailwind CSS theme configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Frontend package manifest & scripts
```

---

## ⚙️ Prerequisites

Before getting started, ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- **MongoDB**: A local MongoDB Community server running on port `27017` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.
- **Git**: Installed and configured on your terminal.
- *(Optional for Chat Summarizer)* **Python**: `3.9+` and `pip` (only needed if running the local HuggingFace Flask microservice).

---

## 🚀 Installation & Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/aasthag01-26/HackHub---Hackathon-Platform.git
cd HackHub---Hackathon-Platform
```

### 2. Frontend Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hackhub
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

   > **Note**: Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API will run on [http://localhost:5000](http://localhost:5000).

---

### 4. (Optional) AI Summarizer Microservice Setup

If you want to use the local Hugging Face BART summarizer for chat:

```bash
cd ai-summarizer
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | No |
| `GET` | `/api/auth/me` | Fetch current user profile | Yes |
| `GET` | `/api/auth/verify` | Check if JWT token is valid | Yes |

### Teams (`/api/teams`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/teams` | Create a new team (as Leader) | Yes |
| `POST` | `/api/teams/join` | Join existing team via invite code | Yes |
| `GET` | `/api/teams/myteam` | Get current team profile & members | Yes |
| `POST` | `/api/teams/leave` | Leave current team | Yes |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks for current user's team | Yes |
| `POST` | `/api/tasks` | Create a new task in team | Yes |
| `PUT` | `/api/tasks/:id` | Update task status or details | Yes |
| `DELETE` | `/api/tasks/:id` | Remove a task | Yes |

### Files (`/api/files`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/files/upload` | Upload file to team GridFS storage | Yes |
| `GET` | `/api/files/files` | List all files belonging to user's team | Yes |
| `GET` | `/api/files/file/:filename` | Stream/download team file | Yes |
| `DELETE` | `/api/files/file/:identifier` | Delete file from GridFS | Yes |

### AI Integration (`/api/gemini`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/gemini` | Generate pitch / recommendations | No |

---

## 🤝 Contributing Guidelines

We welcome contributions from developers participating in Open Source Week and the developer community!

1. **Fork the Repository** to your own GitHub account.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/HackHub---Hackathon-Platform.git
   cd HackHub---Hackathon-Platform
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Your Changes & Test thoroughly**.
5. **Commit with Clear Messages**:
   ```bash
   git add .
   git commit -m "feat: add user-friendly empty state for task board"
   ```
6. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Submit a Pull Request**:
   - Open a PR against `main` on the upstream repository.
   - Mention the related issue number (e.g. `Fixes #1`).
   - Describe what was changed and how to test it.

---

## 📄 License

This project is licensed for educational and developmental purposes. Developed as a collaborative hackathon platform.
