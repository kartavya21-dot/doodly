import React from "react";

const Canvas = () => {
  return (
    <div className="w-full h-[40vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-full bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-4 relative">
        {/* Top Bar */}
        <div className="absolute top-3 left-4 text-sm text-gray-400">
          Drawing Canvas
        </div>

        {/* Canvas Area */}
        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-gray-400 text-lg font-medium">
          Canvas
        </div>
      </div>
    </div>
  );
};

export default Canvas;