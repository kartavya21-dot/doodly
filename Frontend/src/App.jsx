import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import Room from "./pages/Room";
import Game from "./pages/Game";
import Playground from "./pages/Playground";
import { UserContextProvider } from "./context/UserContextProvider";
import { playSound, loopSound, stopSound } from "./utils/soundManager";

function NavigationSoundListener() {
  const location = useLocation();

  useEffect(() => {
    // Play page flip sound on page transitions
    playSound("pageFlip");

    // Loop background music continuously after user logs in (paths containing "/room")
    if (location.pathname !== "/" && location.pathname !== "") {
      loopSound("bgMusic");
    } else {
      stopSound("bgMusic");
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <UserContextProvider>
      <Router>
        <NavigationSoundListener />
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/room" element={<Room />} />
          <Route path="/room/:roomId/game" element={<Game />} />
          <Route path="room/:roomId/game/:gameId" element={<Playground />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}
