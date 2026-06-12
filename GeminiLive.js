// GeminiLive — Cap: robot chef agent. Watches your screen, listens, talks back.
(function () {
  const WS_ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
  const MODEL       = 'models/gemini-2.5-flash';
  const VIDEO_FPS   = 1;

  const SYSTEM_INSTRUCTION = `You are Cap, an expert AI robot chef mentor built into the Robot Chef App. You can see the user's screen and hear their voice in real time.

Your role:
- Watch the screen and give live, specific cooking guidance based on what you actually observe
- Answer cooking questions clearly and practically — be direct, encouraging, like a seasoned chef beside them
- Call save_note when you spot something worth remembering (a technique, a mistake, a tip)
- Call set_timer whenever a timed step comes up (simmering, resting meat, boiling pasta, etc.)

You are the main entry point for the user's cooking journey. Greet them when the session starts.`;

  // ── State ──────────────────────────────────────────────────────────────────
  let capturing       = false;
  let minimized       = false;
  let screenStream    = null;
  let micStream       = null;
  let meterAudioCtx   = null;
  let streamAudioCtx  = null;
  let scriptProcessor = null;
  let animFrame       = null;
  let videoInterval   = null;
  let timerInterval   = null;
  let ws              = null;
  let wsReady         = false;
  let currentCapText  = '';   // buffer for streaming model turns
  let currentCapEl    = null; // DOM node being streamed into
  let transcript      = [];   // { role, text, time } — for download

  // ── Build DOM ──────────────────────────────────────────────────────────────

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: '50',
    width: '360px', background: '#111827', border: '1px solid #374151',
    borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.5)',
    overflow: 'hidden', fontFamily: 'inherit',
  });

  // — Header —
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.625rem 0.875rem', background: '#1f2937',
    borderBottom: '1px solid #374151',
  });

  const headerLeft = document.createElement('div');
  Object.assign(headerLeft.style, { display: 'flex', alignItems: 'center', gap: '0.45rem' });

  const headerIcon = document.createElement('span');
  headerIcon.textContent = '👨‍🍳';
  headerIcon.style.fontSize = '0.85rem';

  const headerTitle = document.createElement('span');
  headerTitle.textContent = 'Cap';
  Object.assign(headerTitle.style, { color: '#f9fafb', fontSize: '0.85rem', fontWeight: '700' });

  const headerSub = document.createElement('span');
  headerSub.textContent = 'Robot Chef';
  Object.assign(headerSub.style, { color: '#6b7280', fontSize: '0.72rem' });

  const liveBadge = document.createElement('span');
  liveBadge.textContent = 'LIVE';
  Object.assign(liveBadge.style, {
    background: '#16a34a', color: '#fff', fontSize: '0.6rem', fontWeight: '700',
    padding: '0.1rem 0.35rem', borderRadius: '999px', letterSpacing: '0.05em', display: 'none',
  });

  const wsDot = document.createElement('span');
  wsDot.title = 'WebSocket: disconnected';
  Object.assign(wsDot.style, {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#4b5563', display: 'inline-block', transition: 'background 300ms',
  });

  headerLeft.append(headerIcon, headerTitle, headerSub, liveBadge, wsDot);

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '▼';
  toggleBtn.title = 'Minimize';
  Object.assign(toggleBtn.style, {
    background: 'none', border: 'none', color: '#9ca3af',
    cursor: 'pointer', fontSize: '0.85rem', lineHeight: '1', padding: '0.1rem 0.25rem',
  });

  header.append(headerLeft, toggleBtn);

  // — Body —
  const body = document.createElement('div');
  Object.assign(body.style, {
    padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
  });

  // Screen preview
  const previewWrap = document.createElement('div');
  Object.assign(previewWrap.style, {
    position: 'relative', background: '#000',
    borderRadius: '0.625rem', overflow: 'hidden', aspectRatio: '16/9',
  });

  const video = document.createElement('video');
  video.autoplay = true; video.muted = true; video.playsInline = true;
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
  micIcon.textContent = '🎙️'; micIcon.style.fontSize = '0.85rem';

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

  // Countdown timer (hidden until set_timer tool fires)
  const timerBar = document.createElement('div');
  Object.assign(timerBar.style, {
    display: 'none', alignItems: 'center', justifyContent: 'space-between',
    background: '#1c1917', border: '1px solid #78350f',
    borderRadius: '0.5rem', padding: '0.3rem 0.6rem',
  });
  const timerLabel = document.createElement('span');
  Object.assign(timerLabel.style, { color: '#fbbf24', fontSize: '0.75rem', fontWeight: '600' });
  const timerCancelBtn = document.createElement('button');
  timerCancelBtn.textContent = '✕';
  Object.assign(timerCancelBtn.style, {
    background: 'none', border: 'none', color: '#92400e',
    cursor: 'pointer', fontSize: '0.75rem', lineHeight: '1',
  });
  timerBar.append(timerLabel, timerCancelBtn);

  // Chat area
  const chatBox = document.createElement('div');
  Object.assign(chatBox.style, {
    background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: '0.625rem', padding: '0.5rem 0.6rem',
    maxHeight: '180px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  });

  // Error box
  const errorBox = document.createElement('div');
  Object.assign(errorBox.style, {
    background: 'rgba(153,27,27,.3)', border: '1px solid #7f1d1d',
    borderRadius: '0.5rem', padding: '0.4rem 0.6rem',
    color: '#fca5a5', fontSize: '0.72rem', display: 'none',
  });

  // Text input row
  const inputRow = document.createElement('div');
  Object.assign(inputRow.style, { display: 'flex', gap: '0.4rem' });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'Type a message to Cap…';
  Object.assign(textInput.style, {
    flex: '1', background: '#1f2937', border: '1px solid #374151',
    borderRadius: '0.5rem', padding: '0.45rem 0.6rem',
    color: '#f3f4f6', fontSize: '0.78rem', outline: 'none',
  });

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  Object.assign(sendBtn.style, {
    background: '#2563eb', border: 'none', borderRadius: '0.5rem',
    color: '#fff', fontSize: '0.78rem', fontWeight: '600',
    padding: '0.45rem 0.7rem', cursor: 'pointer', transition: 'background 150ms',
    whiteSpace: 'nowrap',
  });
  inputRow.append(textInput, sendBtn);

  // Control button
  const ctrlBtn = document.createElement('button');
  ctrlBtn.textContent = '▶ Start Session';
  Object.assign(ctrlBtn.style, {
    width: '100%', padding: '0.55rem', borderRadius: '0.625rem', border: 'none',
    background: '#2563eb', color: '#fff', fontSize: '0.8rem', fontWeight: '600',
    cursor: 'pointer', transition: 'background 150ms',
  });

  // Action row: save transcript + clear key
  const actionRow = document.createElement('div');
  Object.assign(actionRow.style, { display: 'flex', gap: '0.4rem' });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Transcript';
  Object.assign(saveBtn.style, {
    flex: '1', padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #374151',
    background: 'none', color: '#9ca3af', fontSize: '0.72rem', cursor: 'pointer',
    transition: 'background 150ms',
  });

  const clearKeyBtn = document.createElement('button');
  clearKeyBtn.textContent = '🔑 Clear Key';
  Object.assign(clearKeyBtn.style, {
    flex: '1', padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #374151',
    background: 'none', color: '#9ca3af', fontSize: '0.72rem', cursor: 'pointer',
    transition: 'background 150ms',
  });
  actionRow.append(saveBtn, clearKeyBtn);

  const hint = document.createElement('p');
  hint.textContent = 'Your browser will ask for screen & microphone permission.';
  Object.assign(hint.style, { color: '#4b5563', fontSize: '0.65rem', textAlign: 'center', margin: '0' });

  body.append(previewWrap, micRow, timerBar, chatBox, errorBox, inputRow, ctrlBtn, actionRow, hint);
  panel.append(header, body);
  document.body.appendChild(panel);

  // ── Encoding helpers ───────────────────────────────────────────────────────

  function float32ToInt16(f32) {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      const s = Math.max(-1, Math.min(1, f32[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return out;
  }

  function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const CHUNK = 0x8000;
    let bin = '';
    for (let i = 0; i < bytes.length; i += CHUNK)
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    return btoa(bin);
  }

  // ── UI state helpers ───────────────────────────────────────────────────────

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
    ctrlBtn.textContent = active ? '⏹ End Session' : '▶ Start Session';
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

  // ── Chat messages ──────────────────────────────────────────────────────────

  function ts() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function addChatMessage(role, text) {
    // role: 'cap' | 'user' | 'note' | 'system'
    const wrap = document.createElement('div');
    const isUser = role === 'user';
    const isNote = role === 'note';
    const isSys  = role === 'system';

    Object.assign(wrap.style, {
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: '0.15rem',
    });

    if (!isSys) {
      const label = document.createElement('span');
      label.textContent = role === 'cap' ? 'Cap' : role === 'user' ? 'You' : '📌 Note';
      Object.assign(label.style, {
        fontSize: '0.62rem', fontWeight: '700',
        color: isUser ? '#34d399' : isNote ? '#fbbf24' : '#60a5fa',
      });
      wrap.appendChild(label);
    }

    const bubble = document.createElement('div');
    bubble.textContent = isSys ? text : text;
    Object.assign(bubble.style, {
      background: isUser ? '#14532d' : isNote ? '#1c1400' : isSys ? 'transparent' : '#1e293b',
      border: isNote ? '1px solid #78350f' : 'none',
      borderRadius: '0.5rem',
      padding: isSys ? '0' : '0.35rem 0.55rem',
      color: isUser ? '#bbf7d0' : isNote ? '#fde68a' : isSys ? '#4b5563' : '#cbd5e1',
      fontSize: isSys ? '0.65rem' : '0.78rem',
      lineHeight: '1.45',
      maxWidth: isSys ? '100%' : '92%',
      textAlign: isSys ? 'center' : 'left',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    });

    wrap.appendChild(bubble);
    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;

    transcript.push({ role, text, time: new Date() });
    return bubble; // returned so streaming can append to it
  }

  // Begin a new streaming Cap bubble; returns the bubble element
  function beginCapStream() {
    currentCapText = '';
    currentCapEl = addChatMessage('cap', '');
    return currentCapEl;
  }

  function appendCapStream(text) {
    currentCapText += text;
    if (currentCapEl) {
      currentCapEl.textContent = currentCapText;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  function finalizeCapStream() {
    if (currentCapText && transcript.length) {
      // Update the transcript entry for the current cap turn
      for (let i = transcript.length - 1; i >= 0; i--) {
        if (transcript[i].role === 'cap') { transcript[i].text = currentCapText; break; }
      }
    }
    currentCapEl = null;
    currentCapText = '';
  }

  // ── Countdown timer (set_timer tool) ──────────────────────────────────────

  function startTimer(seconds, label) {
    if (timerInterval) clearInterval(timerInterval);
    let remaining = Math.round(seconds);
    timerBar.style.display = 'flex';

    function update() {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      timerLabel.textContent = `⏱ ${label}: ${m}:${s.toString().padStart(2, '0')}`;
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerLabel.textContent = `✅ ${label}: Done!`;
        setTimeout(() => { timerBar.style.display = 'none'; }, 6000);
      }
      remaining--;
    }
    update();
    timerInterval = setInterval(update, 1000);
  }

  timerCancelBtn.addEventListener('click', () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerBar.style.display = 'none';
  });

  // ── Tool handlers ──────────────────────────────────────────────────────────

  const toolHandlers = {
    save_note(args) {
      const note = args.note || '(empty note)';
      addChatMessage('note', note);
      return { result: 'Note saved.' };
    },
    set_timer(args) {
      const minutes = args.minutes ?? args.duration_minutes ?? 1;
      const seconds = args.seconds ?? (minutes * 60);
      const label   = args.label || args.name || `${minutes}min timer`;
      startTimer(seconds, label);
      return { result: `Timer started: ${label}` };
    },
  };

  function handleToolCall(toolCall) {
    const responses = (toolCall.functionCalls || []).map((call) => {
      const handler = toolHandlers[call.name];
      const response = handler
        ? handler(call.args || {})
        : { error: `Unknown tool: ${call.name}` };
      return { id: call.id, name: call.name, response };
    });

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ toolResponse: { functionResponses: responses } }));
    }
  }

  // ── Transcript download ────────────────────────────────────────────────────

  function downloadTranscript() {
    if (!transcript.length) { alert('No conversation to save yet.'); return; }
    const lines = [
      'Cap Session Transcript',
      `Date: ${new Date().toLocaleString()}`,
      '─'.repeat(40),
      '',
    ];
    transcript.forEach(({ role, text, time }) => {
      const t = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const who = role === 'cap' ? 'Cap' : role === 'user' ? 'You' : role === 'note' ? '📌 Note' : 'System';
      lines.push(`[${t}] ${who}: ${text}`);
    });
    lines.push('', '─'.repeat(40), 'End of session');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cap-session-${Date.now()}.txt`;
    a.click();
  }

  // ── Send a text message to Cap ─────────────────────────────────────────────

  function sendTextMessage() {
    const text = textInput.value.trim();
    if (!text) return;
    if (!wsReady || !ws || ws.readyState !== WebSocket.OPEN) {
      showError('Start a session first to talk to Cap.');
      return;
    }
    addChatMessage('user', text);
    textInput.value = '';
    ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      },
    }));
  }

  // ── Media streaming (begins after WS setupComplete) ────────────────────────

  function startStreaming() {
    // Audio — 16-bit PCM @ 16 kHz mono
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

    // Video — JPEG screen frames
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 360;
    const ctx2d = canvas.getContext('2d');

    videoInterval = setInterval(() => {
      if (!wsReady || !ws || ws.readyState !== WebSocket.OPEN || !video.videoWidth) return;
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
    addChatMessage('system', `— session ended ${ts()} —`);
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  async function startCapture() {
    let apiKey = sessionStorage.getItem('gemini_api_key');
    if (!apiKey) {
      apiKey = window.prompt('Enter your Google AI Studio API key:');
      if (!apiKey || !apiKey.trim()) return;
      sessionStorage.setItem('gemini_api_key', apiKey.trim());
    }
    apiKey = apiKey.trim();

    showError('');
    addChatMessage('system', `— session started ${ts()} —`);

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

      // Level meter (native sample rate, display only)
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

      // Open WebSocket
      setWsDot('connecting');
      ws = new WebSocket(`${WS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          setup: {
            model: MODEL,
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            generationConfig: { responseModalities: ['TEXT'] },
            tools: [{
              functionDeclarations: [
                {
                  name: 'save_note',
                  description: 'Save an important observation, tip, or reminder from the session.',
                  parameters: {
                    type: 'object',
                    properties: {
                      note: { type: 'string', description: 'The note to save.' },
                    },
                    required: ['note'],
                  },
                },
                {
                  name: 'set_timer',
                  description: 'Start a cooking countdown timer shown to the user.',
                  parameters: {
                    type: 'object',
                    properties: {
                      minutes:  { type: 'number', description: 'Duration in minutes.' },
                      seconds:  { type: 'number', description: 'Duration in seconds (use instead of minutes for short timers).' },
                      label:    { type: 'string', description: 'Short name for the timer, e.g. "Pasta", "Rest meat".' },
                    },
                  },
                },
              ],
            }],
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

        // Tool calls
        if (msg.toolCall) {
          handleToolCall(msg.toolCall);
          return;
        }

        // Streaming model text
        const parts = msg.serverContent?.modelTurn?.parts ?? [];
        parts.forEach((p) => {
          if (!p.text) return;
          if (!currentCapEl) beginCapStream();
          appendCapStream(p.text);
        });

        // Turn complete — finalize the streamed bubble
        if (msg.serverContent?.turnComplete) finalizeCapStream();
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
  ctrlBtn.addEventListener('mouseenter', () => { ctrlBtn.style.background = capturing ? '#b91c1c' : '#1d4ed8'; });
  ctrlBtn.addEventListener('mouseleave', () => { ctrlBtn.style.background = capturing ? '#dc2626' : '#2563eb'; });

  sendBtn.addEventListener('click', sendTextMessage);
  sendBtn.addEventListener('mouseenter', () => { sendBtn.style.background = '#1d4ed8'; });
  sendBtn.addEventListener('mouseleave', () => { sendBtn.style.background = '#2563eb'; });

  textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(); } });

  saveBtn.addEventListener('click', downloadTranscript);
  saveBtn.addEventListener('mouseenter', () => { saveBtn.style.background = '#1f2937'; });
  saveBtn.addEventListener('mouseleave', () => { saveBtn.style.background = 'none'; });

  clearKeyBtn.addEventListener('click', () => {
    sessionStorage.removeItem('gemini_api_key');
    addChatMessage('system', '— API key cleared; next session will prompt again —');
  });
  clearKeyBtn.addEventListener('mouseenter', () => { clearKeyBtn.style.background = '#1f2937'; });
  clearKeyBtn.addEventListener('mouseleave', () => { clearKeyBtn.style.background = 'none'; });

  toggleBtn.addEventListener('click', () => {
    minimized = !minimized;
    body.style.display = minimized ? 'none' : 'flex';
    header.style.borderBottom = minimized ? 'none' : '1px solid #374151';
    panel.style.width = minimized ? 'auto' : '360px';
    toggleBtn.textContent = minimized ? '▲' : '▼';
    toggleBtn.title = minimized ? 'Expand' : 'Minimize';
  });
})();
