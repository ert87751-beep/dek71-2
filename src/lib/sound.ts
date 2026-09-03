// Web Audio API chime generator for instant, zero-dependency sound alerts

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a high-priority alert chime when an early departure is registered
 */
export function playEarlyDepartureAlertSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Sequence of tones (Chime: E5 -> G#5 -> B5 -> E6)
    const tones = [
      { freq: 659.25, time: 0, duration: 0.15 },    // E5
      { freq: 830.61, time: 0.12, duration: 0.15 },  // G#5
      { freq: 987.77, time: 0.24, duration: 0.18 },  // B5
      { freq: 1318.51, time: 0.38, duration: 0.45 }, // E6 (lingering chime)
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Volume envelope (smooth attack and decay)
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Audio alert could not play (user interaction may be required):', err);
  }
}

/**
 * Play gentle confirmation sound for regular actions
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('Success chime failed:', e);
  }
}
