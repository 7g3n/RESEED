import clsx from "clsx"
import { FileAudio, UploadCloud } from "lucide-react"
import { useRef, useState } from "react"
import type { AudioFileInfo } from "../types/audio"
import { formatFileSize, formatTime } from "../lib/format"

const ACCEPTED_EXTENSIONS = [".wav", ".mp3", ".aiff", ".aif", ".m4a"]

type UploadDropzoneProps = {
  fileInfo: AudioFileInfo | null
  isLoading: boolean
  error: string | null
  onFileSelected: (file: File) => void
}

export function UploadDropzone({
  fileInfo,
  isLoading,
  error,
  onFileSelected,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const displayError = error ?? localError

  function handleCandidate(file: File | undefined) {
    if (!file) {
      return
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setLocalError("Please choose wav, mp3, aiff, aif, or m4a audio.")
      return
    }

    setLocalError(null)
    onFileSelected(file)
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200/80 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Audio upload
            </h2>
            <p className="mt-1 text-sm text-slate-500">Drop audio here</p>
          </div>
          <span className="rounded-full border border-sprout/30 bg-seed px-3 py-1 text-xs font-medium text-slate-600">
            No cloud upload
          </span>
        </div>
      </div>

      <button
        type="button"
        className={clsx(
          "control-focus group flex min-h-64 w-full flex-col items-center justify-center gap-4 border-0 bg-transparent px-5 py-8 text-center transition",
          isDragging && "bg-blueglow/10",
        )}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleCandidate(event.dataTransfer.files[0])
        }}
      >
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-sprout/30 bg-white text-sprout shadow-glow">
          <span className="absolute bottom-3 h-2 w-7 rounded-full bg-sprout/15" />
          {isLoading ? (
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-sprout" />
          ) : (
            <UploadCloud
              aria-hidden="true"
              className="transition group-hover:-translate-y-0.5"
              size={33}
            />
          )}
        </span>

        <span className="space-y-2">
          <span className="block text-xl font-semibold text-ink">
            {isLoading ? "Planting audio seed..." : "Drop audio here"}
          </span>
          <span className="block text-sm leading-6 text-slate-500">
            Choose wav, mp3, aiff, aif, or m4a. Analysis stays in this browser.
          </span>
        </span>

        <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition group-hover:border-sprout/40">
          <FileAudio aria-hidden="true" size={16} />
          Choose audio
        </span>
      </button>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={(event) => handleCandidate(event.target.files?.[0])}
      />

      {fileInfo ? (
        <dl className="grid grid-cols-2 gap-px border-t border-slate-200/80 bg-slate-200/70 text-sm md:grid-cols-4">
          <InfoItem label="file" value={fileInfo.name} />
          <InfoItem label="duration" value={formatTime(fileInfo.duration)} />
          <InfoItem label="sample rate" value={`${fileInfo.sampleRate} Hz`} />
          <InfoItem
            label="channels"
            value={`${fileInfo.channels} / ${formatFileSize(fileInfo.size)}`}
          />
        </dl>
      ) : null}

      {displayError ? (
        <p className="border-t border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          {displayError}
        </p>
      ) : null}
    </section>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-white/90 px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </dd>
    </div>
  )
}
