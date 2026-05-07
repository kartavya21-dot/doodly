from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List, Dict
from db.session import Session, engine
from db.models import Game, Room, User
from services.auth_services import decode_token

router = APIRouter(prefix="/ws", tags=["WebSocket"])

connections: Dict[str, List[WebSocket]] = {}
players_queue: Dict[str, List[str]] = {}

"""
    {
        type: str = JOIN, GUESS, DRAW, SELECT, LOST_CONNECTION, WIN, START, CHOOSE_WORD
        message: str = - , str, tuple, str
        username: str
    }
"""

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

    with Session(engine) as session:
        game: Game = session.get(Game, game_id)
        room: Room = session.get(Room, game.room_id)

        if username not in [user.username for user in room.users]:
            await websocket.close(code=1008, reason="Unauthorized")
            return

    await websocket.accept()

    if game_id not in connections:
        connections[game_id] = []
        players_queue[game_id] = []

    connections[game_id].append(websocket)

    try:
        while True:
            msg = await websocket.receive_json()

            # ---------------- JOIN ----------------
            if msg["type"] == "JOIN":
                with Session(engine) as session:
                    game: Game = session.get(Game, game_id)
                    user: User = session.get(User, username)
                    game.players.append(user)
                    session.add(game)
                    session.commit()
                    session.refresh(game)

                new_msg = {
                    "message": f"{msg['username']} joined the game",
                    "username": msg["username"],
                    "type": "JOIN",
                }

                if msg["username"] not in players_queue[game_id]:
                    players_queue[game_id].append(msg["username"])

                await broadcast_message(connections[game_id], websocket, new_msg, to_user=True)

            # ---------------- GUESS ----------------
            elif msg["type"] == "GUESS":
                with Session(engine) as session:
                    game = session.get(Game, game_id)

                    print(msg)
                    print(players_queue[game_id])

                    if game.current_player == username:
                        await websocket.send_json(msg)
                    else:
                        # --------------- WIN ----------------
                        if game.current_word == msg["message"]:
                            players_queue[game_id].append(players_queue[game_id].pop(0))

                            new_msg = {
                                "message": f"{msg['username']} guessed the word",
                                "username": msg["username"],
                                "next_player": players_queue[game_id][0],
                                "type": "WIN",
                            }
                            if game.current_round == game.total_round:
                                session.add(game)
                                session.commit()
                                session.refresh()
                                new_msg["type"] = "GAME_END"
                            else:
                                game.current_round += 1
                                game.current_player = username
                                session.add(game)
                                session.commit()
                                session.refresh(game)

                            await broadcast_message(connections[game_id], websocket, new_msg, to_user=True)
                        else:
                            await broadcast_message(connections[game_id], websocket, msg, to_user=True)

            # ---------------- NEXT_ROUND ----------------
            elif msg["type"] == "NEXT_ROUND":
                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_player = players_queue[game_id][0]
                    session.commit()
                    session.refresh(game)

                    new_msg = {
                        "message": f"New round begins, {game.current_player} is choosing a word",
                        "username": game.current_player,
                        "type": "NEXT_ROUND"
                    }

                    await broadcast_message(connections[game_id], websocket, new_msg, to_user=True)

            # ---------------- START ----------------
            elif msg["type"] == "START":
                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_player = players_queue[game_id][0]
                    game.is_started = True
                    session.commit()
                    session.refresh(game)

                    new_msg = {
                        "message": f"Game Begins, {game.current_player} is choosing word",
                        "username": game.current_player,
                        "type": "START",
                    }

                    await broadcast_message(connections[game_id], websocket, new_msg, to_user=True)

            # ---------------- CHOOSE-WORD ----------------
            elif msg["type"] == "CHOOSE_WORD":
                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_word = msg["current_word"]
                    session.commit()
                    session.refresh(game)

                    new_msg = {
                        "message": f"{msg['username']} chose a word",
                        "username": game.current_player,
                        "current_word": msg["current_word"],
                        "type": "CHOOSE_WORD",
                    }

                    await broadcast_message(connections[game_id], websocket, new_msg, to_user=True)

            # ---------------- DEFAULT ----------------
            else:
                await broadcast_message(connections[game_id], websocket, msg, to_user=False)

    except WebSocketDisconnect:

        with Session(engine) as session:
            game: Game = session.get(Game, game_id)
            if not game.is_started:
                user: User = session.get(User, username)
                game.players.remove(user)
                session.commit()
                session.refresh(game)

        msg = {
            "message": f"{username} lost connection.",
            "username": username,
            "type": "LOST_CONNECTION",
        }

        await broadcast_message(connections[game_id], websocket, msg, to_user=False)

        connections[game_id].remove(websocket)
        players_queue[game_id].remove(username)

        if not connections[game_id]:
            del connections[game_id]
            del players_queue[game_id]