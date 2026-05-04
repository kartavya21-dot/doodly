import React, { useEffect, useState } from 'react'
import Canvas from './Canvas'
import { useParams } from 'react-router-dom'
import { getGame } from '../services/game'
import LobbyArea from '../component/LobbyArea'
import { getRoomById } from '../services/room'
import { GameSocketProvider } from '../context/GameSocketContextProvider'

const Playground = () => {
    const { gameId, roomId } = useParams()
    const [game, setGame] = useState(null);
    const [room, setRoom] = useState(null);

    const fetchGame = async () => {
      try {
        const response = await getGame(gameId);
        setGame(response);
      } catch (e) {
        alert(e);
      }
    }
    const fetchRoom = async() => {
      try{
        const response = await getRoomById(roomId);
        setRoom(response);
      } catch(e) {
        alert(e);
      }
    }

    useEffect(() => {
      fetchGame();
      fetchRoom();
    }, [gameId, roomId])

  return (
    <div>
        <GameSocketProvider gameId={gameId}>
        <Canvas/>
        {game && !game?.is_started && room && <LobbyArea game={game} room={room}/>}
        </GameSocketProvider>
    </div>
  )
}

export default Playground