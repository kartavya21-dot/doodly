# 🎨 Doodly — Real-Time Multiplayer Drawing & Guessing Game
#### Live: https://doodly-mocha.vercel.app

A full-stack, real-time multiplayer drawing and guessing game inspired by Skribbl.io — built with **FastAPI**, **React 19**, **WebSockets**, and **PostgreSQL**.

Players take turns drawing a secret word on a shared canvas while others race to guess it in the live chat. Earn points based on speed — the faster you guess, the more you score!

---

## ✨ Features

- **🎮 Real-Time Multiplayer** — WebSocket-powered live drawing, guessing, and chat with no page reloads.
- **🖌️ Interactive Canvas** — Fluid drawing with color palette, brush sizes, eraser, and clear. Full touch support for mobile devices.
- **📱 Fully Responsive** — Single-screen viewport-locked layout on mobile with no scrolling during gameplay.
- **🎯 Smart Scoring** — Points awarded based on remaining time (60% to the artist, 40% to the guesser).
- **🎬 Themed Word Packs** — 6 preset themes (Indian Movies, Marvel, Superheroes, Animals, Historical Figures, Food) plus custom room-specific themes.
- **⚙️ Customizable Matches** — Configure round count, word selection time, and drawing/guessing duration per match.
- **🔐 Auth & Rooms** — JWT-based authentication, public/private rooms with password protection.
- **🔊 Sound Effects** — Page transitions, timer ticks, win fanfares, and background music with volume controls.
- **⚡ Optimized Drawing Protocol** — 90% bandwidth reduction using an 11-byte binary ArrayBuffer encoding for draw events instead of JSON.
- **🔄 Reconnection Support** — Players can rejoin mid-game without losing their spot or turn order.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Axios           |
| **Backend**  | FastAPI, Uvicorn, WebSockets, Pydantic v2                        |
| **Database** | PostgreSQL (production) / SQLite (local dev), SQLModel, Alembic  |
| **Auth**     | JWT (python-jose), bcrypt password hashing                        |
| **Hosting**  | Render (Backend + DB), Vercel (Frontend), Neon (Managed Postgres) |

---

## 📷 Screenshots
![alt text](<./images/img1.png>)
![alt text](<./images/img2.png>)
![alt text](<./images/img3.png>)
![alt text](<./images/img4.png>)

---

## 📁 Project Structure

```
Doodly/
├── Backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── db/
│   │   ├── models.py            # SQLModel database models
│   │   └── session.py           # Engine & session setup (Postgres/SQLite)
│   ├── routers/
│   │   ├── auth.py              # Register, login, refresh token
│   │   ├── room.py              # Room CRUD & join logic
│   │   ├── game.py              # Game creation, players, scores
│   │   ├── theme.py             # Preset & custom theme management
│   │   └── webscocket_connection.py  # WebSocket game loop & real-time events
│   ├── schemas/                 # Pydantic request/response models
│   ├── services/                # Auth helpers (JWT, bcrypt)
│   ├── alembic/                 # Database migrations
│   ├── render.yaml              # Render Blueprint deploy config
│   ├── requirements.txt
│   └── .env.example
│
├── Frontend/
│   ├── src/
│   │   ├── pages/               # Auth, Room, Game, Playground, Canvas, ChatArea
│   │   ├── Canvas/              # Board.jsx (drawing engine with binary encoding)
│   │   ├── component/           # Scoreboard, Lobby, RoundEndModal, VolumeControls
│   │   ├── context/             # GameSocketContextProvider, UserContextProvider
│   │   ├── services/            # Axios API client (auth, room, game, theme)
│   │   ├── utils/               # Sound manager (Web Audio API)
│   │   └── App.jsx              # Router & animated page transitions
│   ├── vercel.json              # SPA rewrite rules for Vercel
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** & pip
- **Node.js 18+** & npm
- (Optional) PostgreSQL for production-like setup

### 1. Clone the Repository

```bash
git clone https://github.com/kartavya21-dot/doodly.git
cd doodly
```

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional — defaults to SQLite if unset)
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET_KEY

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Configure environment (optional — defaults to http://localhost:8000)
cp .env.example .env
# Edit .env with your VITE_API_BASE_URL if needed

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser and start playing!

---

## ⚙️ Environment Variables

### Backend (`Backend/.env`)

| Variable         | Description                                           | Default                    |
| ---------------- | ----------------------------------------------------- | -------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string. Leave unset for SQLite.  | SQLite (`database.db`)     |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens.                    | Hardcoded fallback (dev only) |

### Frontend (`Frontend/.env`)

| Variable              | Description                         | Default                  |
| --------------------- | ----------------------------------- | ------------------------ |
| `VITE_API_BASE_URL`   | Backend API URL. WebSocket URL is derived automatically. | `http://localhost:8000`  |

---

## 🌐 Deployment

### Backend — Render

The project includes a [`render.yaml`](Backend/render.yaml) Blueprint configuration.

1. Push your code to GitHub.
2. On [Render Dashboard](https://dashboard.render.com), click **New+ → Blueprint**.
3. Connect your repo and set the blueprint path to `Backend/render.yaml`.
4. Render will automatically provision a PostgreSQL database, link environment variables, run migrations, and start the server.

### Frontend — Vercel

1. On [Vercel Dashboard](https://vercel.com), import the repository.
2. Set the **Root Directory** to `Frontend`.
3. Add the environment variable `VITE_API_BASE_URL` pointing to your Render backend URL (e.g. `https://doodly-backend.onrender.com`).
4. Deploy. The [`vercel.json`](Frontend/vercel.json) handles SPA routing automatically.

---

## 🔄 Game Flow

```
JOIN → START → CHOOSE_WORD → DRAW + GUESS → ROUND_END → NEXT_ROUND → ... → GAME_END
```

1. **Join** — Players connect to a game room via WebSocket.
2. **Start** — Room admin starts the match; first player is assigned as the artist.
3. **Choose Word** — The artist picks from 4 randomly shuffled words from the selected theme.
4. **Draw Phase** — Artist draws on the canvas; strokes are broadcast in real-time as binary frames.
5. **Guess Phase** — Other players type guesses in the live chat; correct guesses are validated server-side.
6. **Round End** — Scores are calculated based on remaining time, round-end modal is displayed.
7. **Next Round** — Next player in the queue becomes the artist.
8. **Game End** — After all rounds, the final leaderboard is displayed.

---

## 🧠 Architecture Highlights

- **Binary Draw Protocol** — High-frequency `DRAW` events are packed into an **11-byte `ArrayBuffer`** (normalized x/y coordinates as 16-bit integers, color palette index, and width-normalized stroke size), reducing bandwidth by ~90% compared to JSON.
- **Proportional Stroke Rendering** — Stroke widths are normalized against a reference canvas width (1000px), so drawings look identical regardless of whether the artist is on a phone or a widescreen monitor.
- **Server as Source of Truth** — All game state (current player, current word, round state, scores) is managed server-side. The client cannot cheat by manipulating local state.
- **Dynamic WebSocket URLs** — The frontend automatically derives `ws://` or `wss://` from the configured API base URL, so the same build works on both HTTP (local) and HTTPS (production) environments.

---