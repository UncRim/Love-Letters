/**
 * Short percussive “stamp / thud” using Web Audio API (no asset files).
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AC) return null;
    if (!sharedCtx || sharedCtx.state === "closed") {
      sharedCtx = new AC();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

export async function playStampSound(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    await ctx.resume();
  } catch {
    /* ignore */
  }

  const now = ctx.currentTime;
  const duration = 0.11;
  const sampleRate = ctx.sampleRate;
  const n = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, n, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 52);
    data[i] = (Math.random() * 2 - 1) * env * 0.42;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;
  filter.Q.value = 0.7;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.72, now);
  nGain.gain.exponentialRampToValueAtTime(0.008, now + 0.16);
  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration + 0.02);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.09);
  const oGain = ctx.createGain();
  oGain.gain.setValueAtTime(0.26, now);
  oGain.gain.exponentialRampToValueAtTime(0.008, now + 0.13);
  osc.connect(oGain);
  oGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}
