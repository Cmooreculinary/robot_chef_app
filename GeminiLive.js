// GeminiLive — captures screen + microphone so Cap can see what you're doing
function GeminiLive() {
  const [capturing, setCapturing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [minimized, setMinimized] = React.useState(false);

  const videoRef = React.useRef(null);
  const screenStreamRef = React.useRef(null);
  const micStreamRef = React.useRef(null);
  const animFrameRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);

  const stopCapture = React.useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (videoRef.current) videoRef.current.srcObject = null;
    screenStreamRef.current = null;
    micStreamRef.current = null;
    audioCtxRef.current = null;
    setCapturing(false);
    setAudioLevel(0);
  }, []);

  const startCapture = async () => {
    setError(null);
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', frameRate: 15 },
        audio: false,
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });

      screenStreamRef.current = screenStream;
      micStreamRef.current = micStream;

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      // Audio level meter
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(micStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 2.2));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();

      // Stop if user dismisses the browser screen-share picker
      screenStream.getVideoTracks()[0].addEventListener('ended', stopCapture);

      setCapturing(true);
    } catch (err) {
      setError(err.message || 'Permission denied or cancelled.');
    }
  };

  // Clean up on unmount
  React.useEffect(() => stopCapture, [stopCapture]);

  return (
    <div style={{
      position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 50,
      width: minimized ? 'auto' : '320px',
      background: '#111827', border: '1px solid #374151',
      borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.5)',
      overflow: 'hidden', fontFamily: 'inherit',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.625rem 0.875rem',
        background: capturing ? '#1e3a2f' : '#1f2937',
        borderBottom: minimized ? 'none' : '1px solid #374151',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem' }}>🎬</span>
          <span style={{ color: '#f9fafb', fontSize: '0.8rem', fontWeight: 600 }}>
            Gemini Live
          </span>
          {capturing && (
            <span style={{
              background: '#16a34a', color: '#fff', fontSize: '0.65rem',
              fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '999px',
              letterSpacing: '0.05em',
            }}>LIVE</span>
          )}
        </div>
        <button
          onClick={() => setMinimized(m => !m)}
          style={{
            background: 'none', border: 'none', color: '#9ca3af',
            cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1, padding: '0.1rem 0.25rem',
          }}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          {minimized ? '▲' : '▼'}
        </button>
      </div>

      {!minimized && (
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {/* Screen preview */}
          <div style={{
            position: 'relative', background: '#000',
            borderRadius: '0.625rem', overflow: 'hidden',
            aspectRatio: '16/9',
          }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
            {!capturing && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                color: '#6b7280', fontSize: '0.75rem',
              }}>
                <span style={{ fontSize: '1.75rem' }}>🖥️</span>
                <span>No screen share active</span>
              </div>
            )}
          </div>

          {/* Mic level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>🎙️</span>
            <div style={{
              flex: 1, height: '6px', background: '#374151',
              borderRadius: '999px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '999px',
                width: `${audioLevel}%`,
                background: audioLevel > 70 ? '#ef4444' : audioLevel > 35 ? '#22c55e' : '#3b82f6',
                transition: 'width 75ms linear, background 200ms',
              }} />
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.7rem', width: '2.2rem', textAlign: 'right' }}>
              {Math.round(audioLevel)}%
            </span>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(153,27,27,.3)', border: '1px solid #7f1d1d',
              borderRadius: '0.5rem', padding: '0.4rem 0.6rem',
              color: '#fca5a5', fontSize: '0.72rem',
            }}>
              {error}
            </div>
          )}

          {/* Control button */}
          <button
            onClick={capturing ? stopCapture : startCapture}
            style={{
              width: '100%', padding: '0.55rem',
              borderRadius: '0.625rem', border: 'none',
              background: capturing ? '#dc2626' : '#2563eb',
              color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 150ms',
            }}
            onMouseEnter={e => e.target.style.background = capturing ? '#b91c1c' : '#1d4ed8'}
            onMouseLeave={e => e.target.style.background = capturing ? '#dc2626' : '#2563eb'}
          >
            {capturing ? '⏹ Stop Capture' : '▶ Start Screen & Mic'}
          </button>

          <p style={{ color: '#4b5563', fontSize: '0.65rem', textAlign: 'center', margin: 0 }}>
            Your browser will ask for screen & microphone permission.
          </p>
        </div>
      )}
    </div>
  );
}

// Mount into the dedicated root div
const _glRoot = document.getElementById('gemini-live-root');
if (_glRoot) {
  ReactDOM.createRoot(_glRoot).render(<GeminiLive />);
}
