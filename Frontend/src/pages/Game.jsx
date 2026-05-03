import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomUsers } from "../services/room";
import { getRoomGames, createGame } from "../services/game";

export default function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [gameTotalRound, setGameTotalRound] = useState(1);

  const fetchRoomData = async () => {
    try {
      const roomUsers = await getRoomUsers(roomId);
      const roomGames = await getRoomGames(roomId);
      setUsers(roomUsers);
      setGames(roomGames);
    } catch (error) {
      console.error("Failed to load room data:", error);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    try {
      await createGame(roomId, {
        total_round: gameTotalRound,
        room_id: roomId,
      });
      setGameTotalRound(1);
      fetchRoomData(); // Refresh the list after creation
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/room")}>&larr; Back to Lobby</button>
      <h2>Room ID: {roomId}</h2>
      <form onSubmit={handleCreateGame} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Total Rounds"
          value={gameTotalRound}
          type="number"
          onChange={(e) => setGameTotalRound(e.target.value)}
          required
        />
        <button type="submit">Start New Game</button>
      </form>
      <div>
        <h3>Past / Active Games</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {games?.map((g, i) => (
            <li
              key={g.id}
              style={{
                cursor: "pointer",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
              }}
              onClick={() => navigate(`${g.id}`)}
            >
              <div style={{ fontWeight: "bold" }}>Game #{g.id}</div>
              <div>Total Rounds: {g.total_round}</div>
              <div style={{ fontSize: "0.85em", color: "#666" }}>
                Created: {new Date(g.created_at).toLocaleString()}
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  color: g.is_ended ? "red" : g.is_started ? "green" : "blue",
                }}
              >
                Status:{" "}
                {g.is_ended
                  ? "Finished"
                  : g.is_started
                    ? "In Progress"
                    : "Waiting to Start"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
