let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Automatically resume context on first click/tap
if (typeof window !== "undefined") {
  window.addEventListener("click", () => {
    try {
      getAudioContext();
    } catch (e) {
      console.warn("AudioContext initialization failed:", e);
    }
  }, { once: true });
}

function playNote(freq, type, duration, startTime, volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) {
    console.error("Failed to play synth note:", e);
  }
}

export function playJoinSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  // C5 to G5 ascending chime
  playNote(523.25, "sine", 0.08, now, 0.08);
  playNote(783.99, "sine", 0.15, now + 0.07, 0.08);
}

export function playStartSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  // Major arpeggio fanfare (C4 -> E4 -> G4 -> C5)
  playNote(261.63, "triangle", 0.1, now, 0.15);
  playNote(329.63, "triangle", 0.1, now + 0.08, 0.15);
  playNote(392.00, "triangle", 0.1, now + 0.16, 0.15);
  playNote(523.25, "triangle", 0.35, now + 0.24, 0.15);
}

export function playChooseWordSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(350, now);
    // Sci-fi sweep upwards
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.16);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {
    console.error("Failed to play ChooseWord sound:", e);
  }
}

export function playTickSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  // Short high-pitched transient blip
  playNote(1050, "sine", 0.04, now, 0.03);
}

export function playRoundWonSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  // Celebratory pentatonic ascending pattern (confetti feel)
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
  notes.forEach((freq, idx) => {
    playNote(freq, "sine", 0.12, now + idx * 0.06, 0.06);
  });
}

export function playVictorySound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  // Retro 8-bit fanfare melody
  const tempo = 0.12;
  const melody = [
    { freq: 523.25, dur: tempo },       // C5
    { freq: 392.00, dur: tempo },       // G4
    { freq: 329.63, dur: tempo },       // E4
    { freq: 440.00, dur: tempo },       // A4
    { freq: 493.88, dur: tempo },       // B4
    { freq: 523.25, dur: tempo * 3.5 }, // C5 (held)
  ];

  melody.forEach((note, idx) => {
    playNote(note.freq, "triangle", note.dur, now + idx * tempo, 0.12);
  });
}
