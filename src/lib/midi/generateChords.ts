import type { MidiGenerationOptions, MidiNote, MidiSeed } from "../../types/midi"
import { createPrng } from "./random"
import {
  barDurationSeconds,
  barsPerChordForIntensity,
  clampMidi,
  clampVelocity,
  midiToNoteName,
  scaleDegreeToMidi,
} from "./musicTheory"

export function generateChords(options: MidiGenerationOptions): MidiSeed {
  const random = createPrng(options.randomSeed + 101)
  const barDuration = barDurationSeconds(options.bpm)
  const barsPerChord = barsPerChordForIntensity(options.intensity)
  const notes: MidiNote[] = []

  for (let bar = 0; bar < 16; bar += barsPerChord) {
    const progressionIndex =
      Math.floor(bar / barsPerChord) % options.progression.length
    const degree = options.progression[progressionIndex]
    const chord = buildFutureBassChord(
      degree,
      options.key,
      options.scale,
      random,
    )
    const chordDuration = barDuration * barsPerChord * 0.94
    const time = bar * barDuration

    chord.forEach((midi, voiceIndex) => {
      const voiceDelay = voiceIndex * 0.006 * random()
      notes.push({
        name: midiToNoteName(midi),
        midi,
        time: time + voiceDelay,
        duration: chordDuration,
        velocity: clampVelocity(0.58 + random() * 0.18),
      })
    })
  }

  return {
    id: `chords-${options.key}-${options.bpm}-${options.randomSeed}`,
    type: "chords",
    name: "Sprout chords",
    bpm: options.bpm,
    key: options.key,
    scale: options.scale,
    notes,
  }
}

function buildFutureBassChord(
  degree: number,
  key: string,
  scale: MidiGenerationOptions["scale"],
  random: () => number,
): number[] {
  const root = scaleDegreeToMidi(key, scale, degree, 3)
  const fifth = scaleDegreeToMidi(key, scale, degree + 4, 3)
  const third = scaleDegreeToMidi(key, scale, degree + 2, 4)
  const ninth = scaleDegreeToMidi(key, scale, degree + 8, 4)
  const seventh = scaleDegreeToMidi(key, scale, degree + 6, 4)
  const upperRoot = scaleDegreeToMidi(key, scale, degree, 5)
  const chord = [root, fifth, third, ninth]

  if (random() > 0.42) {
    chord.push(seventh)
  }

  if (random() > 0.66) {
    chord.push(upperRoot)
  }

  return [...new Set(chord.map((note) => clampMidi(note, 40, 88)))].sort(
    (a, b) => a - b,
  )
}
