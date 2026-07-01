export function calculateWaveformPeaks(
  samples: Float32Array,
  bucketCount = 1200,
): number[] {
  if (samples.length === 0) {
    return []
  }

  const safeBucketCount = Math.max(1, Math.min(bucketCount, samples.length))
  const bucketSize = Math.ceil(samples.length / safeBucketCount)
  const peaks: number[] = []

  for (let bucketIndex = 0; bucketIndex < safeBucketCount; bucketIndex += 1) {
    const start = bucketIndex * bucketSize
    const end = Math.min(samples.length, start + bucketSize)
    let peak = 0

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      peak = Math.max(peak, Math.abs(samples[sampleIndex]))
    }

    peaks.push(Math.min(1, peak))
  }

  return peaks
}
