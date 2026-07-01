import type { MidiSeed } from "../../types/midi"

const TICKS_PER_QUARTER = 480

type MidiEvent = {
  tick: number
  order: number
  bytes: number[]
}

export function buildMidiFile(seed: MidiSeed): Uint8Array {
  const tempo = Math.round(60_000_000 / seed.bpm)
  const events: MidiEvent[] = [
    {
      tick: 0,
      order: 0,
      bytes: [0xff, 0x51, 0x03, (tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff],
    },
    {
      tick: 0,
      order: 1,
      bytes: [0xc0, programForSeed(seed.type)],
    },
  ]

  seed.notes.forEach((note) => {
    const startTick = secondsToTicks(note.time, seed.bpm)
    const endTick = secondsToTicks(note.time + note.duration, seed.bpm)
    const velocity = Math.max(1, Math.min(127, Math.round(note.velocity * 127)))

    events.push({
      tick: startTick,
      order: 3,
      bytes: [0x90, clampMidiByte(note.midi), velocity],
    })
    events.push({
      tick: Math.max(startTick + 1, endTick),
      order: 2,
      bytes: [0x80, clampMidiByte(note.midi), 0],
    })
  })

  events.sort((a, b) => a.tick - b.tick || a.order - b.order)

  const trackData: number[] = []
  let previousTick = 0

  events.forEach((event) => {
    const delta = Math.max(0, event.tick - previousTick)
    trackData.push(...writeVariableLength(delta), ...event.bytes)
    previousTick = event.tick
  })

  trackData.push(...writeVariableLength(1), 0xff, 0x2f, 0x00)

  return new Uint8Array([
    ...ascii("MThd"),
    ...uint32(6),
    ...uint16(0),
    ...uint16(1),
    ...uint16(TICKS_PER_QUARTER),
    ...ascii("MTrk"),
    ...uint32(trackData.length),
    ...trackData,
  ])
}

export function downloadMidi(seed: MidiSeed): void {
  const midiFile = buildMidiFile(seed)
  const arrayBuffer = new ArrayBuffer(midiFile.byteLength)
  new Uint8Array(arrayBuffer).set(midiFile)
  const blob = new Blob([arrayBuffer], { type: "audio/midi" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = getMidiFilename(seed)
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 500)
}

export function getMidiFilename(seed: MidiSeed): string {
  return `reseed_${seed.type}_${seed.key}_${seed.bpm}.mid`.replace("#", "sharp")
}

function secondsToTicks(seconds: number, bpm: number): number {
  return Math.round((seconds * bpm * TICKS_PER_QUARTER) / 60)
}

function programForSeed(type: MidiSeed["type"]): number {
  if (type === "bass") {
    return 38
  }

  if (type === "lead") {
    return 81
  }

  return 88
}

function clampMidiByte(value: number): number {
  return Math.min(127, Math.max(0, Math.round(value)))
}

function writeVariableLength(value: number): number[] {
  let buffer = value & 0x7f
  const bytes: number[] = []
  let cursor = value >> 7

  while (cursor > 0) {
    buffer <<= 8
    buffer |= (cursor & 0x7f) | 0x80
    cursor >>= 7
  }

  while (true) {
    bytes.push(buffer & 0xff)
    if (buffer & 0x80) {
      buffer >>= 8
    } else {
      break
    }
  }

  return bytes
}

function ascii(value: string): number[] {
  return value.split("").map((character) => character.charCodeAt(0))
}

function uint16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff]
}

function uint32(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ]
}
