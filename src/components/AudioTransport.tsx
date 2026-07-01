import { Pause, Play, Square } from "lucide-react"
import { formatPreciseTime } from "../lib/format"

type AudioTransportProps = {
  duration: number
  currentTime: number
  isPlaying: boolean
  disabled: boolean
  onPlayPause: () => void
  onStop: () => void
  onSeek: (time: number) => void
}

export function AudioTransport({
  duration,
  currentTime,
  isPlaying,
  disabled,
  onPlayPause,
  onStop,
  onSeek,
}: AudioTransportProps) {
  return (
    <section className="panel flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="control-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-sprout/40 disabled:opacity-50"
          onClick={onPlayPause}
          disabled={disabled}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause aria-hidden="true" size={18} />
          ) : (
            <Play aria-hidden="true" size={18} />
          )}
        </button>
        <button
          type="button"
          className="control-focus inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-sprout/40 disabled:opacity-50"
          onClick={onStop}
          disabled={disabled}
          aria-label="Stop audio"
        >
          <Square aria-hidden="true" size={17} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <input
          className="range-thin w-full"
          type="range"
          min={0}
          max={Math.max(duration, 0.01)}
          step={0.01}
          value={Math.min(currentTime, duration)}
          disabled={disabled}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Audio playback position"
        />
      </div>

      <div className="min-w-32 text-right text-sm font-medium tabular-nums text-slate-600">
        {disabled
          ? "Waiting for audio"
          : `${formatPreciseTime(currentTime)} / ${formatPreciseTime(duration)}`}
      </div>
    </section>
  )
}
