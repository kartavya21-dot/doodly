import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, getMyRooms, createRoom, joinRoom } from "../services/room";
import { logout } from "../services/auth";
import {
  Palette,
  Sparkles,
  LogOut,
  PlusCircle,
  LogIn,
  Lock,
  Globe,
  ShieldCheck,
  DoorOpen,
  ArrowRight,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function Room() {
  const navigate = useNavigate();
  const [allRooms, setAllRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIsPublic, setNewRoomIsPublic] = useState(true);
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const fetchedAllRooms = await getRooms();
      const fetchedMyRooms = await getMyRooms();
      setAllRooms(fetchedAllRooms || []);
      setMyRooms(fetchedMyRooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        name: newRoomName,
        is_public: newRoomIsPublic,
        password: newRoomIsPublic ? "" : newRoomPassword,
      };

      const room = await createRoom(payload);

      setNewRoomName("");
      setNewRoomPassword("");

      navigate(`room/${room.id}/game`);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    try {
      await joinRoom({ room_id: +joinRoomId });
      navigate(`room/game/${joinRoomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Header Navigation */}
      <header className="neon-card rounded-3xl p-5 border border-white/10 flex justify-between items-center shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Palette className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider neon-text-cyan">
                DOODLY LOBBY
              </h1>
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">Join a drawing arena or create your own room</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-sm flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Forms Section Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Room Card */}
        <div className="neon-card rounded-3xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Create a Room</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">Host your custom drawing lobby</p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Room Name
              </label>
              <input
                placeholder="e.g. Speed Doodlers"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all text-sm"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newRoomIsPublic}
                  onChange={(e) => setNewRoomIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
                <span className="font-medium">Public Room</span>
              </label>
              {newRoomIsPublic ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Public
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Private
                </span>
              )}
            </div>

            {!newRoomIsPublic && (
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                  Password Required
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Set secret passcode"
                    value={newRoomPassword}
                    onChange={(e) => setNewRoomPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Room</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Join Room Card */}
        <div className="neon-card rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Join a Room</span>
                <DoorOpen className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400">Enter using an existing Room ID</p>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Room ID Code
              </label>
              <input
                placeholder="e.g. 102"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-sm font-mono"
              />
            </div>

            <p className="text-xs text-slate-500 italic">
              Ask your room admin for the numerical Room ID to jump straight into action.
            </p>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-98 cursor-pointer disabled:opacity-50 mt-auto"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining Lobby...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Join Room</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Rooms Lists Container */}
      <div className="space-y-8">
        {/* Refresh button header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-purple-400" />
            <span>Active Drawing Hubs</span>
          </h2>

          <button
            onClick={fetchRooms}
            disabled={isLoadingRooms}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRooms ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* My Rooms */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>My Created / Joined Rooms</span>
          </h3>

          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-8 neon-card rounded-2xl border border-white/5">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
              <span className="text-xs text-slate-400 font-mono">Loading rooms...</span>
            </div>
          ) : myRooms.length === 0 ? (
            <div className="neon-card rounded-2xl p-6 text-center text-slate-500 text-xs border border-white/5">
              You have not created or joined any rooms yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((r) => (
                <div
                  key={r.id}
                  className="neon-card rounded-2xl p-4 border border-cyan-500/20 hover:border-cyan-400/60 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {r.name}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        ID: #{r.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        r.is_public
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {r.is_public ? (
                        <>
                          <Globe className="w-3 h-3" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> Private
                        </>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/room/${r.id}/game`)}
                    className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                  >
                    <span>Enter Lobby</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Rooms */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>All Public & Private Lobbies</span>
          </h3>

          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-8 neon-card rounded-2xl border border-white/5">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-2" />
              <span className="text-xs text-slate-400 font-mono">Fetching lobby list...</span>
            </div>
          ) : allRooms.length === 0 ? (
            <div className="neon-card rounded-2xl p-6 text-center text-slate-500 text-xs border border-white/5">
              No active lobbies found right now. Be the first to create one!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRooms.map((r) => (
                <div
                  key={r.id}
                  className="neon-card rounded-2xl p-4 border border-purple-500/20 hover:border-purple-400/60 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                      {r.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      ID: #{r.id}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      r.is_public
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {r.is_public ? (
                      <>
                        <Globe className="w-3 h-3" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Private
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
