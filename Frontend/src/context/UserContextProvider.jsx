import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  return (
    <UserContext.Provider value={{ username: user }}>
      {children}
    </UserContext.Provider>
  );
}