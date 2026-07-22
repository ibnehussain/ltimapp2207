# Contributing to Weather Dashboard

Thank you for your interest in contributing! The sections below cover
everything you need to get set up, the branching workflow, and the standards
we follow for code and pull requests.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Project Structure](#project-structure)
4. [Branching Workflow](#branching-workflow)
5. [Coding Standards](#coding-standards)
6. [Running Tests](#running-tests)
7. [Submitting a Pull Request](#submitting-a-pull-request)
8. [Reporting Issues](#reporting-issues)

---

## Prerequisites

- **Python 3.10+** and **pip**
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Git

---

## Local Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/ltimapp2207.git
cd ltimapp2207

# 2. Create and activate a virtual environment
python -m venv .venv
# Linux / macOS
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Configure environment
copy backend/.env.example backend/.env   # Windows
# or
cp backend/.env.example backend/.env     # Linux / macOS

# 5. Start the Flask development server
cd backend
python app.py
```

Open `frontend/index.html` in your browser.  
The backend API is available at `http://127.0.0.1:5000`.

---

## Project Structure

```
ltimapp2207/
├── backend/
│   ├── app.py                  # Flask factory
│   ├── config.py               # App configuration
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   ├── routes/
│   │   └── weather.py          # GET /weather endpoint
│   └── services/
│       └── weather_service.py  # Open-Meteo integration
├── docs/
│   ├── API.md                  # API reference
│   └── ARCHITECTURE.md         # Architecture overview
└── frontend/
    ├── index.html              # App shell
    ├── css/
    │   └── styles.css          # Styles
    └── js/
        ├── app.js              # Event wiring
        ├── api.js              # Fetch helpers
        ├── ui.js               # DOM helpers
        └── storage.js          # localStorage helpers
```

---

## Branching Workflow

| Branch | Purpose |
|--------|---------|
| `master` | Stable, production-ready code. |
| `feature/<short-description>` | New features (e.g. `feature/hourly-forecast`). |
| `fix/<short-description>` | Bug fixes (e.g. `fix/geolocation-error`). |
| `docs/<short-description>` | Documentation-only changes. |

```bash
# Create a feature branch off master
git checkout master
git pull origin master
git checkout -b feature/my-feature
```

---

## Coding Standards

### Python (backend)

- Follow [PEP 8](https://pep8.org/) style guidelines.
- Write Google-style docstrings for all public functions, classes, and modules.
- Keep functions focused — prefer small, single-responsibility functions.
- Handle exceptions at the route layer; raise domain-specific exceptions
  (`LookupError`, `ValueError`) from the service layer.

### JavaScript (frontend)

- Write [JSDoc](https://jsdoc.app/) comments for all exported functions and
  module-level variables.
- Use `const` / `let`; avoid `var`.
- Keep DOM manipulation in `ui.js`, network calls in `api.js`, storage logic
  in `storage.js`, and event wiring in `app.js`.

---

## Running Tests

There is currently no automated test suite.  Manual testing steps:

1. Start the backend (`python backend/app.py`).
2. Open `frontend/index.html` in your browser.
3. Search for a known city (e.g. `London`) and verify the weather card and
   forecast render correctly.
4. Click the 📍 button and allow location access; verify weather loads.
5. Toggle between °C and °F and confirm all temperatures update.
6. Check that the recent searches list appears after at least one successful
   search.

---

## Submitting a Pull Request

1. Ensure your branch is up to date with `master`:
   ```bash
   git fetch origin
   git rebase origin/master
   ```
2. Push your branch and open a pull request against `master`.
3. Fill in the PR template — describe **what** changed and **why**.
4. Link any related issues using GitHub keywords (e.g. `Closes #42`).
5. Request a review from a maintainer.

---

## Reporting Issues

Please use the [GitHub Issues](https://github.com/ibnehussain/ltimapp2207/issues)
tracker.  Include:

- A clear title and description.
- Steps to reproduce.
- Expected vs. actual behaviour.
- Browser / OS / Python version where relevant.
