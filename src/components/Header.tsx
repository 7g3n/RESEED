import { AudioWaveform, ShieldCheck, Sprout } from "lucide-react"

export function Header() {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200/80 pb-7 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-sprout/30 bg-seed text-sprout shadow-glow">
            <Sprout aria-hidden="true" size={23} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Browser remix lab
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-ink md:text-5xl">
              RESEED
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Generate remix seeds from your audio.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600">
          <ShieldCheck aria-hidden="true" size={16} />
          Browser-only / No cloud upload
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-blueglow/50 bg-blueglow/10 px-3 py-2 text-slate-600">
          <AudioWaveform aria-hidden="true" size={16} />
          Analyze locally
        </span>
      </div>
    </header>
  )
}
