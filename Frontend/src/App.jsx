import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Room from "./pages/Room";
import Game from "./pages/Game";
import Playground from "./pages/Playground";
import { UserContextProvider } from "./context/UserContextProvider";

export default function App() {
  return (
    <UserContextProvider>
      <Router>
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
