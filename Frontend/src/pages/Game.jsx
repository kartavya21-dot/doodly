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
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">

    {/* Top Bar */}
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => navigate("/room")}
        className="text-gray-300 hover:text-white transition"
      >
        ← Back to Lobby
      </button>

      <h2 className="text-xl font-semibold text-gray-300">
        Room ID: <span className="text-white">{roomId}</span>
      </h2>
    </div>

    {/* Create Game Card */}
    <div className="max-w-md mx-auto bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Start New Game</h3>

      <form onSubmit={handleCreateGame} className="flex gap-3">
        <input
          placeholder="Total Rounds"
          value={gameTotalRound}
          type="number"
          onChange={(e) => setGameTotalRound(e.target.value)}
          required
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 active:scale-95 transition-all shadow-lg"
        >
          Start
        </button>
      </form>
    </div>

    {/* Games List */}
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Past / Active Games</h3>

      <div className="flex flex-col gap-4">
        {games?.map((g) => (
          <div
            key={g.id}
            onClick={() => navigate(`${g.id}`)}
            className="cursor-pointer bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-xl p-4 hover:bg-gray-800 transition-all duration-200 shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Game #{g.id}</span>

              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  g.is_ended
                    ? "bg-red-500/20 text-red-400"
                    : g.is_started
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {g.is_ended
                  ? "Finished"
                  : g.is_started
                  ? "In Progress"
                  : "Waiting"}
              </span>
            </div>

            <div className="text-gray-300 text-sm mb-1">
              Total Rounds: <span className="text-white">{g.total_round}</span>
            </div>

            <div className="text-gray-500 text-xs">
              Created: {new Date(g.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
