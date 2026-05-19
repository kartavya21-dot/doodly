import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, getMyRooms, createRoom, joinRoom } from "../services/room";
import { logout } from "../services/auth";

export default function Room() {
  const navigate = useNavigate();
  const [allRooms, setAllRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIsPublic, setNewRoomIsPublic] = useState(true); // Default to public
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const fetchRooms = async () => {
    try {
      const fetchedAllRooms = await getRooms();
      const fetchedMyRooms = await getMyRooms();
      setAllRooms(fetchedAllRooms);
      setMyRooms(fetchedMyRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      // Prepare the payload
      const payload = {
        name: newRoomName,
        is_public: newRoomIsPublic,
        // Send password only if it is NOT public, otherwise send null or empty string
        password: newRoomIsPublic ? "" : newRoomPassword,
      };

      const room = await createRoom(payload);

      // Reset form
      setNewRoomName("");
      setNewRoomPassword("");

      navigate(`room/${room.id}/game`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      await joinRoom({ room_id: +joinRoomId });
      navigate(`room/game/${joinRoomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">

    {/* Header */}
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold tracking-wide">Room Lobby</h1>

      <button
        onClick={logout}
        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-md"
      >
        Logout
      </button>
    </header>

    {/* Forms Section */}
    <div className="grid md:grid-cols-2 gap-6 mb-10">

      {/* Create Room */}
      <form
        onSubmit={handleCreateRoom}
        className="bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold mb-4">Create a Room</h3>

        <input
          placeholder="Room Name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          required
          className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <label className="flex items-center gap-2 mb-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={newRoomIsPublic}
            onChange={(e) => setNewRoomIsPublic(e.target.checked)}
            className="accent-green-500"
          />
          Public Room
        </label>

        {!newRoomIsPublic && (
          <input
            type="password"
            placeholder="Enter Password"
            value={newRoomPassword}
            onChange={(e) => setNewRoomPassword(e.target.value)}
            required
            className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 active:scale-95 transition-all shadow-lg"
        >
          Create Room
        </button>
      </form>

      {/* Join Room */}
      <form
        onSubmit={handleJoinRoom}
        className="bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold mb-4">Join a Room</h3>

        <input
          placeholder="Room ID"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-lg"
        >
          Join Room
        </button>
      </form>
    </div>

    {/* My Rooms */}
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4">My Rooms</h3>

      <div className="flex flex-col gap-4">
        {myRooms.map((r) => (
          <div
            key={r.id}
            className="bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-xl p-4 flex justify-between items-center hover:bg-gray-800 transition"
          >
            <div>
              <div className="font-bold text-lg">{r.name}</div>
              <div className="text-sm text-gray-400">ID: {r.id}</div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  r.is_public
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {r.is_public ? "Public" : "Private"}
              </span>

              <button
                onClick={() => navigate(`/room/${r.id}/game`)}
                className="px-4 py-1 rounded-lg bg-green-600 hover:bg-green-500 transition"
              >
                Enter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* All Rooms */}
    <div>
      <h3 className="text-xl font-semibold mb-4">All Available Rooms</h3>

      <div className="flex flex-col gap-4">
        {allRooms.map((r) => (
          <div
            key={r.id}
            className="bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-xl p-4 flex justify-between items-center hover:bg-gray-800 transition"
          >
            <div>
              <div className="font-bold text-lg">{r.name}</div>
              <div className="text-sm text-gray-400">ID: {r.id}</div>
            </div>

            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                r.is_public
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {r.is_public ? "Public" : "Private"}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
