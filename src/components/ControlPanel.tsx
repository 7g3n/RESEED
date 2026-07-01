import clsx from "clsx"
import { Dices, Sprout } from "lucide-react"
import type { Intensity, ScaleName } from "../types/midi"
import { INTENSITIES, KEYS, SCALES } from "../lib/midi/musicTheory"

export type SeedControls = {
  bpm: number
  key: string
  scale: ScaleName
  intensity: Intensity
  randomSeed: number
}

type ControlPanelProps = {
  controls: SeedControls
  canGenerate: boolean
  onChange: (controls: SeedControls) => void
  onRandomSeed: () => void
  onGenerate: () => void
}

export function ControlPanel({
  controls,
  canGenerate,
  onChange,
  onRandomSeed,
  onGenerate,
}: ControlPanelProps) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200/80 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Control panel
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tune the seed before it sprouts
        </p>
      </div>

      <div className="grid gap-4 p-5">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            BPM
          </span>
          <input
            className="control-focus h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
            type="number"
            min={60}
            max={220}
            value={controls.bpm}
            onChange={(event) =>
              onChange({
                ...controls,
                bpm: clamp(Number(event.target.value), 60, 220),
              })
            }
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Key
            </span>
            <select
              className="control-focus h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              value={controls.key}
              onChange={(event) =>
                onChange({ ...controls, key: event.target.value })
              }
            >
              {KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Scale
            </span>
            <select
              className="control-focus h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              value={controls.scale}
              onChange={(event) =>
                onChange({
                  ...controls,
                  scale: event.target.value as ScaleName,
                })
              }
            >
              {SCALES.map((scale) => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Intensity
          </span>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {INTENSITIES.map((intensity) => (
              <button
                key={intensity}
                type="button"
                className={clsx(
                  "control-focus h-10 rounded-lg border px-3 text-sm font-medium transition",
                  controls.intensity === intensity
                    ? "border-sprout/40 bg-seed text-slate-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blueglow/60",
                )}
                onClick={() => onChange({ ...controls, intensity })}
              >
                {intensity}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row">
          <button
            type="button"
            className="control-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-violetglow/80"
            onClick={onRandomSeed}
          >
            <Dices aria-hidden="true" size={17} />
            Random seed
          </button>

          <button
            type="button"
            className="control-focus inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-sprout/40 bg-sprout px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-sprout/90 disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            <Sprout aria-hidden="true" size={17} />
            Generate Seeds
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Current seed: {controls.randomSeed}
        </p>
      </div>
    </section>
  )
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, Math.round(value)))
}
