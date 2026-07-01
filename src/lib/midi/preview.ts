import * as Tone from "tone"
import type { MidiSeed } from "../../types/midi"

let activeInstrument: { dispose: () => unknown } | null = null
let stopTimer: number | null = null

export async function playMidiSeed(
  seed: MidiSeed,
  onEnded?: () => void,
): Promise<void> {
  stopMidiPreview()
  await Tone.start()

  Tone.Transport.bpm.value = seed.bpm
  Tone.Transport.position = 0

  if (seed.type === "chords") {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.18, sustain: 0.52, release: 0.8 },
    }).toDestination()
    synth.volume.value = -10
    activeInstrument = synth

    seed.notes.forEach((note) => {
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity,
        )
      }, note.time)
    })
  } else if (seed.type === "bass") {
    const synth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      filter: { Q: 1.3, type: "lowpass", rolloff: -24 },
      envelope: { attack: 0.006, decay: 0.22, sustain: 0.38, release: 0.12 },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.15,
        sustain: 0.2,
        release: 0.08,
        baseFrequency: 90,
        octaves: 2.4,
      },
    }).toDestination()
    synth.volume.value = -8
    activeInstrument = synth

    seed.notes.forEach((note) => {
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity,
        )
      }, note.time)
    })
  } else {
    const synth = new Tone.AMSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0.32, release: 0.24 },
    }).toDestination()
    synth.volume.value = -9
    activeInstrument = synth

    seed.notes.forEach((note) => {
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity,
        )
      }, note.time)
    })
  }

  Tone.Transport.start("+0.03", 0)

  const seedEnd = seed.notes.reduce(
    (end, note) => Math.max(end, note.time + note.duration),
    0,
  )

  stopTimer = window.setTimeout(() => {
    stopMidiPreview()
    onEnded?.()
  }, seedEnd * 1000 + 400)
}

export function stopMidiPreview(): void {
  Tone.Transport.stop()
  Tone.Transport.cancel()

  if (stopTimer !== null) {
    window.clearTimeout(stopTimer)
    stopTimer = null
  }

  if (activeInstrument) {
    activeInstrument.dispose()
    activeInstrument = null
  }
}
