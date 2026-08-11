import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Auth from "./pages/Auth";
import Room from "./pages/Room";
import Game from "./pages/Game";
import Playground from "./pages/Playground";
import { UserContextProvider } from "./context/UserContextProvider";
import { playSound, loopSound, stopSound } from "./utils/soundManager";

/* ── Plays page-flip sound + starts/stops background music ── */
function NavigationSoundListener() {
  const location = useLocation();

  useEffect(() => {
    playSound("pageFlip");

    if (location.pathname !== "/" && location.pathname !== "") {
      loopSound("bgMusic");
    } else {
      stopSound("bgMusic");
    }
  }, [location.pathname]);

  return null;
}

/* ── Animated page wrapper ───────────────────────────────────
   Re-mounts (and therefore re-triggers .page-enter) every time
   the route key changes, giving a smooth 3-D page-turn feel.
─────────────────────────────────────────────────────────────── */
function AnimatedPage({ children }) {
  const location = useLocation();

  return (
    // key forces React to unmount + remount → animation re-plays
    <div key={location.key} className="page-enter w-full min-h-screen">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <UserContextProvider>
      <Router>
        <NavigationSoundListener />
        <Routes>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <Auth />
              </AnimatedPage>
            }
          />
          <Route
            path="/room"
            element={
              <AnimatedPage>
                <Room />
              </AnimatedPage>
            }
          />
          <Route
            path="/room/:roomId/game"
            element={
              <AnimatedPage>
                <Game />
              </AnimatedPage>
            }
          />
          <Route
            path="room/:roomId/game/:gameId"
            element={
              <AnimatedPage>
                <Playground />
              </AnimatedPage>
            }
          />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}
