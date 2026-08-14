import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomUsers } from "../services/room";
import { getRoomGames, createGame, deleteGame } from "../services/game";
import {
  getThemes,
  createCustomTheme,
  addWordToTheme,
  deleteWordFromTheme,
  deleteCustomTheme,
} from "../services/theme";
import { playSound } from "../utils/soundManager";
import VolumeControls from "../component/VolumeControls";
import {
  ArrowLeft,
  Gamepad2,
  Plus,
  Trash2,
  Flame,
  CheckCircle,
  Clock,
  Loader2,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen,
  PlusCircle,
  X,
  Settings,
  AlertCircle,
} from "lucide-react";

export default function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  
  // Customisable parameters
  const [gameTotalRound, setGameTotalRound] = useState(3);
  const [choosingTime, setChoosingTime] = useState(30);
  const [guessingTime, setGuessingTime] = useState(60);
  
  // Themes
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  
  // Custom theme creation/management
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [editingTheme, setEditingTheme] = useState(null); // The custom Theme object being edited
  const [newWord, setNewWord] = useState("");
  const [isThemeCreating, setIsThemeCreating] = useState(false);
  const [isWordAdding, setIsWordAdding] = useState(false);

  const [activeTab, setActiveTab] = useState("active"); // "active" or "past"
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRoomData = async () => {
    setIsLoading(true);
    try {
      const roomUsers = await getRoomUsers(roomId);
      const roomGames = await getRoomGames(roomId);
      setUsers(roomUsers || []);
      setGames(roomGames || []);
    } catch (error) {
      console.error("Failed to load room data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThemesData = async () => {
    try {
      const allThemes = await getThemes(roomId);
      setThemes(allThemes || []);
      // Auto-select Animals theme by default, or the first preset
      const defaultTheme = allThemes.find((t) => t.is_preset && t.name === "Animals") || allThemes[0];
      if (defaultTheme && !selectedThemeId) {
        setSelectedThemeId(defaultTheme.id);
      }
    } catch (error) {
      console.error("Failed to load themes:", error);
    }
  };

  useEffect(() => {
    fetchRoomData();
    fetchThemesData();
  }, [roomId]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!selectedThemeId) {
      playSound("error");
      alert("Please select a theme before launching the match!");
      return;
    }

    // Verify custom theme has words if selected
    const activeTheme = themes.find(t => t.id === selectedThemeId);
    if (activeTheme && !activeTheme.is_preset) {
      // Check words in local themes list (which gets refreshed)
      const wordsCount = activeTheme.words?.length || 0;
      if (wordsCount < 4) {
        playSound("error");
        alert("Custom theme must have at least 4 words to start the game!");
        return;
      }
    }

    setIsCreating(true);
    try {
      await createGame(roomId, {
        total_round: Number(gameTotalRound),
        room_id: Number(roomId),
        theme_id: selectedThemeId,
        choosing_time: Number(choosingTime),
        guessing_time: Number(guessingTime),
      });
      fetchRoomData();
      playSound("paperCrumble");
      setActiveTab("active");
    } catch (error) {
      playSound("error");
      console.error("Error creating game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGame = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteGame(id);
      fetchRoomData();
    } catch (error) {
      playSound("error");
      console.error("Error deleting Game:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Custom Theme Handlers
  const handleCreateCustomTheme = async () => {
    if (!newThemeName.trim()) return;
    setIsThemeCreating(true);
    try {
      const created = await createCustomTheme(roomId, { name: newThemeName.trim() });
      setThemes((prev) => [...prev, { ...created, words: [] }]);
      setSelectedThemeId(created.id);
      setEditingTheme({ ...created, words: [] });
      setNewThemeName("");
      playSound("click");
    } catch (error) {
      playSound("error");
      console.error("Failed to create theme:", error);
    } finally {
      setIsThemeCreating(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim() || !editingTheme) return;
    setIsWordAdding(true);
    try {
      const addedWordObj = await addWordToTheme(editingTheme.id, newWord.trim());
      
      // Update editingTheme words list
      const updatedWords = [...(editingTheme.words || []), addedWordObj];
      const updatedTheme = { ...editingTheme, words: updatedWords };
      setEditingTheme(updatedTheme);
      
      // Update themes state list
      setThemes((prev) =>
        prev.map((t) => (t.id === editingTheme.id ? updatedTheme : t))
      );
      
      setNewWord("");
      playSound("click");
    } catch (error) {
      playSound("error");
      console.error("Failed to add word:", error);
    } finally {
      setIsWordAdding(false);
    }
  };

  const handleDeleteWord = async (wordId) => {
    if (!editingTheme) return;
    try {
      await deleteWordFromTheme(editingTheme.id, wordId);
      
      const updatedWords = (editingTheme.words || []).filter((w) => w.id !== wordId);
      const updatedTheme = { ...editingTheme, words: updatedWords };
      setEditingTheme(updatedTheme);
      
      setThemes((prev) =>
        prev.map((t) => (t.id === editingTheme.id ? updatedTheme : t))
      );
      playSound("click");
    } catch (error) {
      playSound("error");
      console.error("Failed to delete word:", error);
    }
  };

  const handleDeleteTheme = async (themeId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this custom theme?")) return;
    try {
      await deleteCustomTheme(themeId);
      setThemes((prev) => prev.filter((t) => t.id !== themeId));
      if (selectedThemeId === themeId) {
        setSelectedThemeId(themes.find(t => t.is_preset)?.id || null);
      }
      if (editingTheme?.id === themeId) {
        setEditingTheme(null);
      }
      playSound("click");
    } catch (error) {
      playSound("error");
      console.error("Failed to delete custom theme:", error);
    }
  };

  const getThemeEmoji = (name) => {
    const emojis = {
      "Indian Movies": "🎬",
      "Marvel Movies": "🦸",
      "Superheroes": "⚡",
      "Animals": "🐘",
      "Historical Figures": "🏛️",
      "Food": "🍕",
    };
    return emojis[name] || "✏️";
  };

  const activeGames = games.filter((g) => !g.is_ended);
  const pastGames = games.filter((g) => g.is_ended);
  const displayedGames = activeTab === "active" ? activeGames : pastGames;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 neon-card rounded-3xl p-4 md:p-5 border border-slate-200 bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate("/room")}
            className="px-4 py-2 rounded-2xl bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lobby</span>
          </button>
          
          <VolumeControls />
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-mono font-semibold">
              Room Control Center
            </h2>
            <p className="text-base sm:text-lg font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2 font-mono">
              <span>Room ID: #{roomId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Start New Game Configurator Card */}
      <div className="neon-card rounded-3xl p-6 border border-slate-200 bg-white w-full shadow-md max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Match Settings & Customisation</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500">Host sets game limits, round time & choice pool theme</p>
          </div>
        </div>

        <form onSubmit={handleCreateGame} className="space-y-6">
          {/* Numerical Config Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Rounds */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5 font-mono">
                Total Rounds
              </label>
              <input
                value={gameTotalRound}
                type="number"
                min="1"
                max="20"
                onChange={(e) => setGameTotalRound(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-950 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Choosing Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5 font-mono">
                Word Selection (Secs)
              </label>
              <input
                value={choosingTime}
                type="number"
                min="10"
                max="120"
                onChange={(e) => setChoosingTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-950 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Guessing Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5 font-mono">
                Drawing & Guess (Secs)
              </label>
              <input
                value={guessingTime}
                type="number"
                min="20"
                max="180"
                onChange={(e) => setGuessingTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-950 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Theme Selection Pill Grid */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block font-mono">
                Select Word Pool Theme
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowThemeCreator(!showThemeCreator);
                  setEditingTheme(null);
                }}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Custom Theme Creator</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setSelectedThemeId(theme.id);
                      if (!theme.is_preset) {
                        setEditingTheme(theme);
                        setShowThemeCreator(true);
                      } else {
                        setEditingTheme(null);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border select-none group shadow-sm ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-500 scale-[1.02] shadow-emerald-200"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span>{getThemeEmoji(theme.name)}</span>
                    <span>{theme.name}</span>
                    
                    {!theme.is_preset && (
                      <>
                        <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-black/10">
                          {theme.words?.length || 0}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTheme(theme.id, e)}
                          className="text-red-400 hover:text-red-600 ml-1 hover:scale-115 transition-transform"
                          title="Delete Custom Theme"
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Theme builder drawer panel */}
          {showThemeCreator && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Custom Word Lists</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowThemeCreator(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!editingTheme ? (
                /* Step 1: Set Name */
                <div className="flex gap-2 max-w-md">
                  <input
                    placeholder="Theme Name (e.g. Anime characters)"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomTheme}
                    disabled={isThemeCreating || !newThemeName.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isThemeCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Theme"}
                  </button>
                </div>
              ) : (
                /* Step 2: Manage words */
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Editing Wordlist:</span>
                    <strong className="text-xs font-extrabold text-blue-950 font-mono">
                      {editingTheme.name}
                    </strong>
                  </div>

                  {/* Add word text input */}
                  <div className="flex gap-2 max-w-sm">
                    <input
                      placeholder="Add custom word..."
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddWord();
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddWord}
                      disabled={isWordAdding || !newWord.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      {isWordAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
                    </button>
                  </div>

                  {/* Word List Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {editingTheme.words && editingTheme.words.length > 0 ? (
                      editingTheme.words.map((wObj) => (
                        <span
                          key={wObj.id}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold flex items-center gap-1 font-mono hover:bg-red-50 hover:border-red-200 hover:text-red-600 cursor-pointer group shadow-sm transition-colors"
                          onClick={() => handleDeleteWord(wObj.id)}
                          title="Click to delete word"
                        >
                          <span>{wObj.word}</span>
                          <X className="w-2.5 h-2.5 text-slate-400 group-hover:text-red-500" />
                        </span>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>No words added yet. Add at least 4 words to enable this theme.</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Launch Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Launching Match Lobby...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Launch Match</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Games List Container */}
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Room Matches</h3>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Active</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  activeTab === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {activeGames.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "past"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Past</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  activeTab === "past"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {pastGames.length}
              </span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 neon-card rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin mr-3" />
            <span className="text-sm text-slate-500 font-mono">Fetching match records...</span>
          </div>
        ) : displayedGames.length === 0 ? (
          /* Empty tab states */
          <div className="neon-card rounded-3xl p-8 text-center text-slate-500 text-sm border border-slate-200 bg-white shadow-sm">
            {activeTab === "active"
              ? "No active/unfinished matches in this room. Launch one above!"
              : "No past matches completed yet in this room."}
          </div>
        ) : (
          /* Matches List */
          <div className="flex flex-col gap-4">
            {displayedGames.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`${g.id}`)}
                className="neon-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-blue-400 transition-all cursor-pointer group flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors font-mono">
                      Match #{g.id}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        g.is_ended
                          ? "bg-red-50 text-red-700 border-red-200"
                          : g.is_started
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {g.is_ended ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Finished
                        </>
                      ) : g.is_started ? (
                        <>
                          <Flame className="w-3 h-3 text-emerald-600" /> Live Match
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Waiting...
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1">
                    <span>
                      Rounds: <strong className="text-slate-800">{g.total_round}</strong>
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span>
                      Choose Secs: <strong className="text-slate-800">{g.choosing_time || 30}s</strong>
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span>
                      Guess Secs: <strong className="text-slate-800">{g.guessing_time || 60}s</strong>
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span>
                      Theme: <strong className="text-slate-800 font-mono">
                        {themes.find((t) => t.id === g.theme_id)?.name || "Default"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-none pt-3 md:pt-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleDeleteGame(g.id, e)}
                    disabled={deletingId === g.id}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold flex-1 md:flex-initial"
                    title="Delete Match"
                  >
                    {deletingId === g.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`${g.id}`)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm flex-1 md:flex-initial"
                  >
                    <span>Play Match</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
