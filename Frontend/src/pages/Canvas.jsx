import React, { useState } from "react";
import { useUser } from "../context/UserContextProvider";
import { useGameSocket } from "../context/GameSocketContextProvider";

const Canvas = ({ game }) => {
  const { username } = useUser();
  const { socket, isConnected } = useGameSocket();
  const [selectedWord, setSelectedWord] = useState(null);
  const [words, setWords] = useState([
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
  ]);

  const sendMessage = () => {
    const socketInstance = socket.current;
    
    if (!socketInstance || !isConnected) {
      console.log("Socket not ready:", socketInstance?.readyState);
      return;
    }


    const payload = {
      type: "CHOOSE_WORD",
      current_word: selectedWord,
      username: username
    };

    socketInstance.send(JSON.stringify(payload));
    
  }

  return (
    <div className="w-full h-[50vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-full bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-4 relative">
        {/* Top Bar */}
        <div className="absolute top-3 left-4 text-sm text-gray-400">
          Drawing Canvas
        </div>

        {/* Canvas Area */}
        <div className="w-full h-[80%] bg-white rounded-xl flex items-center justify-center text-gray-400 text-lg font-medium">
          {!game?.is_started
            ? "Game not started"
            : `Current Player: ${game?.current_player}`}
        </div>
        {game?.current_player === username && (
          <div className="w-full bg-white rounded-xl flex items-center justify-center gap-2 text-gray-400 text-lg font-medium">
            {words.map((word, idx) =>
              <button classname={`${selectedWord === word ? "bg-green-500" : "bg-blue-50"}`} onClick={() => setSelectedWord(word)} className="border p-2 rounded-2xl" id={idx}>
                {word}
              </button>
            )}
            <button onClick={sendMessage} className="border p-2 rounded-2xl">Select this</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
