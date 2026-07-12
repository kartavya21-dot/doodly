import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContextProvider";
import { useGameSocket } from "../context/GameSocketContextProvider";
import Board from "../Canvas/Board";

const Canvas = () => {
  const { username } = useUser();
  const { socket, game, selectedWord, setSelectedWord, isSent, timeLeft, sendMessage, userPlaying } = useGameSocket();
  const [words, setWords] = useState([
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
  ]);

  const sendSelectedWord = () => {
    const payload = {
      type: "CHOOSE_WORD",
      current_word: selectedWord,
      username: username,
    };
    sendMessage(payload);
  };

  return (
    <div className="w-full flex justify-center p-6">
      <div className="w-full max-w-6xl bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl p-6 relative overflow-hidden">
        {/* Top section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-white font-bold text-2xl">Doodly 🎨</h2>

            <p className="text-gray-400 text-sm">
              {!game?.is_started
                ? "Waiting for game to start"
                : `Current Player: ${game?.current_player}`}
            </p>
          </div>

          {/* Timer */}
          {userPlaying && <div
            className={`
              min-w-[90px]
              h-20
              rounded-full 
              flex items-center justify-center
              border-4 text-xl font-bold px-4
              transition-all duration-500
              ${
                timeLeft === 0
                  ? "border-gray-500 text-gray-300"
                  : timeLeft <= 10
                    ? "border-red-500 text-red-500 animate-pulse"
                    : "border-indigo-500 text-white"
              }
            `}
          >
            {timeLeft === 0 ? "Time Ended" : timeLeft}
          </div>}
        </div>

        {/* Canvas */}
        <div className="w-full h-[350px] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center shadow-inner">
          <Board/>
        </div>

        {/* Word selection */}
        {userPlaying && (
          <div className="mt-6">
            <p className="text-white mb-3 font-semibold">Choose a word</p>

            <div className="flex flex-wrap gap-4">
              {words.map((word) => (
                <button
                  key={word}
                  onClick={() =>{ console.log(word); setSelectedWord(word);}}
                  className={`
                  px-6 py-3 rounded-2xl
                  transition-all duration-300
                  font-semibold
                  shadow-lg
                  ${
                    selectedWord === word
                      ? "bg-green-500 text-white scale-110"
                      : "bg-white text-gray-800 hover:scale-105 hover:bg-indigo-100"
                  }
                `}
                >
                  {word}
                </button>
              ))}
            </div>

            <button
              disabled={!selectedWord || isSent}
              onClick={sendSelectedWord}
              className="
              mt-6
              px-8 py-3
              rounded-2xl
              bg-indigo-600
              text-white
              font-bold
              hover:bg-indigo-700
              transition-all
              disabled:bg-gray-600
              disabled:cursor-not-allowed
            "
            >
              {isSent ? "Sent ✓" : "Select Word"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
