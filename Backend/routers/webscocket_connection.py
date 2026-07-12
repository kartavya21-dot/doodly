from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List, Dict, TypedDict
from db.session import Session, engine
from db.models import Game, Room, User, GameUser
from services.auth_services import decode_token
from sqlmodel import select, delete

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


connections: Dict[int, List[WebSocket]] = {}
players_queue: Dict[int, List[PlayerInQueue]] = {}
turn_timers = {}


async def broadcast_message(
    connections_list: List[WebSocket], current_websocket: WebSocket, msg, to_user=True
):
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


import asyncio


async def turn_timer(game_id, current_user: str):
    try:
        time_left = 31000

        while time_left > 0:

            timer_msg = {"type": "TIMER", "timeLeft": time_left - 1}

            await broadcast_message(connections[game_id], None, timer_msg, to_user=True)

            await asyncio.sleep(1)
            time_left -= 1

        user: PlayerInQueue = next(
            (
                player
                for player in players_queue[game_id]
                if player["username"] == current_user
            ),
            None,
        )

        # if user is there, but not active then switch round
        if user and not user["is_active"]:
            msg = None

            with Session(engine) as session:
                game = session.get(Game, game_id)
                game.current_round += 1

                if game.current_round == game.total_round:
                    game.is_ended = True

                    msg = {"type": "GAME_END", "message": "Game ended"}

                else:
                    player_count = len(game.players)
                    index = game.current_round % player_count
                    current_player_username = players_queue[game_id][index]["username"]
                    game.current_player = current_player_username

                    msg = {
                        "type": "ERROR",
                        "message": f"{current_user} cannot rejoin in time",
                        "sub-type": "NEXT_ROUND",
                    }

                session.commit()
                session.refresh(game)

            await broadcast_message(connections[game_id], None, msg, to_user=True)

        else:
            with Session(engine) as session:
                game = session.get(Game, game_id)
                game.current_player = current_user
                game.current_word = "integza"
                session.commit()
                session.refresh(game)

                msg = {
                    "message": f"{current_user} chose a word",
                    "username": current_user,
                    "current_word": "integza",
                    "type": "CHOOSE_WORD",
                }

                await broadcast_message(connections[game_id], None, msg, to_user=True)

    except asyncio.CancelledError:
        print("Timer Cancelled")


@router.websocket("")
async def websocket_(websocket: WebSocket, token: str, game_id: int):
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
        await websocket.send_json(msg)
        return

    if game_id not in connections:
        connections[game_id] = []
        players_queue[game_id] = []

    await websocket.accept()

    # So this is the case where game is already started, but for some reason every member was inactive
    if game.is_started:
        with Session(engine) as session:
            game_user: GameUser = session.get(GameUser, (username, game_id))

            if len(connections[game_id]) == 0:
                game: Game = session.get(Game, game_id)
                game.is_ended = True
                session.commit()
                session.refresh(game)

                msg = {"type": "GAME_END", "message": "Game already ended"}

                await websocket.send_json(msg)
                return

            # Now this check is for that 0.1% case, where user was not deleted( before game started, user left the game, so gameUser is deleted)
            if not game_user:
                msg = {"type": "YOU_LATE", "message": "Game started, cant join now"}

                await websocket.send_json(msg)
                return

            game_user.is_active = True

            for player in players_queue[game_id]:
                if player["username"] == username:
                    player["is_active"] = True

            session.commit()
            session.refresh(game_user)

    connections[game_id].append(websocket)

    try:
        while True:
            msg = await websocket.receive_json()
            # ---------------- JOIN ----------------
            if msg["type"] == "JOIN":
                with Session(engine) as session:
                    game: Game = session.get(Game, game_id)
                    gameUser: GameUser = session.get(GameUser, (username, game_id))

                    if gameUser:
                        gameUser.is_active = True
                    else:
                        gameUser: GameUser = GameUser(
                            user_username=username,
                            game_id=game_id,
                            turn=0,
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

                await broadcast_message(
                    connections[game_id], websocket, new_msg, to_user=True
                )

            # ---------------- START ----------------
            elif msg["type"] == "START":

                # Populating the queue from db
                with Session(engine) as session:
                    game_users = session.exec(
                        select(GameUser)
                        .where(GameUser.game_id == game_id)
                        .order_by(GameUser.turn)
                    ).all()

                    for i, user in enumerate(game_users):
                        user.turn = i
                        players_queue[game_id].append(
                            {
                                "username": user.user_username,
                                "is_active": user.is_active,
                            }
                        )

                    print("Populated queue, in START: ", players_queue[game_id])

                    current_player_username = None

                    game = session.get(Game, game_id)

                    player_count = len(game.players)
                    index = game.current_round % player_count
                    current_player_username = players_queue[game_id][index]["username"]

                    game.current_player = current_player_username
                    game.is_started = True
                    session.commit()
                    session.refresh(game)

                    new_msg = {
                        "message": f"Game Begins, {current_player_username} is choosing word",
                        "username": current_player_username,
                        "type": "START",
                    }

                    await broadcast_message(
                        connections[game_id], websocket, new_msg, to_user=True
                    )

                    turn_timers[game_id] = asyncio.create_task(
                        turn_timer(game_id, current_player_username)
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

            elif msg["type"] == "DRAW":
                await broadcast_message(
                    connections[game_id], websocket, msg, to_user=False
                )

            # ---------------- GUESS ----------------
            elif msg["type"] == "GUESS":
                with Session(engine) as session:
                    game = session.get(Game, game_id)

                    if game.current_round == game.round_ended:
                        await broadcast_message(
                            connections[game_id], websocket, msg, to_user=True
                        )
                    elif game.current_player == username:
                        await websocket.send_json(msg)
                    else:
                        # --------------- WIN ----------------
                        if game.current_word == msg["message"]:
                            game.round_ended += 1
                            player_count = len(game.players)
                            index = game.current_round % player_count
                            current_player_username = players_queue[game_id][index][
                                "username"
                            ]

                            new_msg = {
                                "message": f"{msg['username']} guessed the word",
                                "username": msg["username"],
                                # "next_player": current_player_username,
                                "type": "WIN",
                            }
                            if game.current_round == game.total_round:
                                game.is_ended = True
                                session.add(game)
                                session.commit()
                                session.refresh(game)
                                new_msg["type"] = "GAME_END"
                            else:
                                game.current_player = current_player_username
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
                    game.current_round += 1
                    if game.current_round >= game.total_round:
                        game.is_ended = True
                        session.commit()
                        session.refresh(game)

                        await broadcast_message(
                            connections[game_id],
                            websocket,
                            {"type": "GAME_END"},
                            to_user=True,
                        )
                    else:
                        player_count = len(game.players)
                        index = game.current_round % player_count
                        current_player_username = players_queue[game_id][index][
                            "username"
                        ]

                        game.current_player = current_player_username
                        session.commit()
                        session.refresh(game)

                        new_msg = {
                            "message": f"New round begins, {current_player_username} is choosing a word",
                            "username": current_player_username,
                            "type": "NEXT_ROUND",
                        }

                        await broadcast_message(
                            connections[game_id], websocket, new_msg, to_user=True
                        )

                        turn_timers[game_id] = asyncio.create_task(
                            turn_timer(game_id, game.current_player)
                        )

            # ---------------- DEFAULT ----------------
            else:
                await broadcast_message(
                    connections[game_id], websocket, msg, to_user=True
                )

    except WebSocketDisconnect:
        game_is_started = False
        msg = {}

        with Session(engine) as session:
            gameUser: GameUser = session.get(GameUser, (username, game_id))
            game: Game = session.get(Game, game_id)
            game_is_started = game.is_started

            if game_is_started:
                gameUser.is_active = False
                session.add(gameUser)
            else:
                if gameUser:
                    session.delete(gameUser)

            session.commit()
            session.refresh(gameUser)

        if game_is_started:
            msg = {
                "message": f"{username} lost connection.",
                "username": username,
                "type": "LOST_CONNECTION",
            }
        else:
            msg = {
                "message": f"{username} left game.",
                "username": username,
                "type": "LEFT_GAME",
            }

        await broadcast_message(connections[game_id], websocket, msg, to_user=False)

        if game_is_started:
            for player in players_queue[game_id]:
                if player["username"] == username:
                    player["is_active"] = False
                    break

            connections[game_id].remove(websocket)

            # In case where all the user left the game, midway(after game is started) therefore delete it
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