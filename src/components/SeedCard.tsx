import clsx from "clsx"
import { Download, Leaf, Pause, Play } from "lucide-react"
import type { MidiSeed } from "../types/midi"

type SeedCardProps = {
  seed: MidiSeed
  isPlaying: boolean
  onPreview: () => void
  onStop: () => void
  onDownload: () => void
}

export function SeedCard({
  seed,
  isPlaying,
  onPreview,
  onStop,
  onDownload,
}: SeedCardProps) {
  const previewNotes = [...new Set(seed.notes.slice(0, 16).map((note) => note.name))]
    .slice(0, 8)
    .join(" ")

  return (
    <article
      className={clsx(
        "rounded-lg border bg-white p-4 transition",
        isPlaying
          ? "border-sprout/60 shadow-glow"
          : "border-slate-200 hover:border-blueglow/70",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-seed bg-seed/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <Leaf aria-hidden="true" size={13} />
            {seed.type} seed
          </p>
          <h3 className="mt-3 text-xl font-semibold text-ink">{seed.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {seed.notes.length} notes / {seed.key} {seed.scale} / {seed.bpm} BPM
          </p>
        </div>
        <span
          className={clsx(
            "mt-1 h-3 w-3 rounded-full",
            isPlaying ? "bg-sprout" : "bg-slate-200",
          )}
          aria-label={isPlaying ? "Playing" : "Idle"}
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-paper px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          fragment preview
        </p>
        <p className="mt-2 min-h-6 truncate text-sm font-medium text-slate-700">
          {previewNotes || "Resting seed"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="control-focus inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-sprout/50"
          onClick={isPlaying ? onStop : onPreview}
        >
          {isPlaying ? (
            <Pause aria-hidden="true" size={16} />
          ) : (
            <Play aria-hidden="true" size={16} />
          )}
          {isPlaying ? "Stop" : "Preview"}
        </button>
        <button
          type="button"
          className="control-focus inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blueglow/70"
          onClick={onDownload}
        >
          <Download aria-hidden="true" size={16} />
          Export MIDI
        </button>
      </div>
    </article>
  )
}
