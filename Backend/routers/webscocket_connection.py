from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from typing import List

router = APIRouter(prefix="/ws", tags=["WebSocket"])

connections:List[WebSocket] = []

@router.websocket("")
async def websocket_(websocket: WebSocket):
    await websocket.accept()

    connections.append(websocket)
    
    try:
        while(True):
            msg = await websocket.receive_text()

            for conn in connections:
                if conn == websocket:
                    continue
                await conn.send_text(msg)
    except WebSocketDisconnect:
        connections.remove(websocket)
