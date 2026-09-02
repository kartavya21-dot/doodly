import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const getStoredUsername = () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser && savedUser !== "null" && savedUser !== "undefined") {
    return savedUser;
  }

  // Fallback: parse access_token if username key is missing in localStorage
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
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

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(getStoredUsername);

  useEffect(() => {
    const resolved = getStoredUsername();
    if (resolved && resolved !== user) {
      setUser(resolved);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ username: user, setUsername: setUser }}>
      {children}
    </UserContext.Provider>
  );
}