import type { Section } from "../../types/audio"

const SECTION_NAMES = ["intro", "build", "drop", "break", "drop 2", "outro"]

const SECTION_ROLES = [
  "ambient intro",
  "drum build",
  "main drop",
  "breakdown",
  "final drop",
  "outro",
]

export function generateSections(
  duration: number,
  bpm: number,
  energyFrames: number[],
): Section[] {
  if (!Number.isFinite(duration) || duration <= 0) {
    return []
  }

  const safeBpm = clamp(bpm, 60, 220)
  const barDuration = (60 / safeBpm) * 4
  const sixteenBarDuration = barDuration * 16
  const idealCount = Math.ceil(duration / sixteenBarDuration)
  const sectionCount = clamp(Math.max(1, idealCount), 1, SECTION_NAMES.length)
  const blockDuration =
    sixteenBarDuration * sectionCount <= duration * 1.2
      ? sixteenBarDuration
      : duration / sectionCount

  return Array.from({ length: sectionCount }, (_, index) => {
    const startTime = index * blockDuration
    const endTime =
      index === sectionCount - 1
        ? duration
        : Math.min(duration, (index + 1) * blockDuration)

    return {
      id: `section-${index + 1}`,
      name: SECTION_NAMES[index],
      startTime,
      endTime,
      energyAverage: getEnergyAverage(
        startTime,
        endTime,
        duration,
        energyFrames,
      ),
      recommendedRole: SECTION_ROLES[index],
    }
  }).filter((section) => section.endTime > section.startTime)
}

function getEnergyAverage(
  startTime: number,
  endTime: number,
  duration: number,
  energyFrames: number[],
): number {
  if (energyFrames.length === 0 || duration <= 0) {
    return 0
  }

  const startIndex = Math.floor((startTime / duration) * energyFrames.length)
  const endIndex = Math.max(
    startIndex + 1,
    Math.ceil((endTime / duration) * energyFrames.length),
  )
  const slice = energyFrames.slice(
    clamp(startIndex, 0, energyFrames.length - 1),
    clamp(endIndex, 1, energyFrames.length),
  )

  if (slice.length === 0) {
    return 0
  }

  return slice.reduce((sum, value) => sum + value, 0) / slice.length
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
