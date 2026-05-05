import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/auth";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLoginMode) {
        await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        await register(formData);
        console.log(formData);
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLoginMode ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-gray-400 mb-6 text-sm">
          {isLoginMode ? "Login to continue" : "Register to start playing"}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all duration-150 shadow-lg"
          >
            {isLoginMode ? "Login" : "Register"}
          </button>
        </form>

        {/* Switch Mode */}
        <button
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="mt-5 w-full text-sm text-gray-400 hover:text-white transition"
        >
          {isLoginMode
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
