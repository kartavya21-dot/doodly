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
      {/* Background Soft Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200 flex items-center justify-center mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
            <Palette className="w-8 h-8 text-blue-600" />
          </div>
          
          {/* Google Colorized Title */}
          <div className="flex items-center gap-1">
            <h1 className="text-4xl font-extrabold tracking-wider font-mono">
              <span className="text-blue-600">D</span>
              <span className="text-red-500">o</span>
              <span className="text-amber-500">o</span>
              <span className="text-blue-600">d</span>
              <span className="text-green-600">l</span>
              <span className="text-red-500">y</span>
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin ml-1" style={{ animationDuration: '6s' }} />
          </div>
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mt-1">
            Funky Multiplayer Doodling
          </p>
        </div>

        {/* Auth Card */}
        <div className="neon-card rounded-3xl p-8 border border-slate-200/80 bg-white/90 relative overflow-hidden backdrop-blur-xl shadow-xl shadow-slate-200/50">
          {/* Mode Indicator Bar */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsLoginMode(true); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                isLoginMode
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsLoginMode(false); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                !isLoginMode
                  ? "bg-green-600 text-white shadow-md shadow-green-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>{isLoginMode ? "Welcome Back" : "Join the Arena"}</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {isLoginMode
              ? "Enter your credentials to step into the drawing lounge"
              : "Create your unique profile to start doodling right away"}
          </p>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5 flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
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
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
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
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-3 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-98 disabled:opacity-60 cursor-pointer ${
                isLoginMode
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-green-500/20"
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
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }}
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium cursor-pointer"
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
