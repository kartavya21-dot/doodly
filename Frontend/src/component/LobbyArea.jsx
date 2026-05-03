import React, { useEffect, useState } from "react";

const LobbyArea = ({ game, room }) => {
  const [username, setUsername] = useState("");
  useEffect(() => {
    console.log(game, room);
    setUsername(localStorage.getItem("username"));
    console.log(username);
  }, [room, game]);
  return (
    <div>
      <h1>Game not started</h1>
      {room?.users.map((player, i) => {
        return (
          <div key={i}>
            <h3>{player.username}</h3>
            {game?.players?.includes(player.username) ? 1 : 0}
            <div
              className={`${game?.players?.includes(player.username) ? "bg-green-400" : "bg-red-400"} w-10 aspect-square rounded-full`}
            ></div>
          </div>
        );
      })}
      {username === room?.admin_username && (<button>Start Game</button>)}
    </div>
  );
};

export default LobbyArea;
