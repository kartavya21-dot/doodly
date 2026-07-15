## Project To do list
- [ ] Add persistant canvas. (in case user comes in between game, after loosing connection. Then should be able to see whats being drawn in that round)
- [ ] Optimise the coordingtes on websockets (Maybe coordinate compression with binary data)

## Project Updates
### 8 July
* Once user join the game, we add it in GameUser
* If user leaves
  1. game.is_started: turn the active status false
  2. not game.is_started: then remove from GameUser

* If user rejoin
  1. game.is_started: check if user was after start of game, if yes then mark is_active=True, in both players_queue[game_id], and in db. if user was not part of game before the start, then return "YOU_LATE"
  2. not game.is_started: nothing, just allow that to join from lobby

* Once the game is started, then we will add index to player_turn in both db and in player's queue | Reason: Because that what stopping us from modifying user once the game is started.

### 10 July
* Implemented, **User can now join the game after it starts, if user had joined before it was started**
* Idea: To store contextRef in websocket context, and a register function in canvas to register the canvasRef. Then send data from websocket context to canvas

### 12 July
* Now when game is won, we dont send the next_player name. we game.current_player as null in frontend. So the user cant draw after the game ends
* Also hide the Board while choosing word

### 13 July
* Changed *WIN* -> *ROUND_END*, to make it more obvious.
* Timer added when users are guessing the drawing.
* Changed game_timer to know, remaining time.

### 14 July
* Scoring based on time left
* But the issue starts, when user guess the game stops. There is issue when I am adding user to user_game_score row

### 15 July 
* Issue is solved, variable was used but not declared (current_player_username) in GUESS state
* **guessing_player** will get **40%** share of score, while **drawing_player** will get **60%** share of score. Reason: think of two player game