import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, getMyRooms, createRoom, joinRoom } from "../services/room";
import { logout } from "../services/auth";
import { AlertCircle, X } from "lucide-react";
import { playSound } from "../utils/soundManager";
import VolumeControls from "../component/VolumeControls";
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
  const [joinRoomPassword, setJoinRoomPassword] = useState("");

  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [createError, setCreateError] = useState(null);
  const [joinError, setJoinError]     = useState(null);
  const createErrTimer = useRef(null);
  const joinErrTimer   = useRef(null);

  const showCreateError = (msg) => {
    setCreateError(msg);
    clearTimeout(createErrTimer.current);
    createErrTimer.current = setTimeout(() => setCreateError(null), 4000);
  };

  const showJoinError = (msg) => {
    setJoinError(msg);
    clearTimeout(joinErrTimer.current);
    joinErrTimer.current = setTimeout(() => setJoinError(null), 4000);
  };

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

      navigate(`/room/${room.id}/game`);
    } catch (error) {
      playSound("error");
      const msg = error?.response?.data?.detail || "Failed to create room. Please try again.";
      showCreateError(msg);
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    try {
      const payload = {
        room_id: +joinRoomId,
        ...(joinRoomPassword && { password: joinRoomPassword }),
      };
      await joinRoom(payload);
      setJoinRoomPassword("");
      navigate(`/room/${joinRoomId}/game`);
    } catch (error) {
      playSound("error");
      const msg = error?.response?.data?.detail || "Could not join room. Check the Room ID and try again.";
      showJoinError(msg);
      console.error("Error joining room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Header Navigation */}
      <header className="neon-card rounded-3xl p-4 md:p-5 border border-slate-200 bg-white/90 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          {/* <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <Palette className="w-6 h-6" />
          </div> */}
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 flex items-center justify-center sm:justify-start gap-2">
              <span className="google-text-blue">D</span>
              <span className="google-text-red">o</span>
              <span className="google-text-yellow">o</span>
              <span className="google-text-blue">d</span>
              <span className="google-text-green">l</span>
              <span className="google-text-red">y</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Draw & Guess Playful Board</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <VolumeControls />
          
          <button
            onClick={logout}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 w-full sm:w-auto shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Forms Section Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Room Card */}
        <div className="neon-card rounded-3xl p-6 border border-slate-200 bg-white/95">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Create a Room</span>
                <Zap className="w-4 h-4 text-emerald-600" />
              </h3>
              <p className="text-xs text-slate-500">Host your custom drawing lobby</p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">
                Room Name
              </label>
              <input
                placeholder="e.g. Speed Doodlers"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newRoomIsPublic}
                  onChange={(e) => setNewRoomIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                />
                <span className="font-semibold">Public Room</span>
              </label>
              {newRoomIsPublic ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Public
                </span>
              ) : (
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Private
                </span>
              )}
            </div>

            {!newRoomIsPublic && (
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">
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
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
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

            {/* Auto-dismissing Create Room error banner */}
            {createError && (
              <div className="mt-3 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{createError}</span>
                <button
                  onClick={() => setCreateError(null)}
                  className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Join Room Card */}
        <div className="neon-card rounded-3xl p-6 border border-slate-200 bg-white/95">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Join a Room</span>
                <DoorOpen className="w-4 h-4 text-blue-600" />
              </h3>
              <p className="text-xs text-slate-500">Enter using an existing Room ID</p>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">
                Room ID Code
              </label>
              <input
                placeholder="e.g. 102"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                Room Password
                <span className="text-slate-400 font-normal normal-case">(private rooms only)</span>
              </label>
              <input
                type="password"
                placeholder="Leave blank for public rooms"
                value={joinRoomPassword}
                onChange={(e) => setJoinRoomPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>

            <p className="text-xs text-slate-500 italic">
              Ask your room admin for the Room ID and password (if private).
            </p>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-blue-500/20 active:scale-98 cursor-pointer disabled:opacity-50 mt-auto"
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

            {/* Auto-dismissing Join Room error banner */}
            {joinError && (
              <div className="mt-3 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{joinError}</span>
                <button
                  onClick={() => setJoinError(null)}
                  className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Rooms Lists Container */}
      <div className="space-y-8">
        {/* Refresh button header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-purple-600" />
            <span>Active Drawing Hubs</span>
          </h2>

          <button
            onClick={fetchRooms}
            disabled={isLoadingRooms}
            className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRooms ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* My Rooms */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>My Created / Joined Rooms</span>
          </h3>

          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-8 neon-card rounded-2xl border border-slate-200 bg-white">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
              <span className="text-xs text-slate-500 font-mono">Loading rooms...</span>
            </div>
          ) : myRooms.length === 0 ? (
            <div className="neon-card rounded-2xl p-6 text-center text-slate-500 text-xs border border-slate-200 bg-white">
              You have not created or joined any rooms yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((r) => (
                <div
                  key={r.id}
                  className="neon-card rounded-2xl p-4 border border-slate-200 bg-white hover:border-blue-400 transition-all flex flex-col justify-between gap-4 group shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {r.name}
                      </h4>
                      <span className="text-xs font-mono text-slate-500">
                        ID: #{r.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        r.is_public
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
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
                    className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-emerald-700 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>All Public & Private Lobbies</span>
          </h3>

          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-8 neon-card rounded-2xl border border-slate-200 bg-white">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin mr-2" />
              <span className="text-xs text-slate-500 font-mono">Fetching lobby list...</span>
            </div>
          ) : allRooms.length === 0 ? (
            <div className="neon-card rounded-2xl p-6 text-center text-slate-500 text-xs border border-slate-200 bg-white">
              No active lobbies found right now. Be the first to create one!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRooms.map((r) => (
                <div
                  key={r.id}
                  className="neon-card rounded-2xl p-4 border border-slate-200 bg-white hover:border-purple-400 transition-all flex justify-between items-center group shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                      {r.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-500">
                      ID: #{r.id}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      r.is_public
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
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
