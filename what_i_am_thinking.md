## Project To do list
- [ ] Add persistant canvas. (in case user comes in between game, after loosing connection. Then should be able to see whats being drawn in that round)

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