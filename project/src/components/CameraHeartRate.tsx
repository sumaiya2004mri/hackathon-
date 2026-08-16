import { useEffect, useRef, useState } from "react";
import { HeartPulse, X } from "lucide-react";

interface Props {
  onDetected: (bpm: number) => void;
  onClose: () => void;
}

const SAMPLE_MS = 15000; // 15 seconds of sampling
const SAMPLE_INTERVAL_MS = 40; // ~25 samples/sec, plenty for resting HR

/**
 * Camera-based heart rate detector using photoplethysmography (PPG).
 * The user covers the rear camera + flash with a fingertip. Blood flow
 * through the fingertip causes the average red-channel brightness of the
 * video frame to rise and fall with each heartbeat. We sample that signal,
 * detect peaks, and derive BPM — no extra hardware required.
 */
export function CameraHeartRate({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const samplesRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const [status, setStatus] = useState<
    "requesting" | "sampling" | "done" | "error"
  >("requesting");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultBpm, setResultBpm] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        // Try to turn on the flash/torch for a stronger PPG signal.
        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean })
          | undefined;
        if (capabilities?.torch) {
          try {
            await track.applyConstraints({
              advanced: [{ torch: true } as unknown as MediaTrackConstraintSet],
            });
          } catch {
            // Torch control not supported on this device/browser — sampling
            // still works, just with ambient light instead of flash.
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("sampling");
        samplesRef.current = [];
        startTimeRef.current = performance.now();

        intervalRef.current = window.setInterval(() => {
          sampleFrame();
          const elapsed = performance.now() - startTimeRef.current;
          setProgress(Math.min(100, (elapsed / SAMPLE_MS) * 100));
          if (elapsed >= SAMPLE_MS) {
            finish();
          }
        }, SAMPLE_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access to measure heart rate this way."
            : "Couldn't access the camera on this device."
        );
      }
    }

    function sampleFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = 40;
      canvas.height = 30;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let redSum = 0;
      const pixelCount = frame.length / 4;
      for (let i = 0; i < frame.length; i += 4) {
        redSum += frame[i]; // red channel
      }
      samplesRef.current.push(redSum / pixelCount);
    }

    function finish() {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const bpm = estimateBpm(samplesRef.current, SAMPLE_INTERVAL_MS);
      if (bpm) {
        setResultBpm(bpm);
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMsg(
          "Couldn't detect a clear pulse signal. Make sure your fingertip fully covers the camera lens and try again."
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-bold text-blue-900">
            Camera Heart Rate
          </h3>
        </div>

        {/* Hidden capture elements */}
        <video ref={videoRef} className="hidden" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />

        {status === "requesting" && (
          <p className="text-sm text-slate-600">
            Requesting camera access…
          </p>
        )}

        {status === "sampling" && (
          <div>
            <p className="mb-3 text-sm text-slate-600">
              Cover the rear camera lens completely with your fingertip and
              hold still. Measuring…
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === "done" && resultBpm && (
          <div className="text-center">
            <p className="text-4xl font-extrabold text-teal-700">
              {resultBpm}
            </p>
            <p className="mb-4 text-sm text-slate-500">beats per minute</p>
            <button
              onClick={() => onDetected(resultBpm)}
              className="btn-primary w-full justify-center"
            >
              Use this reading
            </button>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="text-sm text-red-600">{errorMsg}</p>
            <button
              onClick={onClose}
              className="btn-secondary mt-4 w-full justify-center"
            >
              Close
            </button>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Experimental camera-based estimate — not a substitute for a
          clinical pulse oximeter or ECG.
        </p>
      </div>
    </div>
  );
}

/**
 * Simple peak-detection over the red-channel signal to estimate BPM.
 * Uses a moving-average baseline and counts rising-edge crossings.
 */
function estimateBpm(samples: number[], intervalMs: number): number | null {
  if (samples.length < 50) return null;

  // Smooth the raw signal with a small moving average to reduce noise.
  const smoothed: number[] = [];
  const windowSize = 3;
  for (let i = 0; i < samples.length; i++) {
    const start = Math.max(0, i - windowSize);
    const slice = samples.slice(start, i + 1);
    smoothed.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }

  // Detrend using a wider moving average as a rolling baseline.
  const baselineWindow = 25;
  const detrended: number[] = smoothed.map((v, i) => {
    const start = Math.max(0, i - baselineWindow);
    const slice = smoothed.slice(start, i + 1);
    const baseline = slice.reduce((a, b) => a + b, 0) / slice.length;
    return v - baseline;
  });

  // Count peaks: local maxima above a small positive threshold, with a
  // minimum spacing to avoid double-counting noise as separate beats.
  const minSpacingMs = 300; // corresponds to a max plausible ~200bpm
  const minSpacingSamples = Math.round(minSpacingMs / intervalMs);
  const threshold =
    Math.max(...detrended.map(Math.abs)) * 0.25 || 0.5;

  const peaks: number[] = [];
  for (let i = 1; i < detrended.length - 1; i++) {
    if (
      detrended[i] > threshold &&
      detrended[i] > detrended[i - 1] &&
      detrended[i] >= detrended[i + 1]
    ) {
      if (
        peaks.length === 0 ||
        i - peaks[peaks.length - 1] >= minSpacingSamples
      ) {
        peaks.push(i);
      }
    }
  }

  if (peaks.length < 3) return null;

  const intervalsSamples: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervalsSamples.push(peaks[i] - peaks[i - 1]);
  }
  const avgIntervalSamples =
    intervalsSamples.reduce((a, b) => a + b, 0) / intervalsSamples.length;
  const avgIntervalMs = avgIntervalSamples * intervalMs;
  const bpm = Math.round(60000 / avgIntervalMs);

  // Sanity bound to plausible resting/active human heart rates.
  if (bpm < 35 || bpm > 220) return null;
  return bpm;
}
