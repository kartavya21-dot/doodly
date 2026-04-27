from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List, Dict
from db.session import get_session, Session, engine
from db.models import Game, Room
from services.auth_services import decode_token

router = APIRouter(prefix="/ws", tags=["WebSocket"])

connections: Dict[str, List[WebSocket]] = {}

""""
    {
        type: str = JOIN, GUESS, DRAW,
        message: str = - , str, tuple,
        subtype: str = (LOST_CONNECTION), (WIN),
        username: str
    }

"""

async def broadcast_message(connections: List[WebSocket], websocket: WebSocket, msg, to_user: bool=False):
    if not to_user:
        for conn in connections:
            if conn == websocket:
                continue
            await conn.send_json(msg)
    else:
        for conn in connections:
            await conn.send_json(msg)


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

    connections[game_id].append(websocket)

    try:
        while True:
            # JOIN GUESS DRAW
            msg = await websocket.receive_json()

            if msg["type"] == "JOIN":
                with Session(engine) as session:
                    game:Game = session.get(Game, game_id)
                    game.players.append(username)
                    session.add(game)
                    session.commit()
                    session.refresh(game)

                new_msg = {
                    "message": f"{username} joined the game",
                    "username": username,
                    "type": "JOIN",
                    "subtype": "",
                }

                await broadcast_message(connections[game_id], websocket, new_msg, to_user=False)

            elif msg["type"] == "GUESS":
                
                with Session(engine) as session:
                    
                    game = session.get(Game, game_id)

                    if game.current_player == username:
                        await websocket.send_json(msg)
                    else:
                        if game.current_word == msg["message"]:
                            new_msg = {
                                "message": f"{username} guessed the word",
                                "username": username,
                                "type": "GUESS",
                                "subtype": "WIN",
                            }
                            await broadcast_message(connections[game_id], websocket, new_msg, to_user=True)
                        else:
                            await broadcast_message(connections[game_id], websocket, msg, to_user=False)

            else:
                await broadcast_message(connections[game_id], websocket, msg, to_user=False)

    except WebSocketDisconnect:
        msg = {
            "message": f"{username} lost connection.",
            "username": username,
            "type": "JOIN",
            "subtype": "LOST_CONNECTION",
        }
        await broadcast_message(connections[game_id], websocket, msg, to_user=False)
        connections[game_id].remove(websocket)
        if not connections[game_id]:
            del connections[game_id]
            