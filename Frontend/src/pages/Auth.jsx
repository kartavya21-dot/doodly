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
    <div style={{ padding: "20px", maxWidth: "300px", margin: "0 auto" }}>
      <h2>{isLoginMode ? "Login" : "Register"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isLoginMode ? "Login" : "Register"}</button>
      </form>

      <button
        onClick={() => setIsLoginMode(!isLoginMode)}
        style={{ marginTop: "15px", width: "100%" }}
      >
        Switch to {isLoginMode ? "Register" : "Login"}
      </button>
    </div>
  );
}
