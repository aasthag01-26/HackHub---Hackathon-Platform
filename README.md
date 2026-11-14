# HackHub — Hackathon Platform

HackHub is a collaborative platform for organizing hackathon work. It brings
project tasks, team coordination, shared files, chat, deadlines, and pitch
generation into one place.

## Features

- **Authentication:** Sign up and log in through the Express API, with user
  records stored in MongoDB.
- **Dashboard:** View task progress, a Chart.js status chart, upcoming tasks,
  team details, and deadline/countdown information.
- **Task board:** Add tasks, assign them to team members, move them between
  **To Do**, **In Progress**, and **Done**, and delete them.
- **Team setup and management:** Set up a team profile, deadline, and member
  roles; view and edit team information.
- **Team chat:** Send messages and request an AI summary of the conversation.
- **Files and links:** Upload, list, download, and delete team files, and save
  useful links.
- **AI pitch tools:** Generate a pitch and request improvement suggestions with
  the Gemini API.

Some screens use in-memory application state for their UI actions. The Express
API also provides protected user, team, task, and file endpoints.

## Technology

- **Frontend:** Next.js 14 (the lockfile resolves 14.2.33), React 18,
  TypeScript, Tailwind CSS 3.4, and Chart.js.
- **API backend:** Node.js, Express 4, Mongoose 8, and MongoDB.
- **AI pitch generation:** Google Gemini API, through the Express backend.
- **AI chat summarizer:** Optional Python, Flask, PyTorch, and Transformers
  service.

## Prerequisites

- **Node.js 18.17.0 or later.** The installed Next.js version requires this
  minimum. npm is included with Node.js; the repository does not pin an npm
  version.
- **MongoDB:** A MongoDB instance that the backend can reach. The project does
  not pin a MongoDB server version.
- **Python and pip (optional):** Needed only for the Python chat/summarizer
  service. The Python version and the package versions in
  `ai-summarizer/requirements.txt` are not pinned by this project.
- **API credentials:** A MongoDB connection string and JWT signing secret are
  needed by the backend. A Gemini API key is needed for pitch generation.

## Installation

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/Shivani-Meena07/HackHub---Hackathon-Platform.git
   cd HackHub---Hackathon-Platform
   ```

2. Install the frontend dependencies from the repository root:

   ```bash
   npm install
   ```

3. Install the Express backend dependencies:

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Create `backend/.env` locally. No environment file is included in the
   repository. Set the values for your own environment:

   ```dotenv
   PORT=5000
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<your private signing secret>
   GEMINI_API_KEY=<your Gemini API key>
   ```

   `PORT` is optional and defaults to `5000`. `GEMINI_API_KEY` is only required
   for Gemini-backed pitch generation. Keep real credentials out of Git.

5. The frontend defaults to the local API at
   `http://localhost:5000/api`. To change that URL, create a root-level
   `.env.local` file:

   ```dotenv
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

   This variable is optional when using the default local backend URL. It is a
   public URL setting, not a place for API secrets.

## Run the frontend and API backend

Start each application in its own terminal from the repository root.

**Terminal 1 — Next.js frontend** (run `npm run dev` from the repository root):

```bash
npm run dev
```

The frontend is available at [http://localhost:3000](http://localhost:3000).

**Terminal 2 — Express API backend:**

```bash
cd backend
npm run dev
```

The API listens on `http://localhost:5000` by default. This command uses the
backend's `nodemon` development script. For a non-watching start, use
`npm start` from the `backend` directory.

The frontend also has these package scripts:

```bash
npm run build
npm start
npm run lint
```

Run `npm run build` from the repository root before `npm start` to serve the
production frontend. The repository currently has no ESLint configuration, so
`npm run lint` may prompt for one.

## Optional Python chat and summarizer service

`ai-summarizer/app.py` provides the `/chat` and `/summarize` Flask routes. It
loads the `facebook/bart-large-cnn` Transformers model the first time it runs;
that requires a network connection and may take time. From the repository root:

```bash
cd ai-summarizer
python -m venv .venv
```

Activate the environment:

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1
```

```bash
# macOS or Linux
source .venv/bin/activate
```

Install the listed packages and the CORS package imported by the app, then run
the service:

```bash
pip install -r requirements.txt
pip install flask-cors
python app.py
```

The current requirements file does not list `flask-cors`, even though the app
imports it. The Flask app also defaults to port `5000`, the same default as the
Express backend. To run both services together, set `PORT=5001` in
`backend/.env` and set `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in the
root `.env.local`. The chat page currently sends its `/chat` and `/summarize`
requests directly to `127.0.0.1:5000`.

The `ai-pitch/` Python files contain standalone helper functions; the web
application's pitch generation uses the Express Gemini endpoint.

## Project structure

```text
.
├── ai-pitch/                 # Standalone pitch helper scripts
├── ai-summarizer/            # Flask chat and AI summarization service
├── backend/
│   ├── config/                # Database configuration
│   ├── controllers/           # Authentication, team, and task handlers
│   ├── middleware/            # JWT authentication middleware
│   ├── models/                # MongoDB user, team, and task schemas
│   ├── routes/                # Auth, team, task, file, and Gemini routes
│   └── server.js              # Express server and route setup
├── components/                # Shared React components, including Layout
├── context/                   # App-wide state
├── pages/                     # Next.js routes (auth, dashboard, tasks, etc.)
├── styles/                    # Global CSS and Tailwind-based styling
├── package.json               # Frontend scripts and dependencies
├── package-lock.json          # Frontend dependency lockfile
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

The active Next.js source is at the repository root. The existing `frontend/`
directory contains generated `.next` cache files, not a separate frontend
source project.

## Screenshots

There are no application screenshots in the repository, so none are included
here. To document the UI with real images, please provide screenshots of:

- The dashboard, including its task chart and deadline/countdown.
- The task board with the **New Status** dropdown open.
- Team setup or team management.
- Team chat and its summary view.
- The files page and AI pitch generator.

## Troubleshooting

- **`Failed to fetch`:** Confirm the Express backend is running, its
  `MONGO_URI` is configured, and the frontend API URL points to the backend's
  port. The backend CORS configuration allows `http://localhost:3000`.
- **Port already in use:** The Express and Flask services both default to port
  `5000`. Use the port split described above when running both.
- **MongoDB connection error:** Check that the MongoDB instance is reachable
  and that `MONGO_URI` is valid for your environment.
- **Pitch generation fails:** Confirm `GEMINI_API_KEY` is set in
  `backend/.env`.
- **`No module named flask_cors`:** Install it in the active Python environment
  with `pip install flask-cors`.
- **Dashboard chart does not load:** The dashboard loads Chart.js from a CDN;
  check the browser's internet access and console for a failed script request.

## Contributing

We welcome contributions from developers of all experience levels, especially
beginners participating in Open Source Week!

### How to Contribute

1. Explore the [open issues](../../issues) and select a task that matches your
   skills.
2. Comment on the issue to express your interest before starting work.
3. Fork this repository.
4. Clone your fork:

   ```bash
   git clone YOUR_FORK_URL
   ```

5. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. Make your changes and test them.
7. Commit and push your changes:

   ```bash
   git add .
   git commit -m "Describe your changes"
   git push origin feature/your-feature-name
   ```

8. Open a Pull Request against the original repository and mention the related
   issue.

### Guidelines

- Follow the existing code structure and coding style.
- Keep your commits meaningful.
- Do not commit `.env` files, API keys, or passwords.
- Ask questions in the project discussion channel if you need help.
- Be respectful and collaborative.

Happy Contributing! 🚀

Developed as a collaborative hackathon project.

## Contributors

Thanks to everyone who contributes to making HackHub better!

## License

This project is for educational and development purposes.
