import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export const getStoredUsername = () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser && savedUser !== "null" && savedUser !== "undefined") {
    return savedUser;
  }

  // Fallback: parse access_token if username key is missing in localStorage
  const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        // Base64URL decode
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        if (payload?.sub) {
          localStorage.setItem("username", payload.sub);
          return payload.sub;
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return null;
};

export const useUser = () => {
  const context = useContext(UserContext);
  const currentUsername = context?.username || getStoredUsername();
  return {
    ...context,
    username: currentUsername,
  };
};

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(getStoredUsername);

  useEffect(() => {
    const handleAuthChange = () => {
      const resolved = getStoredUsername();
      setUser(resolved);
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("user-auth-change", handleAuthChange);

    const resolved = getStoredUsername();
    if (resolved && resolved !== user) {
      setUser(resolved);
    }

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("user-auth-change", handleAuthChange);
    };
  }, [user]);

  return (
    <UserContext.Provider value={{ username: user, setUsername: setUser }}>
      {children}
    </UserContext.Provider>
  );
}