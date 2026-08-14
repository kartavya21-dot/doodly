import React, { useState, useEffect } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import {
  getMusicVolume,
  getSfxVolume,
  setMusicVolume as saveMusicVolume,
  setSfxVolume as saveSfxVolume,
} from "../utils/soundManager";

export default function VolumeControls() {
  const [musicVol, setMusicVol] = useState(getMusicVolume());
  const [sfxVol, setSfxVol] = useState(getSfxVolume());

  const [prevMusicVol, setPrevMusicVol] = useState(musicVol > 0 ? musicVol : 0.5);
  const [prevSfxVol, setPrevSfxVol] = useState(sfxVol > 0 ? sfxVol : 0.5);

  const handleMusicChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    saveMusicVolume(val);
    if (val > 0) setPrevMusicVol(val);
  };

  const handleSfxChange = (e) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    saveSfxVolume(val);
    if (val > 0) setPrevSfxVol(val);
  };

  const toggleMusicMute = () => {
    if (musicVol > 0) {
      setMusicVol(0);
      saveMusicVolume(0);
    } else {
      setMusicVol(prevMusicVol);
      saveMusicVolume(prevMusicVol);
    }
  };

  const toggleSfxMute = () => {
    if (sfxVol > 0) {
      setSfxVol(0);
      saveSfxVolume(0);
    } else {
      setSfxVol(prevSfxVol);
      saveSfxVolume(prevSfxVol);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 border border-slate-200 px-2 py-1.5 sm:px-3.5 sm:py-1.5 rounded-2xl shadow-sm text-xs shrink-0 select-none">
      {/* Music Volume Section */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={toggleMusicMute}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          title="Toggle Background Music"
        >
          <Music className={`w-3.5 h-3.5 ${musicVol === 0 ? "opacity-40" : "text-blue-600 animate-pulse"}`} />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={musicVol}
          onChange={handleMusicChange}
          className="w-12 xs:w-14 sm:w-16 h-1.5 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-blue-600"
          title={`Music Volume: ${Math.round(musicVol * 100)}%`}
        />
      </div>

      {/* Vertical separator */}
      <div className="w-[1px] h-4 bg-slate-200" />

      {/* SFX Volume Section */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={toggleSfxMute}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-green-600 transition-colors cursor-pointer"
          title="Toggle Sound Effects"
        >
          {sfxVol === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-green-600" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={sfxVol}
          onChange={handleSfxChange}
          className="w-12 xs:w-14 sm:w-16 h-1.5 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-green-600"
          title={`SFX Volume: ${Math.round(sfxVol * 100)}%`}
        />
      </div>
    </div>
  );
}
