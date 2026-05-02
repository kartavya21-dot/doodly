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

      navigate(`/game/${room.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      await joinRoom({ room_id: joinRoomId });
      navigate(`/game/${joinRoomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Room Lobby</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <form onSubmit={handleCreateRoom}>
          <h3>Create a Room</h3>
          <input
            placeholder="Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            required
          />

          <label style={{ display: "block", margin: "10px 0" }}>
            <input
              type="checkbox"
              checked={newRoomIsPublic}
              onChange={(e) => setNewRoomIsPublic(e.target.checked)}
            />
            Public Room
          </label>

          {!newRoomIsPublic && (
            <input
              type="password"
              placeholder="Enter Password"
              value={newRoomPassword}
              onChange={(e) => setNewRoomPassword(e.target.value)}
              required // Ensure password is required if private
            />
          )}

          <button type="submit">Create</button>
        </form>

        <form onSubmit={handleJoinRoom}>
          <h3>Join a Room</h3>
          <input
            placeholder="Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            required
          />
          <button type="submit">Join</button>
        </form>
      </div>

      <h3>My Rooms</h3>
      <ul className="flex flex-col gap-1">
        {myRooms.map((r) => (
          <li className="cursor-pointer border p-4" key={r.id}>
            ID: {r.id} | {r.name} |{" "}
            <span
              className={`${r.is_public ? "text-green-500" : "text-red-500"}`}
            >
              {" "}
              Public: {r.is_public ? "Yes" : "No"}
            </span>{" "}
            | {"  "}
            <button
              onClick={() => navigate(`/game/${r.id}`)}
              className="border p-2 rounded-2xl"
            >
              Enter
            </button>
          </li>
        ))}
      </ul>

      <h3>All Available Rooms</h3>
      <ul className="flex flex-col gap-1">
        {allRooms.map((r) => (
          <li className="cursor-pointer border p-4" key={r.id}>
            ID: {r.id} | {r.name} |{" "}
            <span
              className={`${r.is_public ? "text-green-500" : "text-red-500"}`}
            >
              {" "}
              Public: {r.is_public ? "Yes" : "No"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
