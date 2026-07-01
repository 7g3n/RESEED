import clsx from "clsx"
import type { Section } from "../types/audio"
import { formatTime } from "../lib/format"

type EnergyTimelineProps = {
  energyFrames: number[]
  sections: Section[]
  duration: number
}

export function EnergyTimeline({
  energyFrames,
  sections,
  duration,
}: EnergyTimelineProps) {
  const bars = downsample(energyFrames, 128)

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Energy map
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Section guess over local RMS
          </p>
        </div>
        <span className="rounded-full border border-violetglow/50 bg-violetglow/10 px-3 py-1 text-xs font-medium text-slate-600">
          {sections.length} fragments
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex h-28 items-end gap-[2px] rounded-lg border border-slate-200 bg-white px-3 pb-3 pt-4">
          {bars.map((value, index) => (
            <span
              key={`${index}-${value.toFixed(3)}`}
              className={clsx(
                "min-w-[2px] flex-1 rounded-t-sm transition",
                value > 0.72 ? "bg-sprout" : "bg-blueglow",
              )}
              style={{
                height: `${Math.max(8, value * 100)}%`,
                opacity: value > 0.72 ? 0.86 : 0.32 + value * 0.45,
              }}
              aria-label={`Energy ${Math.round(value * 100)} percent`}
            />
          ))}
        </div>

        <div className="relative h-24 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {sections.map((section, index) => {
            const start = duration > 0 ? (section.startTime / duration) * 100 : 0
            const width =
              duration > 0
                ? ((section.endTime - section.startTime) / duration) * 100
                : 0

            return (
              <div
                key={section.id}
                className="absolute top-0 h-full border-r border-white/70 px-3 py-3"
                style={{
                  left: `${start}%`,
                  width: `${width}%`,
                  minWidth: "96px",
                  background: `linear-gradient(180deg, rgba(223, 245, 237, ${0.32 + section.energyAverage * 0.28}), rgba(142, 200, 255, ${0.13 + section.energyAverage * 0.25}))`,
                }}
              >
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  fragment {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-ink">
                  {section.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {section.recommendedRole}
                </p>
                <p className="mt-2 truncate text-[11px] tabular-nums text-slate-400">
                  {formatTime(section.startTime)} - {formatTime(section.endTime)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function downsample(values: number[], targetLength: number): number[] {
  if (values.length === 0) {
    return Array.from({ length: targetLength }, () => 0)
  }

  const bucketSize = Math.ceil(values.length / targetLength)

  return Array.from({ length: targetLength }, (_, index) => {
    const start = index * bucketSize
    const end = Math.min(values.length, start + bucketSize)
    const bucket = values.slice(start, end)

    if (bucket.length === 0) {
      return 0
    }

    return bucket.reduce((sum, value) => sum + value, 0) / bucket.length
  })
}
