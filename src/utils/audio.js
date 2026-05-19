export function beep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    const t = ctx.currentTime
    if (type === 'correct') {
      osc.type = 'sine'
      ;[523,659,784,1047].forEach((f,i) => osc.frequency.setValueAtTime(f, t+i*0.1))
      gain.gain.setValueAtTime(0.3,t); gain.gain.exponentialRampToValueAtTime(0.01,t+0.7)
      osc.start(t); osc.stop(t+0.7)
    } else if (type === 'wrong') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220,t); osc.frequency.setValueAtTime(160,t+0.2)
      gain.gain.setValueAtTime(0.25,t); gain.gain.exponentialRampToValueAtTime(0.01,t+0.4)
      osc.start(t); osc.stop(t+0.4)
    } else if (type === 'open') {
      osc.type = 'sine'
      ;[400,700,1000].forEach((f,i) => osc.frequency.setValueAtTime(f, t+i*0.15))
      gain.gain.setValueAtTime(0.2,t); gain.gain.exponentialRampToValueAtTime(0.01,t+0.5)
      osc.start(t); osc.stop(t+0.5)
    } else {
      osc.frequency.setValueAtTime(440,t)
      gain.gain.setValueAtTime(0.15,t); gain.gain.exponentialRampToValueAtTime(0.01,t+0.1)
      osc.start(t); osc.stop(t+0.1)
    }
  } catch(e) {}
}
