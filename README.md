# Weather Dashboard

A full-stack weather dashboard app with an HTML/CSS/JavaScript frontend and a Python Flask backend. Weather data is fetched from [Open-Meteo](https://open-meteo.com/) — **no API key required**.

---

## Features

- Search current weather by city name
- Auto-detect location via browser Geolocation
- 5-day forecast with weather emoji icons
- Toggle between °C and °F
- Recent searches saved in localStorage
- Responsive design with a modern glassmorphism theme

---

## Project Structure

```
ltimapp2207/
├── backend/
│   ├── app.py                    # Flask entry point
│   ├── config.py                 # App configuration
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variable template
│   ├── routes/
│   │   └── weather.py            # GET /weather route
│   └── services/
│       └── weather_service.py    # Open-Meteo API integration
└── frontend/
    ├── index.html                # Main dashboard page
    ├── css/
    │   └── styles.css            # Weather-themed styles
    └── js/
        ├── app.js                # Event wiring
        ├── api.js                # Fetch calls to Flask
        ├── ui.js                 # DOM rendering
        └── storage.js            # localStorage helpers
```

---

## Run Locally

### Prerequisites
- Python 3.10+
- pip

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ibnehussain/ltimapp2207.git
cd ltimapp2207

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Copy environment file (no API key needed for Open-Meteo)
copy .env.example .env

# 4. Start the Flask server
python app.py
```

Open `frontend/index.html` in your browser. The backend runs on `http://127.0.0.1:5000`.

---

## API Endpoint

```
GET /weather?city=London
GET /weather?lat=51.5&lon=-0.1
```

**Response:**
```json
{
  "city": "London",
  "country": "GB",
  "temperature": 18.5,
  "feels_like": 17.2,
  "humidity": 72,
  "wind_speed": 5.1,
  "condition": "Partly Cloudy",
  "icon": "⛅",
  "forecast": [
    { "date": "2026-07-24", "high": 20.1, "low": 13.4, "condition": "Clear", "icon": "☀️" }
  ]
}
```

---

## Deploy on Azure Web Apps

### Prerequisites
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- An Azure account ([free tier](https://azure.microsoft.com/free/) works)

---

### Option 1 — Azure CLI (recommended)

**Step 1: Login**
```bash
az login
```

**Step 2: Create a Resource Group**
```bash
az group create --name weather-dashboard-rg --location eastus
```

**Step 3: Create an App Service Plan (free tier)**
```bash
az appservice plan create \
  --name weather-dashboard-plan \
  --resource-group weather-dashboard-rg \
  --sku FREE \
  --is-linux
```

**Step 4: Create the Web App**
```bash
az webapp create \
  --name weather-dashboard-app \
  --resource-group weather-dashboard-rg \
  --plan weather-dashboard-plan \
  --runtime "PYTHON:3.12"
```

**Step 5: Configure the startup command**
```bash
az webapp config set \
  --name weather-dashboard-app \
  --resource-group weather-dashboard-rg \
  --startup-file "cd backend && gunicorn -w 2 -b 0.0.0.0:8000 app:create_app()"
```

**Step 6: Deploy from local git or GitHub**

*From local folder:*
```bash
cd backend
az webapp up \
  --name weather-dashboard-app \
  --resource-group weather-dashboard-rg \
  --runtime "PYTHON:3.12"
```

*From GitHub (CI/CD):*
```bash
az webapp deployment source config \
  --name weather-dashboard-app \
  --resource-group weather-dashboard-rg \
  --repo-url https://github.com/ibnehussain/ltimapp2207 \
  --branch master \
  --manual-integration
```

**Step 7: Set environment variable**
```bash
az webapp config appsettings set \
  --name weather-dashboard-app \
  --resource-group weather-dashboard-rg \
  --settings FLASK_ENV=production
```

**Step 8: Open the app**
```bash
az webapp browse --name weather-dashboard-app --resource-group weather-dashboard-rg
```

---

### Option 2 — Azure Portal (GUI)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search **App Services** → **Create**
3. Set:
   - **Runtime stack**: Python 3.12
   - **OS**: Linux
   - **Region**: East US (or nearest)
   - **Plan**: Free (F1)
4. Under **Deployment** tab → enable **GitHub Actions**
5. Authorize GitHub and select repo `ibnehussain/ltimapp2207`, branch `master`
6. Azure auto-generates a GitHub Actions workflow for CI/CD

---

### Option 3 — VS Code Azure Extension

1. Install [Azure App Service extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)
2. Open the **Azure** panel in VS Code
3. Right-click **App Services** → **Create New Web App**
4. Right-click the created app → **Deploy to Web App** → select `backend/` folder

---

### Add `gunicorn` for production

Add to `backend/requirements.txt`:
```
gunicorn
```

Azure uses **gunicorn** as the WSGI server on Linux. The startup command should be:
```
gunicorn -w 2 -b 0.0.0.0:8000 "app:create_app()"
```

---

### Serve Frontend via Flask (for deployment)

To serve the frontend from Flask itself (single app deployment), add this to `backend/app.py`:

```python
from flask import send_from_directory

@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)
```

Then deploy the entire repo root as the app directory.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3, Flask, Flask-CORS, Flask-Caching |
| Weather Data | [Open-Meteo API](https://open-meteo.com/) (free, no key) |
| Deployment | Azure App Service (Linux, Python 3.12) |

---

## License

MIT
