import React, { useEffect, useState } from 'react'
import Canvas from './Canvas'
import { useParams } from 'react-router-dom'
import { getGame } from '../services/game'
import LobbyArea from '../component/LobbyArea'
import { getRoomById } from '../services/room'

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
        <Canvas/>
        {!game?.is_started && <LobbyArea game={game} room={room}/>}
    </div>
  )
}

export default Playground