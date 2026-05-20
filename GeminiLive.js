// GeminiLive — captures screen + microphone so Cap can see what you're doing
(function () {
  let capturing = false;
  let minimized = false;
  let screenStream = null;
  let micStream = null;
  let audioCtx = null;
  let animFrame = null;

  // ── Build DOM ────────────────────────────────────────────────────────────

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: '50',
    width: '320px', background: '#111827', border: '1px solid #374151',
    borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.5)',
    overflow: 'hidden', fontFamily: 'inherit',
  });

  // Header
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.625rem 0.875rem', background: '#1f2937',
    borderBottom: '1px solid #374151',
  });

  const headerLeft = document.createElement('div');
  Object.assign(headerLeft.style, { display: 'flex', alignItems: 'center', gap: '0.5rem' });

  const headerIcon = document.createElement('span');
  headerIcon.textContent = '🎬';
  headerIcon.style.fontSize = '0.8rem';

  const headerTitle = document.createElement('span');
  headerTitle.textContent = 'Gemini Live';
  Object.assign(headerTitle.style, { color: '#f9fafb', fontSize: '0.8rem', fontWeight: '600' });

  const liveBadge = document.createElement('span');
  liveBadge.textContent = 'LIVE';
  Object.assign(liveBadge.style, {
    background: '#16a34a', color: '#fff', fontSize: '0.65rem', fontWeight: '700',
    padding: '0.1rem 0.4rem', borderRadius: '999px', letterSpacing: '0.05em',
    display: 'none',
  });

  headerLeft.append(headerIcon, headerTitle, liveBadge);

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '▼';
  toggleBtn.title = 'Minimize';
  Object.assign(toggleBtn.style, {
    background: 'none', border: 'none', color: '#9ca3af',
    cursor: 'pointer', fontSize: '0.85rem', lineHeight: '1', padding: '0.1rem 0.25rem',
  });

  header.append(headerLeft, toggleBtn);

  // Body
  const body = document.createElement('div');
  Object.assign(body.style, {
    padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem',
  });

  // Screen preview
  const previewWrap = document.createElement('div');
  Object.assign(previewWrap.style, {
    position: 'relative', background: '#000',
    borderRadius: '0.625rem', overflow: 'hidden', aspectRatio: '16/9',
  });

  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  Object.assign(video.style, { width: '100%', height: '100%', objectFit: 'contain', display: 'block' });

  const placeholder = document.createElement('div');
  Object.assign(placeholder.style, {
    position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
    color: '#6b7280', fontSize: '0.75rem',
  });
  placeholder.innerHTML = '<span style="font-size:1.75rem">🖥️</span><span>No screen share active</span>';

  previewWrap.append(video, placeholder);

  // Mic level
  const micRow = document.createElement('div');
  Object.assign(micRow.style, { display: 'flex', alignItems: 'center', gap: '0.5rem' });

  const micIcon = document.createElement('span');
  micIcon.textContent = '🎙️';
  micIcon.style.fontSize = '0.85rem';

  const micTrack = document.createElement('div');
  Object.assign(micTrack.style, {
    flex: '1', height: '6px', background: '#374151', borderRadius: '999px', overflow: 'hidden',
  });

  const micFill = document.createElement('div');
  Object.assign(micFill.style, {
    height: '100%', borderRadius: '999px', width: '0%',
    background: '#3b82f6', transition: 'width 75ms linear, background 200ms',
  });
  micTrack.appendChild(micFill);

  const micLabel = document.createElement('span');
  micLabel.textContent = '0%';
  Object.assign(micLabel.style, { color: '#6b7280', fontSize: '0.7rem', width: '2.2rem', textAlign: 'right' });

  micRow.append(micIcon, micTrack, micLabel);

  // Error box (hidden by default)
  const errorBox = document.createElement('div');
  Object.assign(errorBox.style, {
    background: 'rgba(153,27,27,.3)', border: '1px solid #7f1d1d',
    borderRadius: '0.5rem', padding: '0.4rem 0.6rem',
    color: '#fca5a5', fontSize: '0.72rem', display: 'none',
  });

  // Control button
  const ctrlBtn = document.createElement('button');
  ctrlBtn.textContent = '▶ Start Screen & Mic';
  Object.assign(ctrlBtn.style, {
    width: '100%', padding: '0.55rem', borderRadius: '0.625rem', border: 'none',
    background: '#2563eb', color: '#fff', fontSize: '0.8rem', fontWeight: '600',
    cursor: 'pointer', transition: 'background 150ms',
  });

  const hint = document.createElement('p');
  hint.textContent = 'Your browser will ask for screen & microphone permission.';
  Object.assign(hint.style, { color: '#4b5563', fontSize: '0.65rem', textAlign: 'center', margin: '0' });

  body.append(previewWrap, micRow, errorBox, ctrlBtn, hint);
  panel.append(header, body);
  document.body.appendChild(panel);

  // ── State helpers ────────────────────────────────────────────────────────

  function setAudioLevel(level) {
    micFill.style.width = level + '%';
    micFill.style.background = level > 70 ? '#ef4444' : level > 35 ? '#22c55e' : '#3b82f6';
    micLabel.textContent = Math.round(level) + '%';
  }

  function setCapturingState(active) {
    capturing = active;
    header.style.background = active ? '#1e3a2f' : '#1f2937';
    liveBadge.style.display = active ? 'inline' : 'none';
    placeholder.style.display = active ? 'none' : 'flex';
    ctrlBtn.textContent = active ? '⏹ Stop Capture' : '▶ Start Screen & Mic';
    ctrlBtn.style.background = active ? '#dc2626' : '#2563eb';
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = msg ? 'block' : 'none';
  }

  // ── Capture logic ────────────────────────────────────────────────────────

  function stopCapture() {
    if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); screenStream = null; }
    if (micStream)    { micStream.getTracks().forEach(t => t.stop());    micStream = null; }
    if (animFrame)    { cancelAnimationFrame(animFrame); animFrame = null; }
    if (audioCtx)     { audioCtx.close(); audioCtx = null; }
    video.srcObject = null;
    setAudioLevel(0);
    setCapturingState(false);
  }

  async function startCapture() {
    showError('');
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', frameRate: 15 },
        audio: false,
      });

      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });

      video.srcObject = screenStream;

      // Audio level meter
      audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(micStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      function tick() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 2.2));
        animFrame = requestAnimationFrame(tick);
      }
      tick();

      // Stop if user dismisses the browser screen-share picker
      screenStream.getVideoTracks()[0].addEventListener('ended', stopCapture);

      setCapturingState(true);
    } catch (err) {
      stopCapture();
      showError(err.message || 'Permission denied or cancelled.');
    }
  }

  // ── Event listeners ──────────────────────────────────────────────────────

  ctrlBtn.addEventListener('click', () => capturing ? stopCapture() : startCapture());

  ctrlBtn.addEventListener('mouseenter', () => {
    ctrlBtn.style.background = capturing ? '#b91c1c' : '#1d4ed8';
  });
  ctrlBtn.addEventListener('mouseleave', () => {
    ctrlBtn.style.background = capturing ? '#dc2626' : '#2563eb';
  });

  toggleBtn.addEventListener('click', () => {
    minimized = !minimized;
    body.style.display = minimized ? 'none' : 'flex';
    header.style.borderBottom = minimized ? 'none' : '1px solid #374151';
    panel.style.width = minimized ? 'auto' : '320px';
    toggleBtn.textContent = minimized ? '▲' : '▼';
    toggleBtn.title = minimized ? 'Expand' : 'Minimize';
  });
})();
