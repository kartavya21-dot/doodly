from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List, Dict, TypedDict
from db.session import Session, engine
from db.models import Game, Room, User, GameUser
from services.auth_services import decode_token
from sqlmodel import select

router = APIRouter(prefix="/ws", tags=["WebSocket"])

class PlayerInQueue(TypedDict):
    username: str
    is_active: bool

connections: Dict[str, List[WebSocket]] = {}
players_queue: Dict[str, List[PlayerInQueue]] = {}

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
    game: Game = None
    room: Room = None
    if game_id not in connections:
        connections[game_id] = []
        players_queue[game_id] = []

    with Session(engine) as session:
        game = session.get(Game, game_id)
        room = session.get(Room, game.room_id)

        if username not in [user.username for user in room.users]:
            await websocket.close(code=1008, reason="Unauthorized")
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
                    gameUser: GameUser = session.exec(select(GameUser).where(GameUser.user_username == username)).first()
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
                    None
                )

                if player:
                    player["is_active"] = True
                else:
                    players_queue[game_id].append(
                        {
                            "username": username,
                            "is_active": True
                        }
                    )

                print(players_queue[game_id])

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
                            players_queue[game_id].append(players_queue[game_id].pop(0))

                            new_msg = {
                                "message": f"{msg['username']} guessed the word",
                                "username": msg["username"],
                                "next_player": players_queue[game_id][0]["username"],
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

                            await broadcast_message(
                                connections[game_id], websocket, new_msg, to_user=True
                            )
                        else:
                            await broadcast_message(
                                connections[game_id], websocket, msg, to_user=True
                            )

            # ---------------- NEXT_ROUND ----------------
            elif msg["type"] == "NEXT_ROUND":
                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_player = players_queue[game_id][0]["username"]
                    session.commit()
                    session.refresh(game)

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
                with Session(engine) as session:
                    game = session.get(Game, game_id)
                    game.current_player = players_queue[game_id][0]["username"]
                    game.is_started = True
                    session.commit()
                    session.refresh(game)

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
            # game: Game = session.get(Game, game_id)
            # if not game.is_started:
            #     user: User = session.get(User, username)
            #     game.players.remove(user)
            #     session.commit()
            #     session.refresh(game)
            # else:
            gameUser:GameUser = session.get(GameUser, (username, game_id))
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

        print("*"*32, players_queue[game_id])

        connections[game_id].remove(websocket)

        if not connections[game_id]:
            del connections[game_id]
            del players_queue[game_id]
