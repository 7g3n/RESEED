export type Section = {
  id: string
  name: string
  startTime: number
  endTime: number
  energyAverage: number
  recommendedRole: string
}

export type AudioAnalysis = {
  duration: number
  sampleRate: number
  channels: number
  waveformPeaks: number[]
  energyFrames: number[]
  sections: Section[]
}

export type AudioFileInfo = {
  name: string
  duration: number
  sampleRate: number
  channels: number
  size: number
}
