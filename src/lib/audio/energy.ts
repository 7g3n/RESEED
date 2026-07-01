export function mixToMono(buffer: AudioBuffer): Float32Array {
  const channelCount = buffer.numberOfChannels
  const output = new Float32Array(buffer.length)

  if (channelCount === 0) {
    return output
  }

  for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
    const channelData = buffer.getChannelData(channelIndex)
    for (let sampleIndex = 0; sampleIndex < buffer.length; sampleIndex += 1) {
      output[sampleIndex] += channelData[sampleIndex] / channelCount
    }
  }

  return output
}

export function calculateRmsFrames(
  samples: Float32Array,
  windowSize: number,
): number[] {
  if (samples.length === 0) {
    return []
  }

  const safeWindowSize = Math.max(1, Math.floor(windowSize))
  const frames: number[] = []

  for (let start = 0; start < samples.length; start += safeWindowSize) {
    const end = Math.min(samples.length, start + safeWindowSize)
    let sum = 0

    for (let index = start; index < end; index += 1) {
      sum += samples[index] * samples[index]
    }

    frames.push(Math.sqrt(sum / Math.max(1, end - start)))
  }

  return frames
}

export function normalize(values: number[]): number[] {
  if (values.length === 0) {
    return []
  }

  const max = Math.max(...values)

  if (max <= 0) {
    return values.map(() => 0)
  }

  return values.map((value) => Math.min(1, value / max))
}

export function smooth(values: number[], radius = 2): number[] {
  if (values.length === 0) {
    return []
  }

  const safeRadius = Math.max(0, Math.floor(radius))

  return values.map((_, index) => {
    const start = Math.max(0, index - safeRadius)
    const end = Math.min(values.length - 1, index + safeRadius)
    let sum = 0
    let count = 0

    for (let cursor = start; cursor <= end; cursor += 1) {
      sum += values[cursor]
      count += 1
    }

    return sum / count
  })
}
