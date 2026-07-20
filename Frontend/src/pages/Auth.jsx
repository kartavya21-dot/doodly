import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/auth";
import {
  User,
  Lock,
  Palette,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        await register(formData);
        // Auto-login after successful registration
        await login({
          username: formData.username,
          password: formData.password,
        });
      }
      navigate("/room");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden">
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-pink-500/30 mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Palette className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-wider neon-text-pink">
              DOODLY
            </h1>
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <p className="text-xs font-semibold tracking-widest text-cyan-400/80 uppercase mt-1">
            Funky Multiplayer Doodling
          </p>
        </div>

        {/* Auth Card */}
        <div className="neon-card rounded-3xl p-8 border border-white/10 relative overflow-hidden backdrop-blur-xl">
          {/* Mode Indicator Bar */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setIsLoginMode(true); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                isLoginMode
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsLoginMode(false); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                !isLoginMode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>{isLoginMode ? "Welcome Back!" : "Join the Arena"}</span>
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {isLoginMode
              ? "Enter your credentials to step into the drawing lounge"
              : "Create your unique profile to start doodling right away"}
          </p>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm px-4 py-3 rounded-2xl mb-5 flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-3 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-lg active:scale-98 disabled:opacity-60 cursor-pointer ${
                isLoginMode
                  ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:shadow-pink-500/30 hover:scale-[1.01]"
                  : "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:shadow-cyan-500/30 hover:scale-[1.01]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLoginMode ? "Sign In to Play" : "Create My Account"}</span>
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Footer Link */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium hover:underline"
            >
              {isLoginMode
                ? "Need a new player account? Register here"
                : "Already registered? Switch to Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
