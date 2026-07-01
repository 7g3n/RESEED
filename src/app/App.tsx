import { useEffect, useMemo, useRef, useState } from "react"
import { AudioTransport } from "../components/AudioTransport"
import { ControlPanel, type SeedControls } from "../components/ControlPanel"
import { EmptyState } from "../components/EmptyState"
import { EnergyTimeline } from "../components/EnergyTimeline"
import { Header } from "../components/Header"
import { SeedCard } from "../components/SeedCard"
import { UploadDropzone } from "../components/UploadDropzone"
import { WaveformCanvas } from "../components/WaveformCanvas"
import { decodeAudioFile } from "../lib/audio/decodeAudio"
import {
  calculateRmsFrames,
  mixToMono,
  normalize,
  smooth,
} from "../lib/audio/energy"
import { generateSections } from "../lib/audio/sections"
import { calculateWaveformPeaks } from "../lib/audio/waveform"
import { downloadMidi } from "../lib/midi/exportMidi"
import { generateBass } from "../lib/midi/generateBass"
import { generateChords } from "../lib/midi/generateChords"
import { generateLead } from "../lib/midi/generateLead"
import { chooseProgression } from "../lib/midi/musicTheory"
import { playMidiSeed, stopMidiPreview } from "../lib/midi/preview"
import { createPrng, createRandomSeed } from "../lib/midi/random"
import type { AudioAnalysis, AudioFileInfo } from "../types/audio"
import type { MidiSeed } from "../types/midi"

const INITIAL_CONTROLS: SeedControls = {
  bpm: 140,
  key: "C",
  scale: "major",
  intensity: "balanced",
  randomSeed: 481516,
}

export function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<AudioFileInfo | null>(null)
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [controls, setControls] = useState<SeedControls>(INITIAL_CONTROLS)
  const [seeds, setSeeds] = useState<MidiSeed[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playingSeedId, setPlayingSeedId] = useState<string | null>(null)

  const analysisWithSections = useMemo<AudioAnalysis | null>(() => {
    if (!analysis) {
      return null
    }

    return {
      ...analysis,
      sections: generateSections(
        analysis.duration,
        controls.bpm,
        analysis.energyFrames,
      ),
    }
  }, [analysis, controls.bpm])

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    return () => stopMidiPreview()
  }, [])

  async function handleFileSelected(file: File) {
    setIsLoading(true)
    setUploadError(null)
    setPreviewError(null)
    setSeeds([])
    stopAudio()
    stopMidiPreview()
    setPlayingSeedId(null)

    try {
      const buffer = await decodeAudioFile(file)
      const monoSamples = mixToMono(buffer)
      const waveformPeaks = calculateWaveformPeaks(monoSamples, 1500)
      const rmsWindow = Math.max(1024, Math.floor(buffer.sampleRate * 0.08))
      const energyFrames = smooth(
        normalize(calculateRmsFrames(monoSamples, rmsWindow)),
        4,
      )
      const nextAudioUrl = URL.createObjectURL(file)

      setAudioUrl(nextAudioUrl)
      setFileInfo({
        name: file.name,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        size: file.size,
      })
      setAnalysis({
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        waveformPeaks,
        energyFrames,
        sections: [],
      })
      setCurrentTime(0)
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Unable to read this audio file.",
      )
      setAudioUrl(null)
      setFileInfo(null)
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePlayPauseAudio() {
    const audio = audioRef.current

    if (!audio || !audioUrl) {
      return
    }

    if (isPlayingAudio) {
      audio.pause()
      setIsPlayingAudio(false)
      return
    }

    try {
      await audio.play()
      setIsPlayingAudio(true)
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "The browser blocked audio playback.",
      )
    }
  }

  function stopAudio() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.pause()
    audio.currentTime = 0
    setCurrentTime(0)
    setIsPlayingAudio(false)
  }

  function handleSeek(time: number) {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.currentTime = time
    setCurrentTime(time)
  }

  function handleRandomSeed() {
    setControls((current) => ({
      ...current,
      randomSeed: createRandomSeed(),
    }))
  }

  function handleGenerateSeeds() {
    const progression = chooseProgression(createPrng(controls.randomSeed))
    const options = {
      ...controls,
      progression,
    }

    stopMidiPreview()
    setPlayingSeedId(null)
    setPreviewError(null)
    setSeeds([
      generateChords(options),
      generateBass(options),
      generateLead(options),
    ])
  }

  async function handlePreviewSeed(seed: MidiSeed) {
    setPreviewError(null)
    setPlayingSeedId(seed.id)

    try {
      await playMidiSeed(seed, () => setPlayingSeedId(null))
    } catch (error) {
      setPlayingSeedId(null)
      setPreviewError(
        error instanceof Error
          ? error.message
          : "Unable to preview this MIDI seed.",
      )
    }
  }

  function handleStopSeed() {
    stopMidiPreview()
    setPlayingSeedId(null)
  }

  return (
    <div className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Header />

        <main className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-6">
            <UploadDropzone
              fileInfo={fileInfo}
              isLoading={isLoading}
              error={uploadError}
              onFileSelected={handleFileSelected}
            />
            <ControlPanel
              controls={controls}
              canGenerate={Boolean(analysisWithSections)}
              onChange={setControls}
              onRandomSeed={handleRandomSeed}
              onGenerate={handleGenerateSeeds}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            {analysisWithSections ? (
              <>
                <WaveformCanvas
                  peaks={analysisWithSections.waveformPeaks}
                  duration={analysisWithSections.duration}
                  currentTime={currentTime}
                />
                <AudioTransport
                  duration={analysisWithSections.duration}
                  currentTime={currentTime}
                  isPlaying={isPlayingAudio}
                  disabled={!audioUrl}
                  onPlayPause={handlePlayPauseAudio}
                  onStop={stopAudio}
                  onSeek={handleSeek}
                />
                <EnergyTimeline
                  energyFrames={analysisWithSections.energyFrames}
                  sections={analysisWithSections.sections}
                  duration={analysisWithSections.duration}
                />
              </>
            ) : (
              <EmptyState
                title="Waiting for audio"
                description="Upload audio to let the first seeds appear."
              />
            )}

            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Generated Seeds
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Sprout chords, root motion, and arp fragments for your DAW.
                  </p>
                </div>
                {previewError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {previewError}
                  </p>
                ) : null}
              </div>

              {seeds.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-3">
                  {seeds.map((seed) => (
                    <SeedCard
                      key={seed.id}
                      seed={seed}
                      isPlaying={playingSeedId === seed.id}
                      onPreview={() => handlePreviewSeed(seed)}
                      onStop={handleStopSeed}
                      onDownload={() => downloadMidi(seed)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No MIDI seeds yet"
                  description="Set BPM, key, scale, and intensity, then generate three remix fragments."
                />
              )}
            </section>
          </div>
        </main>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlayingAudio(false)
          setCurrentTime(0)
          if (audioRef.current) {
            audioRef.current.currentTime = 0
          }
        }}
        onPause={() => setIsPlayingAudio(false)}
      />
    </div>
  )
}
