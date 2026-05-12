/* ═══════════════════════════════════════════════════════════════
   Cap — Robot Chef Mentor  |  app.js
   ═══════════════════════════════════════════════════════════════ */

// ── Config ────────────────────────────────────────────────────
const CFG = {
  LESSON_SECS:    30 * 60,   // 30 minutes
  COOLDOWN_SECS:  15 * 60,   // 15 minutes
  BACKEND:        '',         // same origin — Flask serves both UI and API
  CAPTURE_MS:     3000,      // camera frame interval
  AUTO_GAP_MS:    8000,      // min gap between auto-feedback calls
};

// ── System prompts ────────────────────────────────────────────
const PROMPTS = {
  kids: `You are Cap, a friendly Robot Chef mentor for kids aged 7–12.
Personality: warm, patient, wildly encouraging, safety-obsessed, uses simple everyday words.
Teaching focus: kitchen safety rules first, ingredient identification, simple prep (washing, tearing, stirring, measuring).
Format: MAX 2–3 sentences. End with a cheer or positive reinforcement.
Camera images: briefly note one thing you see, then give ONE safety tip or observation.
Never suggest knives, open flames, or raw meat without explicitly saying "ask a grown-up first!".`,

  teens: `You are Cap, a knowledgeable Robot Chef mentor for teens aged 14+.
Personality: practical, respectful, treats them as capable young chefs, passionate about global flavors.
Teaching focus: global cuisines and flavor science, knife technique (with safety), restaurant-style mise en place, plating.
Format: 3–4 sentences max. Use real culinary vocabulary they can grow into.
Camera images: give specific technical feedback on technique, setup, or efficiency.
Mention safety for hot/sharp tools but treat them as independent and capable.`,
};

// ── Care pathway ──────────────────────────────────────────────
const CARE_KEYWORDS = [
  'prayer','pray','praying','prayed',
  'grief','grieve','grieving','grieved',
  'fear','scared','afraid','frightened',
  'sad','sadness','cry','crying','cried','tears',
  'hurt','hurting','pain','lonely','alone',
  'died','death','dead','dying',
  'depressed','depression','hopeless',
  'worried','worry','anxious','anxiety',
  'god','jesus','church','bible','heaven','faith',
];

const CARE_POOL = [
  {
    ack: "What you're feeling right now is completely real, and it matters so much. It takes real courage to say something — I'm really glad you did.",
    prayer: '"Heavenly Father, please be near to this child right now. You know exactly what they\'re carrying. Wrap them in Your peace and remind them how deeply they are loved. Amen."',
  },
  {
    ack: "I hear you, and I want you to know — your feelings are valid and you are not alone. Feeling sad, scared, or worried doesn't mean something is wrong with you.",
    prayer: '"Lord, comfort this child in their moment of need. You promised to be close to the brokenhearted. Let them feel Your presence and love right now. Amen."',
  },
  {
    ack: "Thank you for trusting me with something so personal. I care about you, and right now the most important thing isn't cooking — it's making sure you're okay.",
    prayer: '"God, thank You for this young person. Please guide them to the right person who can help, and fill their heart with the peace that passes understanding. Amen."',
  },
];

// ── Offline safety checklists ─────────────────────────────────
const CHECKLISTS = {
  kids: [
    { i:'🧼', t:'Wash hands for 20 seconds with soap and warm water' },
    { i:'👚', t:'Tie back long hair and roll up your sleeves' },
    { i:'🧤', t:'Always use oven mitts for anything hot' },
    { i:'🔪', t:'Ask a grown-up before touching any knives — every time!' },
    { i:'🍽️', t:'Keep your workspace clean and dry' },
    { i:'💧', t:'Minor burns: cool running water for 10 minutes — NO ice' },
    { i:'🚫', t:'Never leave the stove or oven unattended' },
    { i:'📢', t:'Always tell a grown-up when you start cooking' },
    { i:'🌡️', t:'Let hot food cool before tasting it' },
    { i:'📱', t:'Keep water and devices away from hot surfaces' },
  ],
  teens: [
    { i:'🧼', t:'Wash hands and sanitize your prep surface before starting' },
    { i:'🔪', t:'Sharp knives are safer than dull ones — store them properly' },
    { i:'🔥', t:'Never leave a hot pan unattended — use a timer' },
    { i:'🧊', t:'Thaw proteins in the fridge, never on the counter' },
    { i:'🌡️', t:'Chicken 165°F | Pork 145°F | Ground beef 160°F' },
    { i:'🧹', t:'Mise en place: prep everything before you turn on the heat' },
    { i:'💦', t:'Pat protein dry before searing — moisture kills the crust' },
    { i:'🏥', t:'Know exactly where your fire extinguisher is' },
    { i:'🫙', t:'Label and date everything you store in the fridge' },
    { i:'⚡', t:'Keep all appliances away from water at all times' },
  ],
};

// ── App state ─────────────────────────────────────────────────
const S = {
  ageGroup:     null,         // 'kids' | 'teens'
  mode:         'setup',      // 'setup' | 'cooking' | 'cooldown' | 'care'
  isOnline:     true,         // false = backend unreachable, use offline fallback
  isThinking:   false,
  isSpeaking:   false,
  isMicOn:      false,
  lessonLeft:   CFG.LESSON_SECS,
  cooldownLeft: CFG.COOLDOWN_SECS,
  lessonTimer:  null,
  cooldownTimer:null,
  captureLoop:  null,
  lastAuto:     0,
  stream:       null,
  history:      [],           // [{role, parts:[{text}]}] — managed server-side, mirrored here
  recognition:  null,
  // API key lives server-side only; no client-side key needed
};

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPiP();
  initSpeechRecognition();
  spawnStars('cooldown-stars', 70);
  spawnStars('care-stars', 50);
  checkBackend(); // probe server on load so the setup screen shows live status
});

async function checkBackend() {
  const dot   = document.getElementById('backend-dot');
  const label = document.getElementById('backend-label');
  try {
    const res = await fetch(`${CFG.BACKEND}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      S.isOnline = true;
      if (dot)   { dot.className   = 'w-2 h-2 rounded-full bg-green-400'; }
      if (label) { label.textContent = 'Backend connected'; label.className = 'text-xs text-green-400'; }
    } else { throw new Error('non-ok'); }
  } catch {
    S.isOnline = false;
    if (dot)   { dot.className   = 'w-2 h-2 rounded-full bg-amber-400'; }
    if (label) { label.textContent = 'Backend offline — using safety guides'; label.className = 'text-xs text-amber-400'; }
  }
}

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────
function selectAge(group) {
  S.ageGroup = group;

  document.querySelectorAll('.age-card').forEach(b => {
    b.classList.remove('border-blue-500','bg-blue-900/30','border-cyan-500','bg-cyan-900/30');
    b.classList.add('border-gray-700');
  });

  const btn = document.getElementById('btn-' + group);
  btn.classList.remove('border-gray-700');
  if (group === 'kids') {
    btn.classList.add('border-blue-500','bg-blue-900/30');
  } else {
    btn.classList.add('border-cyan-500','bg-cyan-900/30');
  }

  const sb = document.getElementById('start-btn');
  sb.disabled = false;
  sb.className = `w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300
    bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500
    text-white cursor-pointer shadow-lg shadow-blue-900/50 hover:scale-[1.02]`;
}

async function startApp() {
  if (!S.ageGroup) return;

  // Re-probe backend in case it came up after page load
  await checkBackend();

  // Transition screens
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  S.mode = 'cooking';

  // Age badge
  const badge = document.getElementById('hdr-badge');
  badge.textContent = S.ageGroup === 'kids' ? 'Kids Mode (7–12) 👶' : 'Teen Mode (14+) 🧑‍🍳';
  badge.className   = `text-xs leading-tight ${S.ageGroup === 'kids' ? 'text-blue-400' : 'text-cyan-400'}`;

  applyModeUI();
  startLessonTimer();

  await requestCamera();

  if (!S.isOnline) {
    applyModeUI();
    showOfflineChecklist();
  } else {
    startAutoCapture();
  }

  // Welcome
  const welcome = {
    kids: "Hey there, chef! I'm Cap, your Robot Chef buddy! 🤖👨‍🍳 Rule #1 always: wash your hands for 20 seconds first! What are we making today?",
    teens: "Welcome to the kitchen, chef. I'm Cap — your AI sous chef. 🤖 Tell me what dish you're working on and I'll coach you through it step by step.",
  };
  addCapMsg(welcome[S.ageGroup]);
  speak(welcome[S.ageGroup]);
}

// ─────────────────────────────────────────────────────────────
// LESSON TIMER
// ─────────────────────────────────────────────────────────────
function startLessonTimer() {
  S.lessonLeft = CFG.LESSON_SECS;
  renderTimerDisplay();

  S.lessonTimer = setInterval(() => {
    S.lessonLeft = Math.max(0, S.lessonLeft - 1);
    renderTimerDisplay();

    if (S.lessonLeft === 300) {           // 5-min warning
      const msg = "⏰ Five minutes left in our lesson! Let's start wrapping up.";
      addCapMsg(msg);
      speak("Five minutes left in our lesson. Let's wrap up.");
    }

    if (S.lessonLeft === 0) {
      clearInterval(S.lessonTimer);
      triggerCooldown();
    }
  }, 1000);
}

function renderTimerDisplay() {
  const m   = Math.floor(S.lessonLeft / 60);
  const s   = S.lessonLeft % 60;
  const txt = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const disp = document.getElementById('timer-display');
  disp.textContent = txt;

  const pct = (S.lessonLeft / CFG.LESSON_SECS) * 100;
  const arc = document.getElementById('timer-arc');
  arc.setAttribute('stroke-dasharray', `${pct.toFixed(1)} ${(100 - pct).toFixed(1)}`);

  if (S.lessonLeft <= 60)  { arc.setAttribute('stroke','#ef4444'); disp.style.color = '#f87171'; }
  else if (S.lessonLeft <= 300) { arc.setAttribute('stroke','#f59e0b'); disp.style.color = '#fbbf24'; }
  else                          { arc.setAttribute('stroke','#3b82f6'); disp.style.color = '';        }
}

// ─────────────────────────────────────────────────────────────
// COOLDOWN
// ─────────────────────────────────────────────────────────────
function triggerCooldown() {
  stopAutoCapture();
  S.mode = 'cooldown';

  document.getElementById('cooldown-overlay').classList.remove('hidden');
  speak("Great lesson today, chef! Time for a mandatory 15-minute break. Let's clean up the kitchen!", true);

  S.cooldownLeft = CFG.COOLDOWN_SECS;
  renderCooldown();

  S.cooldownTimer = setInterval(() => {
    S.cooldownLeft = Math.max(0, S.cooldownLeft - 1);
    renderCooldown();
    if (S.cooldownLeft === 0) {
      clearInterval(S.cooldownTimer);
      endCooldown();
    }
  }, 1000);
}

function renderCooldown() {
  const m = Math.floor(S.cooldownLeft / 60);
  const s = S.cooldownLeft % 60;
  document.getElementById('cooldown-display').textContent =
    `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const pct = (S.cooldownLeft / CFG.COOLDOWN_SECS) * 100;
  document.getElementById('cooldown-bar').style.width = `${pct}%`;
}

function endCooldown() {
  document.getElementById('cooldown-overlay').classList.add('hidden');
  S.mode = 'cooking';
  S.lessonLeft = CFG.LESSON_SECS;
  document.getElementById('timer-arc').setAttribute('stroke','#3b82f6');
  document.getElementById('timer-display').style.color = '';
  startLessonTimer();

  if (S.isOnline) startAutoCapture();

  const msg = "Welcome back! Kitchen's clean, hands are washed — let's keep cooking! 🍳 What are we tackling next?";
  addCapMsg(msg);
  speak("Welcome back, chef! Let's keep cooking!");
}

// ─────────────────────────────────────────────────────────────
// CAMERA
// ─────────────────────────────────────────────────────────────
async function requestCamera() {
  try {
    S.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'environment' },
      audio: false,
    });
    document.getElementById('camera-feed').srcObject = S.stream;
    document.getElementById('no-cam').style.display = 'none';
    setLiveIndicator(true);
    return true;
  } catch (e) {
    console.warn('Camera:', e.message);
    return false;
  }
}

function toggleCamera() {
  if (S.stream) {
    S.stream.getTracks().forEach(t => t.stop());
    S.stream = null;
    document.getElementById('camera-feed').srcObject = null;
    document.getElementById('no-cam').style.display = 'flex';
    setLiveIndicator(false);
    stopAutoCapture();
  } else {
    requestCamera().then(ok => {
      if (ok && S.isOnline && S.mode === 'cooking') startAutoCapture();
    });
  }
}

function grabFrame() {
  const video  = document.getElementById('camera-feed');
  const canvas = document.getElementById('cap-canvas');
  if (!video.videoWidth) return null;
  canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
  return canvas.toDataURL('image/jpeg', 0.72).split(',')[1];
}

// ─────────────────────────────────────────────────────────────
// AUTO-CAPTURE LOOP (online mode)
// ─────────────────────────────────────────────────────────────
function startAutoCapture() {
  if (S.captureLoop) return;
  S.captureLoop = setInterval(doAutoFeedback, CFG.CAPTURE_MS);
}

function stopAutoCapture() {
  if (S.captureLoop) { clearInterval(S.captureLoop); S.captureLoop = null; }
}

async function doAutoFeedback() {
  if (S.mode !== 'cooking')           return;
  if (S.isThinking || S.isSpeaking)   return;
  if (!S.stream)                      return;
  if (Date.now() - S.lastAuto < CFG.AUTO_GAP_MS) return;
  S.lastAuto = Date.now();

  const frame = grabFrame();
  if (!frame) return;

  const prompt = S.ageGroup === 'kids'
    ? "Look at this kitchen scene. Give one quick, friendly safety tip or encouraging comment in 1–2 sentences for a child."
    : "Look at this cooking scene. Give one brief, specific technical tip or observation in 1–2 sentences for a teen chef.";

  setThinking(true);
  try {
    const reply = await callVision(frame);
    setThinking(false);
    if (reply) { showBubble(reply); speak(reply); }
  } catch (e) {
    setThinking(false);
    // Silent failure on auto-feedback — backend status caught on next user message
  }
}

// ─────────────────────────────────────────────────────────────
// BACKEND API CALLS
// ─────────────────────────────────────────────────────────────

/** Auto-vision: fire-and-forget frame analysis, no history update */
async function callVision(frameB64) {
  const res = await fetch(`${CFG.BACKEND}/api/coach/vision`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ image: frameB64, age: S.ageGroup }),
  });
  if (!res.ok) throw new Error(`vision HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.reply;
}

/** Chat: user message + optional frame, updates S.history from server response */
async function callChat(userText, frameB64 = null) {
  const body = {
    message: userText,
    age:     S.ageGroup,
    history: S.history,
  };
  if (frameB64) body.image = frameB64;

  const res = await fetch(`${CFG.BACKEND}/api/coach/chat`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`chat HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  S.history = data.history || S.history; // server manages history trimming
  return data.reply;
}

// ─────────────────────────────────────────────────────────────
// MESSAGE HANDLING
// ─────────────────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('user-input');
  const text  = input.value.trim();
  if (!text || S.mode === 'cooldown') return;
  input.value = '';

  addUserMsg(text);

  // Care pathway takes priority
  if (hitsCareKeyword(text)) { triggerCare(text); return; }

  if (S.isOnline) {
    await handleOnlineMsg(text);
  } else {
    handleOfflineMsg(text);
  }
}

async function handleOnlineMsg(text) {
  setThinking(true);
  stopAutoCapture();

  const frame = S.stream ? grabFrame() : null;

  try {
    const reply = await callChat(text, frame);
    setThinking(false);
    addCapMsg(reply);
    speak(reply);
  } catch (e) {
    setThinking(false);
    console.error('Backend error:', e.message);

    // Auto-fall to offline if backend is unreachable
    S.isOnline = false;
    applyModeUI();
    showOfflineChecklist();

    const fb = offlineFallback(text);
    addCapMsg(fb);
    speak(fb);
  }

  if (S.isOnline && S.mode === 'cooking') {
    setTimeout(startAutoCapture, 5000);
  }
}

function handleOfflineMsg(text) {
  setThinking(true);
  setTimeout(() => {
    setThinking(false);
    const fb = offlineFallback(text);
    addCapMsg(fb);
    speak(fb);
  }, 700);
}

function offlineFallback(text) {
  const list = CHECKLISTS[S.ageGroup || 'kids'];
  const item = list[Math.floor(Math.random() * list.length)];
  const phrases = [
    `I'm offline right now, but remember: ${item.i} ${item.t}`,
    `No connection at the moment — keep this in mind: ${item.i} ${item.t}`,
    `Offline mode here! Safety tip: ${item.i} ${item.t} — You're doing great!`,
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

// ─────────────────────────────────────────────────────────────
// CARE PATHWAY
// ─────────────────────────────────────────────────────────────
function hitsCareKeyword(text) {
  const lower = text.toLowerCase();
  return CARE_KEYWORDS.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
}

function triggerCare(userText) {
  stopAutoCapture();
  stopSpeech();
  S.mode = 'care'; // soft-pause cooking

  const entry = CARE_POOL[Math.floor(Math.random() * CARE_POOL.length)];
  document.getElementById('care-ack').textContent    = entry.ack;
  document.getElementById('care-prayer').textContent = entry.prayer;
  document.getElementById('care-overlay').classList.remove('hidden');

  setTimeout(() => {
    speak(`${entry.ack} Let's pray together. ${entry.prayer.replace(/"/g,'')} Please talk to a trusted adult.`, true);
  }, 400);
}

function returnFromCare() {
  document.getElementById('care-overlay').classList.add('hidden');
  stopSpeech();
  S.mode = 'cooking';
  if (S.isOnline) startAutoCapture();
}

// ─────────────────────────────────────────────────────────────
// HYBRID MODE TOGGLE
// ─────────────────────────────────────────────────────────────
function toggleMode() {
  S.isOnline = !S.isOnline;
  applyModeUI();

  if (S.isOnline) {
    document.getElementById('offline-panel').classList.add('hidden');
    startAutoCapture();
    addCapMsg("Back online! I can see your kitchen again. Let's go! 🎯");
  } else {
    stopAutoCapture();
    showOfflineChecklist();
    addCapMsg("Switched to offline mode. I'll use my built-in safety guides to help you.");
  }
}

function applyModeUI() {
  const online = S.isOnline;
  const toggle = document.getElementById('mode-toggle');
  const thumb  = document.getElementById('mode-thumb');
  const label  = document.getElementById('mode-label');
  const banner = document.getElementById('offline-banner');

  if (online) {
    toggle.classList.replace('bg-gray-600','bg-blue-600');
    thumb.classList.add('translate-x-5'); thumb.classList.remove('translate-x-0');
    label.textContent = 'Online';
    label.className   = 'text-xs font-semibold text-blue-400';
    banner.classList.add('hidden');
  } else {
    toggle.classList.replace('bg-blue-600','bg-gray-600');
    thumb.classList.add('translate-x-0'); thumb.classList.remove('translate-x-5');
    label.textContent = 'Offline';
    label.className   = 'text-xs font-semibold text-amber-400';
    banner.classList.remove('hidden');
  }
}

function showOfflineChecklist() {
  const panel = document.getElementById('offline-panel');
  const list  = document.getElementById('checklist-items');
  panel.classList.remove('hidden');

  list.innerHTML = (CHECKLISTS[S.ageGroup || 'kids']).map(item => `
    <label class="flex items-start gap-2 cursor-pointer group">
      <input type="checkbox" class="mt-0.5 w-3.5 h-3.5 rounded accent-blue-500 flex-shrink-0">
      <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">${item.i} ${esc(item.t)}</span>
    </label>
  `).join('');
}

// ─────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────
function addCapMsg(text) {
  const wrap = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = 'flex items-start gap-3';
  div.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-blue-700 flex-shrink-0 overflow-hidden mt-0.5">
      <img src="cap.png" class="w-full h-full object-cover"
           onerror="this.parentElement.innerHTML='<span class=&quot;text-base&quot;>🤖</span>'">
    </div>
    <div class="max-w-[70%]">
      <p class="text-xs text-gray-600 mb-1">Cap</p>
      <div class="bg-blue-900/50 border border-blue-800/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5
                  text-sm text-blue-50 leading-relaxed">${esc(text)}</div>
    </div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  showBubble(text);
}

function addUserMsg(text) {
  const wrap = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = 'flex items-start gap-3 flex-row-reverse';
  div.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center mt-0.5 text-sm">👤</div>
    <div class="max-w-[70%]">
      <p class="text-xs text-gray-600 mb-1 text-right">You</p>
      <div class="bg-gray-700/60 border border-gray-600/40 rounded-2xl rounded-tr-sm px-3.5 py-2.5
                  text-sm text-gray-100 leading-relaxed">${esc(text)}</div>
    </div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function showBubble(text) {
  const bubble = document.getElementById('speech-bubble');
  const p      = document.getElementById('bubble-text');
  p.textContent = text.length > 110 ? text.slice(0, 107) + '…' : text;
  bubble.classList.remove('hidden');
  // Reset animation
  bubble.classList.remove('bubble-in');
  void bubble.offsetWidth; // reflow
  bubble.classList.add('bubble-in');

  clearTimeout(bubble._t);
  bubble._t = setTimeout(() => bubble.classList.add('hidden'), 9000);
}

function setThinking(on) {
  S.isThinking = on;
  const img    = document.getElementById('cap-img');
  const fb     = document.getElementById('cap-fb');
  const typer  = document.getElementById('typing-ind');
  const dot    = document.getElementById('status-dot');
  const txt    = document.getElementById('status-text');
  const glow   = document.getElementById('cap-glow');

  if (on) {
    img.classList.replace('cap-idle','cap-thinking');
    fb.classList.replace('cap-idle','cap-thinking');
    typer.classList.remove('hidden');
    dot.className = 'w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0';
    txt.textContent = 'Thinking…';
    glow.style.opacity = '1';
  } else {
    img.classList.replace('cap-thinking','cap-idle');
    fb.classList.replace('cap-thinking','cap-idle');
    typer.classList.add('hidden');
    dot.className = 'w-2 h-2 rounded-full bg-green-400 flex-shrink-0';
    txt.textContent = S.stream ? 'Watching kitchen' : 'Ready to help!';
    glow.style.opacity = '0';
  }
}

function setLiveIndicator(on) {
  const el = document.getElementById('live-ind');
  if (on) { el.classList.remove('hidden'); el.classList.add('flex'); }
  else    { el.classList.add('hidden');    el.classList.remove('flex'); }
}

// ─────────────────────────────────────────────────────────────
// SPEECH SYNTHESIS
// ─────────────────────────────────────────────────────────────
function speak(text, priority = false) {
  if (!('speechSynthesis' in window)) return;
  if (priority) window.speechSynthesis.cancel();
  if (!priority && window.speechSynthesis.speaking) return;

  const utt     = new SpeechSynthesisUtterance(text);
  utt.rate      = 0.93;
  utt.pitch     = S.ageGroup === 'kids' ? 1.1 : 1.0;
  utt.volume    = 0.9;

  const voices  = window.speechSynthesis.getVoices();
  const voice   = voices.find(v => /google/i.test(v.name) && v.lang.startsWith('en'))
               || voices.find(v => v.lang.startsWith('en-US'))
               || voices[0];
  if (voice) utt.voice = voice;

  utt.onstart = () => {
    S.isSpeaking = true;
    document.getElementById('cap-img').classList.replace('cap-idle','cap-thinking');
    document.getElementById('status-dot').className  = 'w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0';
    document.getElementById('status-text').textContent = 'Speaking…';
    document.getElementById('cap-glow').style.opacity  = '1';
  };

  utt.onend = utt.onerror = () => {
    S.isSpeaking = false;
    if (!S.isThinking) {
      document.getElementById('cap-img').classList.replace('cap-thinking','cap-idle');
      document.getElementById('status-dot').className   = 'w-2 h-2 rounded-full bg-green-400 flex-shrink-0';
      document.getElementById('status-text').textContent = S.stream ? 'Watching kitchen' : 'Ready to help!';
      document.getElementById('cap-glow').style.opacity  = '0';
    }
  };

  window.speechSynthesis.speak(utt);
}

function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  S.isSpeaking = false;
}

// Voices load asynchronously in some browsers
if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => {};

// ─────────────────────────────────────────────────────────────
// SPEECH RECOGNITION
// ─────────────────────────────────────────────────────────────
function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { document.getElementById('mic-btn').style.display = 'none'; return; }

  S.recognition = new SR();
  S.recognition.continuous    = false;
  S.recognition.interimResults = false;
  S.recognition.lang           = 'en-US';

  S.recognition.onresult = e => {
    document.getElementById('user-input').value = e.results[0][0].transcript;
    micOff();
    sendMessage();
  };
  S.recognition.onerror = () => micOff();
  S.recognition.onend   = () => { if (S.isMicOn) micOff(); };
}

function toggleMic() {
  if (!S.recognition) return;
  S.isMicOn ? micOff() : micOn();
}

function micOn() {
  S.isMicOn = true;
  stopSpeech();
  const btn = document.getElementById('mic-btn');
  btn.classList.add('mic-active');
  btn.title = 'Listening… click to stop';
  document.getElementById('user-input').placeholder = 'Listening…';
  try { S.recognition.start(); } catch(e) { micOff(); }
}

function micOff() {
  S.isMicOn = false;
  const btn = document.getElementById('mic-btn');
  btn.classList.remove('mic-active');
  btn.title = 'Voice input';
  document.getElementById('user-input').placeholder = 'Ask Cap anything about cooking…';
  try { S.recognition.stop(); } catch(e) {}
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function showSettings() {
  document.getElementById('set-age').value = S.ageGroup || 'kids';
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettings() {
  const age = document.getElementById('set-age').value;

  if (age !== S.ageGroup) {
    S.ageGroup = age;
    S.history  = [];   // reset conversation context on age switch
    const badge = document.getElementById('hdr-badge');
    badge.textContent = age === 'kids' ? 'Kids Mode (7–12) 👶' : 'Teen Mode (14+) 🧑‍🍳';
    badge.className   = `text-xs leading-tight ${age === 'kids' ? 'text-blue-400' : 'text-cyan-400'}`;
  }

  closeSettings();
}

// ─────────────────────────────────────────────────────────────
// PiP DRAG (mouse + touch)
// ─────────────────────────────────────────────────────────────
function initPiP() {
  const pip = document.getElementById('pip-window');
  let dragging = false, ox = 0, oy = 0, left = 0, top = 0;

  function startDrag(cx, cy) {
    const r = pip.getBoundingClientRect();
    ox = cx; oy = cy; left = r.left; top = r.top;
    pip.style.right  = 'auto'; pip.style.bottom = 'auto';
    pip.style.left   = left + 'px'; pip.style.top = top + 'px';
    dragging = true;
    pip.classList.add('dragging');
  }

  function moveDrag(cx, cy) {
    if (!dragging) return;
    const nl = Math.max(0, Math.min(window.innerWidth  - 215, left + cx - ox));
    const nt = Math.max(0, Math.min(window.innerHeight - 165, top  + cy - oy));
    pip.style.left = nl + 'px'; pip.style.top = nt + 'px';
  }

  function endDrag() { dragging = false; pip.classList.remove('dragging'); }

  pip.addEventListener('mousedown', e => {
    if (['BUTTON','VIDEO','INPUT'].includes(e.target.tagName)) return;
    startDrag(e.clientX, e.clientY); e.preventDefault();
  });
  document.addEventListener('mousemove',  e => moveDrag(e.clientX, e.clientY));
  document.addEventListener('mouseup',    endDrag);

  pip.addEventListener('touchstart', e => {
    if (e.target.tagName === 'BUTTON') return;
    const t = e.touches[0]; startDrag(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    const t = e.touches[0]; moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', endDrag);
}

// ─────────────────────────────────────────────────────────────
// STAR BACKGROUND GENERATOR
// ─────────────────────────────────────────────────────────────
function spawnStars(containerId, count) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let html = '';
  for (let i = 0; i < count; i++) {
    const x  = (Math.random() * 100).toFixed(2);
    const y  = (Math.random() * 100).toFixed(2);
    const sz = (Math.random() * 1.8 + 0.4).toFixed(2);
    const d  = (Math.random() * 3).toFixed(2);
    const dur= (1.8 + Math.random() * 2).toFixed(2);
    html += `<div style="position:absolute;left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;
      background:#fff;border-radius:50%;opacity:.2;
      animation:starTwinkle ${dur}s ease-in-out ${d}s infinite alternate"></div>`;
  }
  el.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────
function esc(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
