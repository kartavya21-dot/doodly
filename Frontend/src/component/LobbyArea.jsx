import React from "react";

const LobbyArea = ({ game, room }) => {
  return (
    <div>
      <h1>Game not started</h1>
      {room?.users.map((player, i) => {
        return <div key={i}>
            <h3>{player.username}</h3>
            {game?.players?.includes(player.username) ? 1 : 0}
            <div className={`${game?.players?.includes(player.username) ? 'bg-green-400' : 'bg-red-400'} w-10 aspect-square rounded-full`}></div>
        </div>
      })}
    </div>
  );
};

export default LobbyArea;