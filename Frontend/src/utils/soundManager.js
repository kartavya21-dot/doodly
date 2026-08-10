import clickAudio from "../assets/sounds/click.mp3";
import doorOpenAudio from "../assets/sounds/door_open.mp3";
import doorClosingAudio from "../assets/sounds/door_closing.mp3";
import errorAudio from "../assets/sounds/error.mp3";
import gunSoundAudio from "../assets/sounds/gun_sound.mp3";
import pageFlipAudio from "../assets/sounds/page_flip.mp3";
import paperCrumbleAudio from "../assets/sounds/paper_crumble.mp3";
import successWinAudio from "../assets/sounds/success_win.mp3";
import bgMusicAudio from "../assets/sounds/bg_music.mp3";
import tadaSound from "../assets/sounds/tada.mp3"

const sounds = {
  bgMusic: new Audio(bgMusicAudio),
  doorOpen: new Audio(doorOpenAudio),
  doorClosing: new Audio(doorClosingAudio),
  error: new Audio(errorAudio),
  paperCrumble: new Audio(paperCrumbleAudio),
  pageFlip: new Audio(pageFlipAudio),
  gunSound: new Audio(gunSoundAudio),
  successWin: new Audio(successWinAudio),
  click: new Audio(clickAudio),
  tada: new Audio(tadaSound),
};

export function playSound(name) {
  const sound = sounds[name];

  if (!sound) {
    console.warn(`Sound "${name}" not found in soundManager.`);
    return;
  }

  sound.currentTime = 0;
  sound.play().catch((e) => {
    console.debug(`Failed to play sound "${name}":`, e);
  });
}

export function stopSound(name) {
  const sound = sounds[name];
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
  }
}

export function loopSound(name) {
  const sound = sounds[name];
  if (sound) {
    sound.loop = true;
    sound.play().catch((e) => {
      console.debug(`Failed to loop sound "${name}":`, e);
    });
  }
}
