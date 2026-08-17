import { useRef, useState, useCallback, useEffect } from 'react';

// Simple camera-based PPG: user covers the rear camera lens with a fingertip
// (ideally with flash/torch on). We sample the average red-channel intensity
// of the video frame over ~15 seconds, run a lightweight peak detector on
// the signal, and derive BPM from the average peak-to-peak interval.
// This is a consumer-grade estimate, not a medical device measurement.

const SAMPLE_SECONDS = 15;
const SAMPLE_HZ = 20;

export default function PPGHeartRate({ onResult }: { onResult?: (bpm: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'sampling' | 'done' | 'error'>('idle');
  const [bpm, setBpm] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  const start = useCallback(async () => {
    setError(null);
    setBpm(null);
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Try to turn the torch on for a stronger PPG signal (not all devices support it)
      const track = stream.getVideoTracks()[0];
      try {
        // @ts-expect-error - torch is non-standard but widely supported on Android Chrome
        await track.applyConstraints({ advanced: [{ torch: true }] });
      } catch {
        // torch unsupported — continue without it, signal will be noisier
      }

      setStatus('sampling');
      const samples: number[] = [];
      const totalTicks = SAMPLE_SECONDS * SAMPLE_HZ;
      let tick = 0;

      const interval = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 32;
            canvas.height = 32;
            ctx.drawImage(video, 0, 0, 32, 32);
            const frame = ctx.getImageData(0, 0, 32, 32).data;
            let redSum = 0;
            for (let i = 0; i < frame.length; i += 4) redSum += frame[i];
            samples.push(redSum / (frame.length / 4));
          }
        }
        tick += 1;
        setProgress(Math.round((tick / totalTicks) * 100));

        if (tick >= totalTicks) {
          clearInterval(interval);
          stopCamera();
          const estimated = estimateBpm(samples, SAMPLE_HZ);
          setBpm(estimated);
          setStatus(estimated ? 'done' : 'error');
          if (!estimated) setError('Signal too weak — cover the camera lens fully with your fingertip and hold still.');
          if (estimated && onResult) onResult(estimated);
        }
      }, 1000 / SAMPLE_HZ);
    } catch (err) {
      setStatus('error');
      setError('Camera access denied or unavailable.');
    }
  }, [onResult]);

  return (
    <div className="card p-4 space-y-3">
      <div>
        <h3 className="font-medium">Camera heart rate (PPG)</h3>
        <p className="text-xs text-clinical-muted mt-1">
          Cover your rear camera lens completely with your fingertip and hold still for {SAMPLE_SECONDS} seconds.
        </p>
      </div>

      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {status === 'idle' && (
        <button onClick={start} className="text-sm px-4 py-2 rounded-md bg-clinical-accent/15 text-clinical-accent border border-clinical-accent/30">
          Start measurement
        </button>
      )}

      {status === 'requesting' && <p className="text-sm text-clinical-muted">Requesting camera access…</p>}

      {status === 'sampling' && (
        <div>
          <div className="h-2 bg-clinical-panel2 rounded-full overflow-hidden">
            <div className="h-full bg-clinical-teal transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-clinical-muted mt-2">Measuring… keep your finger still over the lens.</p>
        </div>
      )}

      {status === 'done' && bpm && (
        <div>
          <p className="text-3xl font-display font-semibold text-clinical-teal">{bpm} <span className="text-sm text-clinical-muted font-normal">bpm (estimated)</span></p>
          <button onClick={start} className="text-xs mt-2 px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border">Measure again</button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p className="text-sm text-severity-URGENT">{error}</p>
          <button onClick={start} className="text-xs mt-2 px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border">Try again</button>
        </div>
      )}
    </div>
  );
}

function estimateBpm(samples: number[], hz: number): number | null {
  if (samples.length < hz * 5) return null;

  // Simple detrend: subtract a moving average to isolate the pulsatile component
  const windowSize = hz; // 1-second moving average
  const detrended: number[] = [];
  for (let i = 0; i < samples.length; i++) {
    const start = Math.max(0, i - windowSize);
    const window = samples.slice(start, i + 1);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    detrended.push(samples[i] - avg);
  }

  // Peak detection: local maxima above a noise threshold
  const std = Math.sqrt(detrended.reduce((a, b) => a + b * b, 0) / detrended.length);
  if (std < 0.5) return null; // signal too flat / lens not covered properly

  const threshold = std * 0.5;
  const peakIndices: number[] = [];
  for (let i = 2; i < detrended.length - 2; i++) {
    if (
      detrended[i] > threshold &&
      detrended[i] >= detrended[i - 1] &&
      detrended[i] >= detrended[i + 1] &&
      detrended[i] >= detrended[i - 2] &&
      detrended[i] >= detrended[i + 2]
    ) {
      // avoid double-counting peaks that are too close together (< 300ms apart)
      if (peakIndices.length === 0 || i - peakIndices[peakIndices.length - 1] > hz * 0.3) {
        peakIndices.push(i);
      }
    }
  }

  if (peakIndices.length < 4) return null;

  const intervals: number[] = [];
  for (let i = 1; i < peakIndices.length; i++) intervals.push(peakIndices[i] - peakIndices[i - 1]);
  const avgIntervalSamples = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const avgIntervalSeconds = avgIntervalSamples / hz;
  const bpm = Math.round(60 / avgIntervalSeconds);

  if (bpm < 40 || bpm > 200) return null; // implausible — reject
  return bpm;
}
