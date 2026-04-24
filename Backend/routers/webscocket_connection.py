from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List, Dict
from db.session import get_session, Session, engine
from db.models import Game

router = APIRouter(prefix="/ws", tags=["WebSocket"])

connections:Dict[str, WebSocket] = []

@router.websocket("")
async def websocket_(websocket: WebSocket, username: str, game_id: str):
    await websocket.accept()

    connections[game_id].append(websocket)
    
    try:
        while(True):
            # JOIN GUESS DRAW
            msg = await websocket.receive_json()

            if msg.type == "JOIN":
                with Session(engine) as session:
                    game:Game = session.get(Game, game_id)
                    game.players.append(username)
                    session.add(game)
                    session.commit()
                    session.refresh(game)


            for conn in connections:
                if conn == websocket:
                    continue
                await conn.send_text(msg)

    except WebSocketDisconnect:
        connections[game_id].remove(websocket)