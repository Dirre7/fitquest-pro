class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playBeep(frequency = 800, durationMs = 120, type: OscillatorType = 'sine') {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
      
      this.vibrate(50);
    } catch {
      // Audio playback fallback safe
    }
  }

  public playSetComplete() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 160, 'triangle');
      }, idx * 120);
    });
    this.vibrate([60, 40, 80]);
  }

  public playRestFinished() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 180, 'sine');
      }, idx * 90);
    });
    this.vibrate([100, 50, 100, 50, 200]);
  }

  public playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;

    const melody = [
      { freq: 440, dur: 120 },
      { freq: 554.37, dur: 120 },
      { freq: 659.25, dur: 120 },
      { freq: 880, dur: 350 },
    ];

    let delay = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        this.playBeep(note.freq, note.dur, 'triangle');
      }, delay);
      delay += note.dur;
    });

    this.vibrate([80, 50, 80, 50, 150, 50, 250]);
  }

  public playAchievement() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 200, 'sine');
      }, idx * 100);
    });
    this.vibrate([100, 60, 150]);
  }

  public playWarning() {
    this.playBeep(240, 300, 'sawtooth');
    this.vibrate([150, 100, 150]);
  }

  public vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  }
}

export const sound = new SoundManager();
