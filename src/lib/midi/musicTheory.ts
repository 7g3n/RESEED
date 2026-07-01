import type {
  Intensity,
  ProgressionDegree,
  ScaleName,
} from "../../types/midi"
import { pickOne } from "./random"

export const KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const

export const SCALES = [
  "major",
  "minor",
  "dorian",
  "lydian",
  "pentatonic",
] as const satisfies readonly ScaleName[]

export const INTENSITIES = [
  "soft",
  "balanced",
  "energetic",
  "chaotic",
] as const satisfies readonly Intensity[]

export const SCALE_INTERVALS: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  pentatonic: [0, 2, 4, 7, 9],
}

export const PROGRESSIONS: readonly ProgressionDegree[][] = [
  [1, 5, 6, 4],
  [6, 4, 1, 5],
  [1, 3, 6, 4],
  [4, 5, 3, 6],
  [6, 5, 4, 5],
]

const NOTE_NAMES = KEYS
const KEY_TO_PITCH_CLASS = new Map<string, number>(
  KEYS.map((key, index) => [key, index]),
)

export function chooseProgression(
  random: () => number,
): ProgressionDegree[] {
  return [...pickOne(PROGRESSIONS, random)]
}

export function scaleDegreeToMidi(
  key: string,
  scale: ScaleName,
  degree: number,
  octave: number,
): number {
  const intervals = SCALE_INTERVALS[scale]
  const root = KEY_TO_PITCH_CLASS.get(key) ?? 0
  const zeroBasedDegree = degree - 1
  const octaveShift = Math.floor(zeroBasedDegree / intervals.length)
  const wrappedDegree =
    ((zeroBasedDegree % intervals.length) + intervals.length) % intervals.length

  return (octave + 1 + octaveShift) * 12 + root + intervals[wrappedDegree]
}

export function midiToNoteName(midi: number): string {
  const pitchClass = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1

  return `${NOTE_NAMES[pitchClass]}${octave}`
}

export function barDurationSeconds(bpm: number): number {
  return (60 / clamp(bpm, 40, 260)) * 4
}

export function beatDurationSeconds(bpm: number): number {
  return 60 / clamp(bpm, 40, 260)
}

export function barsPerChordForIntensity(intensity: Intensity): number {
  return intensity === "soft" || intensity === "balanced" ? 2 : 1
}

export function clampVelocity(value: number): number {
  return Math.min(1, Math.max(0.05, value))
}

export function clampMidi(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
