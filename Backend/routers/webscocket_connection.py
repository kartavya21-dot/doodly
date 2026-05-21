from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List, Dict, TypedDict
from db.session import Session, engine
from db.models import Game, Room, User, GameUser
from services.auth_services import decode_token
from sqlmodel import select

"""
    {
        type: str = JOIN, GUESS, DRAW, SELECT, LOST_CONNECTION, WIN, START, CHOOSE_WORD
        message: str = - , str, tuple, str
        username: str
    }
"""

router = APIRouter(prefix="/ws", tags=["WebSocket"])

class PlayerInQueue(TypedDict):
    username: str
    is_active: bool


connections: Dict[str, List[WebSocket]] = {}
players_queue: Dict[str, List[PlayerInQueue]] = {}
turn_timers = {}

import asyncio
async def turn_timer(game_id, current_user: str):
    try: 
        await asyncio.sleep(30)
        user: PlayerInQueue = next((player for player in players_queue[game_id] if player["username"] == current_user), None)
        
        # if user is not active then switch round
        if not user.is_active:
            with Session(engine) as session:
                game = session.get(Game, game_id)
                game.current_round += 1
                game.current_player = players_queue[game_id][0]
                session.commit()
                session.refresh(game)
            


    except asyncio.CancelledError:
        print("Timer Cancelled")



async def broadcast_message(connections_list, current_websocket, msg, to_user=True):
    dead_connections = []

    for conn in connections_list:
        if not to_user and conn == current_websocket:
            continue

        try:
            await conn.send_json(msg)
        except (RuntimeError, WebSocketDisconnect):
            dead_connections.append(conn)

    for dead_conn in dead_connections:
        if dead_conn in connections_list:
            connections_list.remove(dead_conn)


@router.websocket("")
async def websocket_(websocket: WebSocket, token: str, game_id: str):
    payload = decode_token(token)
    username: str = payload["sub"]
    game: Game = None
    room: Room = None

    with Session(engine) as session:
        game = session.get(Game, game_id)
        room = session.get(Room, game.room_id)

        if username not in [user.username for user in room.users]:
            await websocket.close(code=1008, reason="Unauthorized")
            return

    if game.is_ended:
        msg = {"type": "GAME_END", "message": "Game already ended"}

        await broadcast_message(connections[game_id], websocket, msg, to_user=True)
        return

    if game_id not in connections:
        connections[game_id] = []
        players_queue[game_id] = []

    if game.is_started:
        with Session(engine) as session:
            game_users: GameUser = session.exec(
                select(GameUser).where(
                    GameUser.game_id == game_id
                ).order_by(GameUser.turn)
            ).all()

            if len(players_queue[game_id]) == 0:
                players_queue[game_id] = [
                    {"username": user.user_username, "is_active": True}
                    for user in game_users
                ]

            if not game_users:
                msg = {"type": "ERROR", "message": "Game started, cant join now"}

                await websocket.send_json(msg)
                return

            if not players_queue[game_id] or len(players_queue[game_id]) == 0:
                game.is_ended = True
                session.add(game)
                session.commit()
                session.refresh(game)


                msg = {"type": "GAME_END", "message": "Game already ended"}

                await broadcast_message(
                    connections[game_id], websocket, msg, to_user=False
                )

                connections.pop(game_id)
                
                return

    print("Username: ", username)
    await websocket.accept()

    connections[game_id].append(websocket)

    try:
        while True:
            msg = await websocket.receive_json()

            # ---------------- JOIN ----------------
            if msg["type"] == "JOIN":
                with Session(engine) as session:
                    game: Game = session.get(Game, game_id)
                    playersCount: int = len(game.players)
                    gameUser: GameUser = session.exec(
                        select(GameUser).where(GameUser.user_username == username)
                    ).first()
                    if gameUser:
                        gameUser.is_active = True
                    else:
                        gameUser: GameUser = GameUser(
                            user_username=username,
                            game_id=game_id,
                            turn=playersCount,
                            is_active=True,
                        )
                    session.add(gameUser)
                    session.commit()
                    session.refresh(gameUser)

                new_msg = {
                    "message": f"{msg['username']} joined the game",
                    "username": msg["username"],
                    "type": "JOIN",
                }

                username = msg["username"]

                player = next(
                    (p for p in players_queue[game_id] if p["username"] == username),
                    None,
                )

                if player:
                    player["is_active"] = True
                else:
                    players_queue[game_id].append(
                        {"username": username, "is_active": True}
                    )

                print("From join: ", players_queue[game_id])

                await broadcast_message(
                    connections[game_id], websocket, new_msg, to_user=True
                )

            # ---------------- GUESS ----------------
            elif msg["type"] == "GUESS":
                with Session(engine) as session:
                    game = session.get(Game, game_id)

                    if game.current_player == username:
                        await websocket.send_json(msg)
                    else:
                        # --------------- WIN ----------------
                        if game.current_word == msg["message"]:

                            player_count = len(game.players)
                            index = game.current_round % player_count
                            
                            new_msg = {
                                "message": f"{msg['username']} guessed the word",
                                "username": msg["username"],
                                "next_player": players_queue[game_id][index]["username"],
                                "type": "WIN",
                            }
                            if game.current_round == game.total_round:
                                session.add(game)
                                session.commit()
                                session.refresh(game)
                                new_msg["type"] = "GAME_END"
                            else:
                                game.current_round += 1
                                game.current_player = username
                                session.add(game)
                                session.commit()
                                session.refresh(game)

                            await broadcast_message(
                                connections[game_id], websocket, new_msg, to_user=True
                            )
                        else:
                            await broadcast_message(
                                connections[game_id], websocket, msg, to_user=True
                            )

            # ---------------- NEXT_ROUND ----------------
            elif msg["type"] == "NEXT_ROUND":
                current_player_username = ""
                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_player = players_queue[game_id][0]["username"]

                    current_player_username = game.current_player

                    session.commit()
                    session.refresh(game)

                    turn_timers[game_id] = asyncio.create_task(turn_timer(game_id, game.current_player_username))

                    new_msg = {
                        "message": f"New round begins, {game.current_player} is choosing a word",
                        "username": game.current_player,
                        "type": "NEXT_ROUND",
                    }

                    await broadcast_message(
                        connections[game_id], websocket, new_msg, to_user=True
                    )

            # ---------------- START ----------------
            elif msg["type"] == "START":

                if len(players_queue[game_id]) == 0:
                    with Session(engine) as session:
                        game_users = session.exec(
                            select(GameUser)
                            .where(GameUser.game_id == game_id)
                        ).all()

                        for i, user in enumerate(game_users):
                            players_queue[game_id].append({
                                "username": user.username,
                                "is_active": user.is_active
                            })
                            
                current_player_username = next(
                    (d for d in players_queue[game_id] if d["is_active"]), None
                )

                if not current_player_username:
                    new_msg = {
                        "type": "ERROR",
                        "message": "No active player",
                    }
                    await broadcast_message(
                        connections[game_id], websocket, new_msg, to_user=True
                    )
                    return

                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_player = current_player_username["username"]
                    game.is_started = True
                    session.commit()
                    session.refresh(game)

                    turn_timers[game_id] = asyncio.create_task(turn_timer(game_id))

                    new_msg = {
                        "message": f"Game Begins, {game.current_player} is choosing word",
                        "username": game.current_player,
                        "type": "START",
                    }

                    await broadcast_message(
                        connections[game_id], websocket, new_msg, to_user=True
                    )

            # ---------------- CHOOSE-WORD ----------------
            elif msg["type"] == "CHOOSE_WORD":
                
                if game_id in turn_timers:
                    turn_timers[game_id].cancel()
                    del turn_timers[game_id]

                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_word = msg["current_word"]
                    session.commit()
                    session.refresh(game)

                    new_msg = {
                        "message": f"{game.current_player} chose a word",
                        "username": game.current_player,
                        "current_word": msg["current_word"],
                        "type": "CHOOSE_WORD",
                    }

                    await broadcast_message(
                        connections[game_id], websocket, new_msg, to_user=True
                    )

            # ---------------- DEFAULT ----------------
            else:
                await broadcast_message(
                    connections[game_id], websocket, msg, to_user=False
                )

    except WebSocketDisconnect:

        with Session(engine) as session:
            gameUser: GameUser = session.get(GameUser, (username, game_id))
            gameUser.is_active = False
            session.add(gameUser)
            session.commit()
            session.refresh(gameUser)

        msg = {
            "message": f"{username} lost connection.",
            "username": username,
            "type": "LOST_CONNECTION",
        }

        await broadcast_message(connections[game_id], websocket, msg, to_user=False)

        for player in players_queue[game_id]:
            if player["username"] == username:
                player["is_active"] = False
                break

        print("*" * 32, players_queue[game_id])

        # In case where all the user left the game, midway therefore delete it
        connections[game_id].remove(websocket)

        if len(connections[game_id]) == 0:

            with Session(engine) as session:
                game: Game = session.get(Game, game_id)
                game.is_ended = True
                session.add(game)
                session.commit()
                session.refresh(game)

            if game_id in turn_timers:
                turn_timers[game_id].cancel()
                del turn_timers[game_id]
            if game_id in connections:
                del connections[game_id]
            if game_id in players_queue:
                del players_queue[game_id]
