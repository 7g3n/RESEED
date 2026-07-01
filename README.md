# RESEED

RESEED is a browser-only remix sketch tool for producers and remixers. Drop in an audio file, inspect its waveform and energy map, then generate three rule-based MIDI seeds that can be exported to a DAW such as Ableton Live.

The MVP is intentionally local-first: no login, no database, no cloud upload, and no external AI API.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

## Usage

1. Drag an audio file into the upload panel or choose a file from the picker.
2. Confirm the decoded file metadata, waveform, energy map, and section guess.
3. Set BPM, key, scale, intensity, and random seed.
4. Press **Generate Seeds**.
5. Preview each generated seed in the browser.
6. Export `reseed_chords_<key>_<bpm>.mid`, `reseed_bass_<key>_<bpm>.mid`, or `reseed_lead_<key>_<bpm>.mid`.

## MVP Features

- Audio upload via drag-and-drop and file picker.
- Browser decoding with `AudioContext.decodeAudioData`.
- Canvas waveform from a mono peak representation.
- Audio playback with play, pause, stop, seek, and waveform playhead.
- RMS energy analysis with smoothing and highlighted high-energy bars.
- BPM-based 16-bar section candidates.
- Key, scale, intensity, and random seed controls.
- Rule-based MIDI generation for chords, bass, and lead/arp fragments.
- Tone.js preview playback with one seed playing at a time.
- Browser-generated Standard MIDI File export.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Web Audio API
- Canvas API
- Tone.js
- lucide-react
- clsx

## Browser-Only Notes

Audio files are decoded and analyzed in the browser. RESEED does not upload audio, call a backend API, store projects in a database, or use an AI service.

## GitHub Pages

The Vite config uses `base: "./"` so the static build can run from GitHub Pages paths. A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.

To publish:

1. Push this branch to GitHub.
2. In repository settings, enable Pages with **GitHub Actions** as the source.
3. Run the deploy workflow or merge the branch into the default branch.

## Future Ideas

- BPM auto detection
- Key auto detection
- Stem separation
- Ableton Live Set export
- Audio-reactive visualizer export
- Remix arrangement generator
- Project save/load
- Shareable preset URL
