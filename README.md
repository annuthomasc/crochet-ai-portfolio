# CrochetAI Portfolio

An AI-powered crochet portfolio application that uses Claude AI's multimodal
vision API to analyze project photos and automatically generate complete
crochet patterns, visual stitch charts, and yarn colour palette suggestions.

## Live Demo
- **Frontend:** https://<your-github-username>.github.io/crochet-ai-portfolio
- **Backend API:** https://<your-railway-url>.railway.app/api/

## Features
- 📸 Photo portfolio gallery with search and category filtering
- 🤖 AI pattern generation from project photos (Claude AI multimodal)
- 📊 AI-generated visual stitch charts with symbol legend
- 🎨 Yarn colour palette suggestions with mood selection
- ⬇️ Professional PDF pattern downloads
- 🔐 JWT authentication
- ☁️ Cloudinary image storage

## Tech Stack

### Backend
- Django 4.2 + Django REST Framework
- PostgreSQL database
- JWT authentication (SimpleJWT)
- Cloudinary image storage
- Claude AI (Anthropic) — multimodal pattern generation
- Deployed on Railway

### Frontend
- React 18 + Vite
- Tailwind CSS
- Axios with JWT interceptors
- React Router v6
- jsPDF for pattern downloads
- Deployed on GitHub Pages

## Architecture
React (GitHub Pages) ←→ Django REST API (Railway) ←→ PostgreSQL
↓
Claude AI (Anthropic)
↓
Cloudinary (Images)

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | JWT login |
| GET | /api/projects/ | List all projects |
| POST | /api/projects/ | Create project |
| GET | /api/patterns/ | List all patterns |
| GET | /api/patterns/{id}/ | Pattern detail |
| POST | /api/ai/generate-pattern/ | AI pattern generation |
| POST | /api/ai/colour-suggestions/ | AI colour palettes |
| GET | /api/ai/health/ | AI health check |

## Author
Built by Annu Thomas — [your-linkedin-url]

AI pattern generation powered by [Claude AI](https://anthropic.com)