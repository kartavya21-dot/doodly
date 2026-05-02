import React from 'react'
import Canvas from './Canvas'
import { useParams } from 'react-router-dom'

const Playground = () => {
    const { gameId } = useParams()
  return (
    <div>
        <Canvas/>
        <div>
            
        </div>
    </div>
  )
}

export default Playground