type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

let sharedAudioContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (sharedAudioContext) {
    return sharedAudioContext
  }

  const AudioContextConstructor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext

  if (!AudioContextConstructor) {
    throw new Error("This browser does not support the Web Audio API.")
  }

  sharedAudioContext = new AudioContextConstructor()
  return sharedAudioContext
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const audioContext = getAudioContext()
  const fileData = await file.arrayBuffer()

  try {
    return await audioContext.decodeAudioData(fileData.slice(0))
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The browser could not decode this audio file."
    throw new Error(`Unable to decode audio: ${message}`)
  }
}
