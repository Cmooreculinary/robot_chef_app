// GeminiLive — screen + mic capture streamed to Gemini Multimodal Live API
(function () {
  const WS_ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
  const MODEL       = 'models/gemini-2.5-flash';
  const VIDEO_FPS   = 1; // screen frames per second sent to the API

  // ── State ─────────────────────────────────────────────────────────────────
  let capturing       = false;
  let minimized       = false;
  let screenStream    = null;
  let micStream       = null;
  let meterAudioCtx   = null; // native-rate ctx for the level-meter UI
  let streamAudioCtx  = null; // 16 kHz ctx for PCM chunks sent to Gemini
  let scriptProcessor = null;
  let animFrame       = null;
  let videoInterval   = null;
  let ws              = null;
  let wsReady         = false;

  // ── Build DOM ──────────────────────────────────────────────────────────────

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

  // WebSocket status dot
  const wsDot = document.createElement('span');
  wsDot.title = 'WebSocket: disconnected';
  Object.assign(wsDot.style, {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#4b5563', display: 'inline-block', transition: 'background 300ms',
  });

  headerLeft.append(headerIcon, headerTitle, liveBadge, wsDot);

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

  // Mic level bar
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

  // Error box
  const errorBox = document.createElement('div');
  Object.assign(errorBox.style, {
    background: 'rgba(153,27,27,.3)', border: '1px solid #7f1d1d',
    borderRadius: '0.5rem', padding: '0.4rem 0.6rem',
    color: '#fca5a5', fontSize: '0.72rem', display: 'none',
  });

  // Model response box
  const responseBox = document.createElement('div');
  Object.assign(responseBox.style, {
    background: '#1f2937', border: '1px solid #374151',
    borderRadius: '0.5rem', padding: '0.4rem 0.6rem',
    color: '#d1d5db', fontSize: '0.72rem', lineHeight: '1.45',
    maxHeight: '80px', overflowY: 'auto',
    whiteSpace: 'pre-wrap', display: 'none',
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

  body.append(previewWrap, micRow, errorBox, responseBox, ctrlBtn, hint);
  panel.append(header, body);
  document.body.appendChild(panel);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function float32ToInt16(f32) {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      const s = Math.max(-1, Math.min(1, f32[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return out;
  }

  // Chunk-based to avoid call-stack overflow on large buffers
  function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const CHUNK = 0x8000;
    let bin = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

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

  function setWsDot(state) {
    const colors = { off: '#4b5563', connecting: '#f59e0b', on: '#22c55e', error: '#ef4444' };
    const labels = { off: 'disconnected', connecting: 'connecting…', on: 'connected', error: 'error' };
    wsDot.style.background = colors[state] ?? colors.off;
    wsDot.title = 'WebSocket: ' + (labels[state] ?? state);
  }

  function appendResponse(text) {
    responseBox.style.display = 'block';
    responseBox.textContent += text;
    responseBox.scrollTop = responseBox.scrollHeight;
  }

  // ── Streaming (started after WS setup handshake completes) ────────────────

  function startStreaming() {
    // Audio — 16-bit signed PCM @ 16 kHz mono
    streamAudioCtx = new AudioContext({ sampleRate: 16000 });
    const src = streamAudioCtx.createMediaStreamSource(micStream);
    scriptProcessor = streamAudioCtx.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (e) => {
      if (!wsReady || !ws || ws.readyState !== WebSocket.OPEN) return;
      const pcm = float32ToInt16(e.inputBuffer.getChannelData(0));
      ws.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: bufferToBase64(pcm.buffer) }],
        },
      }));
    };

    src.connect(scriptProcessor);
    scriptProcessor.connect(streamAudioCtx.destination);

    // Video — JPEG frames at VIDEO_FPS
    const canvas = document.createElement('canvas');
    canvas.width  = 640;
    canvas.height = 360;
    const ctx2d = canvas.getContext('2d');

    videoInterval = setInterval(() => {
      if (!wsReady || !ws || ws.readyState !== WebSocket.OPEN) return;
      if (!video.videoWidth) return;
      ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!wsReady || !ws || ws.readyState !== WebSocket.OPEN) return;
          ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{ mimeType: 'image/jpeg', data: reader.result.split(',')[1] }],
            },
          }));
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.7);
    }, 1000 / VIDEO_FPS);
  }

  // ── Stop ──────────────────────────────────────────────────────────────────

  function stopCapture() {
    if (screenStream)    { screenStream.getTracks().forEach(t => t.stop());    screenStream = null; }
    if (micStream)       { micStream.getTracks().forEach(t => t.stop());       micStream = null; }
    if (animFrame)       { cancelAnimationFrame(animFrame);                    animFrame = null; }
    if (meterAudioCtx)   { meterAudioCtx.close();                             meterAudioCtx = null; }
    if (scriptProcessor) { scriptProcessor.disconnect();                       scriptProcessor = null; }
    if (streamAudioCtx)  { streamAudioCtx.close();                            streamAudioCtx = null; }
    if (videoInterval)   { clearInterval(videoInterval);                      videoInterval = null; }
    if (ws)              { ws.close();                                         ws = null; }
    video.srcObject = null;
    wsReady = false;
    setAudioLevel(0);
    setWsDot('off');
    setCapturingState(false);
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  async function startCapture() {
    // 1. API key — read from sessionStorage or prompt the user
    let apiKey = sessionStorage.getItem('gemini_api_key');
    if (!apiKey) {
      apiKey = window.prompt('Enter your Google AI Studio API key:');
      if (!apiKey || !apiKey.trim()) return;
      sessionStorage.setItem('gemini_api_key', apiKey.trim());
    }
    apiKey = apiKey.trim();

    showError('');
    responseBox.textContent = '';
    responseBox.style.display = 'none';

    try {
      // 2. Acquire screen + mic streams
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', frameRate: 15 },
        audio: false,
      });

      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });

      video.srcObject = screenStream;

      // 3. Level-meter (native sample rate, display only)
      meterAudioCtx = new AudioContext();
      const meterSrc = meterAudioCtx.createMediaStreamSource(micStream);
      const analyser = meterAudioCtx.createAnalyser();
      analyser.fftSize = 256;
      meterSrc.connect(analyser);
      const meterData = new Uint8Array(analyser.frequencyBinCount);
      function tick() {
        analyser.getByteFrequencyData(meterData);
        const avg = meterData.reduce((s, v) => s + v, 0) / meterData.length;
        setAudioLevel(Math.min(100, avg * 2.2));
        animFrame = requestAnimationFrame(tick);
      }
      tick();

      screenStream.getVideoTracks()[0].addEventListener('ended', stopCapture);
      setCapturingState(true);

      // 4. Open WebSocket to Gemini Multimodal Live API
      setWsDot('connecting');
      ws = new WebSocket(`${WS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`);

      ws.onopen = () => {
        // Send the setup message; streaming begins once the server ACKs with setupComplete
        ws.send(JSON.stringify({
          setup: {
            model: MODEL,
            generationConfig: { responseModalities: ['TEXT'] },
          },
        }));
      };

      ws.onmessage = (evt) => {
        let msg;
        try { msg = JSON.parse(evt.data); } catch { return; }

        if (msg.setupComplete) {
          wsReady = true;
          setWsDot('on');
          startStreaming();
          return;
        }

        // Accumulate text from model turns
        const parts = msg.serverContent?.modelTurn?.parts ?? [];
        parts.forEach((p) => { if (p.text) appendResponse(p.text); });
      };

      ws.onerror = () => {
        setWsDot('error');
        showError('WebSocket error — check your API key and try again.');
        stopCapture();
      };

      ws.onclose = (evt) => {
        wsReady = false;
        if (evt.code !== 1000 && capturing) {
          setWsDot('error');
          showError(`Connection closed (code ${evt.code}).`);
        } else {
          setWsDot('off');
        }
      };

    } catch (err) {
      stopCapture();
      showError(err.message || 'Permission denied or cancelled.');
    }
  }

  // ── Event listeners ────────────────────────────────────────────────────────

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
