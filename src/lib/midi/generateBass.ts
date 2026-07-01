import type { MidiGenerationOptions, MidiNote, MidiSeed } from "../../types/midi"
import { createPrng } from "./random"
import {
  barDurationSeconds,
  barsPerChordForIntensity,
  beatDurationSeconds,
  clampMidi,
  clampVelocity,
  midiToNoteName,
  scaleDegreeToMidi,
} from "./musicTheory"

const PATTERNS: Record<MidiGenerationOptions["intensity"], number[]> = {
  soft: [0, 2.5],
  balanced: [0, 1.5, 2.5, 3.5],
  energetic: [0, 0.75, 1.5, 2.5, 3, 3.5],
  chaotic: [0, 0.5, 0.75, 1.5, 2, 2.5, 3, 3.5, 3.75],
}

export function generateBass(options: MidiGenerationOptions): MidiSeed {
  const random = createPrng(options.randomSeed + 211)
  const barDuration = barDurationSeconds(options.bpm)
  const beatDuration = beatDurationSeconds(options.bpm)
  const barsPerChord = barsPerChordForIntensity(options.intensity)
  const pattern = PATTERNS[options.intensity]
  const notes: MidiNote[] = []

  for (let bar = 0; bar < 16; bar += 1) {
    const progressionIndex =
      Math.floor(bar / barsPerChord) % options.progression.length
    const degree = options.progression[progressionIndex]
    const root = clampMidi(
      scaleDegreeToMidi(options.key, options.scale, degree, 2),
      32,
      52,
    )

    pattern.forEach((beatOffset, stepIndex) => {
      if (options.intensity === "chaotic" && random() < 0.14) {
        return
      }

      const octaveKick =
        stepIndex > 0 && random() > intensityOctaveChance(options.intensity)
          ? 12
          : 0
      const midi = clampMidi(root + octaveKick, 32, 55)
      const duration =
        beatDuration *
        (options.intensity === "soft" ? 0.72 : 0.42 + random() * 0.22)

      notes.push({
        name: midiToNoteName(midi),
        midi,
        time: bar * barDuration + beatOffset * beatDuration,
        duration,
        velocity: clampVelocity(0.68 + random() * 0.24),
      })
    })
  }

  return {
    id: `bass-${options.key}-${options.bpm}-${options.randomSeed}`,
    type: "bass",
    name: "Root motion",
    bpm: options.bpm,
    key: options.key,
    scale: options.scale,
    notes,
  }
}

function intensityOctaveChance(
  intensity: MidiGenerationOptions["intensity"],
): number {
  if (intensity === "soft") {
    return 0.9
  }

  if (intensity === "balanced") {
    return 0.78
  }

  if (intensity === "energetic") {
    return 0.68
  }

  return 0.58
}
