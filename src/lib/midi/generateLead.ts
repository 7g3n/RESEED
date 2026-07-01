import type { MidiGenerationOptions, MidiNote, MidiSeed } from "../../types/midi"
import { createPrng } from "./random"
import {
  beatDurationSeconds,
  clampMidi,
  clampVelocity,
  midiToNoteName,
  scaleDegreeToMidi,
} from "./musicTheory"

const MOTIFS = [
  [0, 2, 4, 7, 4, 2, 5, 8],
  [7, 5, 4, 2, 0, 4, 2, 5],
  [0, 4, 7, 9, 7, 4, 11, 8],
] as const

const STEP_BEATS: Record<MidiGenerationOptions["intensity"], number> = {
  soft: 1,
  balanced: 0.5,
  energetic: 0.5,
  chaotic: 0.25,
}

const SKIP_CHANCE: Record<MidiGenerationOptions["intensity"], number> = {
  soft: 0.42,
  balanced: 0.24,
  energetic: 0.14,
  chaotic: 0.08,
}

export function generateLead(options: MidiGenerationOptions): MidiSeed {
  const random = createPrng(options.randomSeed + 307)
  const beatDuration = beatDurationSeconds(options.bpm)
  const stepBeats = STEP_BEATS[options.intensity]
  const totalBeats = 16 * 4
  const notes: MidiNote[] = []

  for (let beat = 0; beat < totalBeats; beat += stepBeats) {
    if (random() < SKIP_CHANCE[options.intensity]) {
      continue
    }

    const bar = Math.floor(beat / 4)
    const progressionIndex = Math.floor(bar / 2) % options.progression.length
    const rootDegree = options.progression[progressionIndex]
    const motif = MOTIFS[Math.floor(bar / 4) % MOTIFS.length]
    const motifIndex = Math.floor(beat / stepBeats) % motif.length
    const leap = random() > 0.82 ? 7 : 0
    const degree = rootDegree + motif[motifIndex] + leap
    const octave =
      5 +
      (bar >= 8 ? 1 : 0) +
      (options.intensity === "chaotic" && random() > 0.72 ? 1 : 0)
    const midi = clampMidi(
      scaleDegreeToMidi(options.key, options.scale, degree, octave),
      60,
      96,
    )

    notes.push({
      name: midiToNoteName(midi),
      midi,
      time: beat * beatDuration,
      duration: beatDuration * stepBeats * 0.76,
      velocity: clampVelocity(0.5 + random() * 0.34),
    })
  }

  return {
    id: `lead-${options.key}-${options.bpm}-${options.randomSeed}`,
    type: "lead",
    name: "Arp fragment",
    bpm: options.bpm,
    key: options.key,
    scale: options.scale,
    notes,
  }
}
