import { Sprout } from "lucide-react"

type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="panel flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-sprout shadow-glow">
        <Sprout aria-hidden="true" size={25} />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  )
}
