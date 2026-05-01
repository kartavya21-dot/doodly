## Basic flow of Game - might change later
# States

JOIN - USER JOIN - SERVER BROADCAST
START - ADMIN START - SERVER BROADCAST
GUESS - USER SENDS - SERVER BROADCAST
DRAW - USER SENDS - SERVER BROADCAST
CHOOSE-WORD - USER CHOOSE - SERVER BROADCAST
NEXT-ROUND - CURRENT PLAYER SELECTS WORD - NEXT ROUND BEGINS - SERVER BROADCAST

# Flow
User joining the game - Frontend sends JOIN, Server Broadcast JOIN, Frontend just show it in lobby
Admin start the game - Frontend sends START, Server Broadcast START, also send current_player, Frontend React and change the screen to game, for current player its multiple words, for others just a user is choosing a word.
User chose a word - Frontend sends CHOOSE-WORD, and send the current word to servers, server update current_word, Server broadcast with CHOOSE_WORD, Frontend reacts by changing UI for users to guess, and current player to draw
User guess - Frontend sends GUESS, and send the guess_word, Server validate it and Broadcast to Frontend, 
Correct Guess - Backend broadcast WIN, along with user name, and next_player aka current player. (in case total_round done GAME_END)
Admin start the next round - Frontend sends NEXT_ROUND, Server broadcast current_user & NEXT_ROUND, Frontend shows "New round begins, {current_player} is choosing a word", 
Repeat 3, 4, 5, & 6