# 🎮 Real-Time Drawing & Guessing Game – Flow Documentation

## 📌 Overview

This document describes the **event-driven flow** of the real-time multiplayer drawing and guessing game.

The system follows a **WebSocket-based architecture**, where:

* Clients (frontend) send events
* Server processes game logic
* Server broadcasts updates to all connected players

---

## ⚙️ Game Events (Types)

The game operates using the following event types:

| Event Type    | Description                       |
| ------------- | --------------------------------- |
| `JOIN`        | A user joins the game             |
| `START`       | Admin starts the game             |
| `CHOOSE_WORD` | Current player selects a word     |
| `DRAW`        | Current player sends drawing data |
| `GUESS`       | Players send guesses              |
| `WIN`         | A correct guess is made           |
| `NEXT_ROUND`  | Start of next round               |
| `GAME_END`    | Game finishes after all rounds    |

---

## 🔄 Game Flow

### 1. User Joins the Game

* **Frontend → Server:** `JOIN`
* **Server:**

  * Adds user to game session
  * Updates player queue
  * Broadcasts join event
* **Frontend:**

  * Updates lobby UI with new player

---

### 2. Admin Starts the Game

* **Frontend → Server:** `START`
* **Server:**

  * Selects first player from queue as `current_player`
  * Broadcasts game start event with current player
* **Frontend:**

  * Switches from lobby → game screen
  * Current player sees word options
  * Other players see: *"{user} is choosing a word"*

---

### 3. Player Chooses a Word

* **Frontend → Server:** `CHOOSE_WORD`
* **Server:**

  * Stores selected word as `current_word`
  * Broadcasts event to all players
* **Frontend:**

  * Current player → drawing mode enabled
  * Other players → guessing mode enabled

---

### 4. Drawing Phase

* **Frontend → Server:** `DRAW` (continuous updates)
* **Server:**

  * Broadcasts drawing data in real-time
* **Frontend:**

  * Renders drawing for all players

---

### 5. Guessing Phase

* **Frontend → Server:** `GUESS`

* **Server:**

  * Validates guess against `current_word`
  * If incorrect → broadcast guess
  * If correct:

    * Updates current player
    * Updates round state
    * Broadcasts `WIN`

* **Frontend:**

  * Displays guesses in real-time
  * On correct guess → show winner + next player

---

### 6. Win Condition

* **Server Broadcast:** `WIN`

  * Includes:

    * Winner username
    * Next player

* If final round reached:

  * **Server Broadcast:** `GAME_END`

---

### 7. Next Round

* **Frontend → Server:** `NEXT_ROUND`
* **Server:**

  * Sets next player from queue
  * Broadcasts round start
* **Frontend:**

  * Displays:

    > "New round begins, {current_player} is choosing a word"

---

### 🔁 Loop

Steps repeat:

```text
CHOOSE_WORD → DRAW → GUESS → WIN → NEXT_ROUND
```

Until:

```text
GAME_END
```

---

## 🧠 Notes & Assumptions

* Server is the **single source of truth** for:

  * `current_player`
  * `current_word`
  * `round state`

* Player order is maintained using a **queue system**

* All communication is handled via **WebSockets**

---

## 🚧 Future Improvements

* Persist game state (e.g., queue, rounds) using DB or cache
* Add explicit game states (`WAITING`, `CHOOSING`, `DRAWING`, `ENDED`)
* Improve validation (prevent cheating from client-side input)
* Add timers for rounds and turns
* Handle reconnections gracefully
