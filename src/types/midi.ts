export type SeedType = "chords" | "bass" | "lead"

export type ScaleName = "major" | "minor" | "dorian" | "lydian" | "pentatonic"

export type Intensity = "soft" | "balanced" | "energetic" | "chaotic"

export type MidiNote = {
  name: string
  midi: number
  time: number
  duration: number
  velocity: number
}

export type MidiSeed = {
  id: string
  type: SeedType
  name: string
  bpm: number
  key: string
  scale: string
  notes: MidiNote[]
}

export type ProgressionDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type MidiGenerationOptions = {
  bpm: number
  key: string
  scale: ScaleName
  intensity: Intensity
  randomSeed: number
  progression: ProgressionDegree[]
}
