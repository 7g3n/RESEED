import { useEffect, useRef } from "react"
import { formatTime } from "../lib/format"

type WaveformCanvasProps = {
  peaks: number[]
  duration: number
  currentTime: number
}

export function WaveformCanvas({
  peaks,
  duration,
  currentTime,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) {
      return
    }

    const draw = () => {
      const width = Math.max(320, container.clientWidth)
      const height = 220
      const ratio = window.devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const context = canvas.getContext("2d")

      if (!context) {
        return
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = "#fbfcff"
      context.fillRect(0, 0, width, height)

      drawGrid(context, width, height)

      const center = height / 2
      const usableHeight = height * 0.66

      context.fillStyle = "#90c8ff"

      for (let x = 0; x < width; x += 1) {
        const peakIndex = Math.floor((x / width) * peaks.length)
        const peak = peaks[peakIndex] ?? 0
        const barHeight = Math.max(1, peak * usableHeight)
        const energyTint = Math.min(1, peak * 1.4)
        context.fillStyle = `rgba(${111 + energyTint * 34}, ${173 - energyTint * 18}, 255, ${0.45 + energyTint * 0.36})`
        context.fillRect(x, center - barHeight / 2, 1, barHeight)
      }

      context.strokeStyle = "rgba(63, 185, 133, 0.95)"
      context.lineWidth = 2
      const progressX =
        duration > 0 ? Math.min(width, (currentTime / duration) * width) : 0
      context.beginPath()
      context.moveTo(progressX, 18)
      context.lineTo(progressX, height - 18)
      context.stroke()

      context.fillStyle = "#566174"
      context.font = "12px ui-sans-serif, system-ui, sans-serif"
      context.fillText("0:00", 14, height - 14)
      context.textAlign = "right"
      context.fillText(formatTime(duration), width - 14, height - 14)
      context.textAlign = "left"
    }

    draw()

    const observer = new ResizeObserver(draw)
    observer.observe(container)

    return () => observer.disconnect()
  }, [currentTime, duration, peaks])

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Waveform
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Peaks from mono mixdown
          </p>
        </div>
        <span className="rounded-full border border-blueglow/40 bg-blueglow/10 px-3 py-1 text-xs font-medium text-slate-600">
          {formatTime(currentTime)}
        </span>
      </div>
      <div ref={containerRef} className="w-full overflow-hidden">
        <canvas ref={canvasRef} aria-label="Audio waveform" />
      </div>
    </section>
  )
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.strokeStyle = "rgba(106, 119, 142, 0.14)"
  context.lineWidth = 1

  for (let x = 0; x <= width; x += width / 8) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }

  for (let y = 0; y <= height; y += height / 4) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }
}
