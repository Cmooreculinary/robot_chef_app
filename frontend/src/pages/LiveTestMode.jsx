import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Square,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Volume2,
  VolumeX,
  Eraser,
  AlertTriangle,
  Lock,
  Keyboard,
  Send,
} from "lucide-react";
import {
  classifyUtterance,
  ROUTE_META,
  ALL_ROUTES,
} from "@/services/cckGuardrails";

// ============================================================
// Adult-only Live Mode — Technical Proof of Concept
// ============================================================
// This page:
// - Requests camera + microphone permissions
// - Uses Web Speech API for live transcript (browser-local)
// - Classifies each utterance against CCK guardrail routes
// - Displays the route envelope (route, risk, adult required, safety stop)
// - Shows Captain's scripted response (+ optional TTS playback)
// - NEVER records or persists video or audio (no MediaRecorder anywhere)
// ============================================================

export default function LiveTestMode() {
  const nav = useNavigate();
  const [stage, setStage] = useState("gate"); // gate | idle | running | stopped
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [permError, setPermError] = useState(null);

  const [transcriptFinal, setTranscriptFinal] = useState("");
  const [transcriptInterim, setTranscriptInterim] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [typedInput, setTypedInput] = useState("");

  const [current, setCurrent] = useState(null); // last classification envelope
  const [history, setHistory] = useState([]); // rolling window, in-memory only

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastSpokenRouteRef = useRef(null);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      hardStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hardStop() {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch {}
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    } catch {}
    recognitionRef.current = null;
    try {
      window.speechSynthesis?.cancel();
    } catch {}
  }

  // ---- Start / End ----
  async function startTest() {
    setPermError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // never play mic back
        await videoRef.current.play().catch(() => {});
      }
      setCamOn(stream.getVideoTracks().length > 0);
      setMicOn(stream.getAudioTracks().length > 0);

      startRecognition();
      setStage("running");
    } catch (e) {
      setPermError(
        e?.message ||
          "Camera or microphone permission was denied. This test cannot continue without both."
      );
      hardStop();
      setCamOn(false);
      setMicOn(false);
    }
  }

  function endTest() {
    hardStop();
    setCamOn(false);
    setMicOn(false);
    setTranscriptInterim("");
    setStage("stopped");
  }

  function clearTranscript() {
    setTranscriptFinal("");
    setTranscriptInterim("");
    setCurrent(null);
    setHistory([]);
    lastSpokenRouteRef.current = null;
  }

  // ---- Speech recognition (live transcript) ----
  function startRecognition() {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setPermError(
        "This browser does not expose the Web Speech API (SpeechRecognition). Use Chrome or Edge on desktop, or test via the manual typed input."
      );
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      let interim = "";
      let finalPiece = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalPiece += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscriptInterim(interim);
      if (finalPiece) {
        setTranscriptFinal((t) => (t + " " + finalPiece).trim());
        processUtterance(finalPiece.trim());
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setPermError("Microphone permission denied. Test cannot continue.");
        endTest();
      }
    };

    rec.onend = () => {
      // auto-restart while test is running (Chrome stops after silence)
      if (streamRef.current) {
        try {
          rec.start();
        } catch {}
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch {
      // Some browsers throw if start() is called twice — ignore
    }
  }

  // ---- Classification handler ----
  function processUtterance(text) {
    if (!text) return;
    const env = classifyUtterance(text);
    setCurrent(env);
    setHistory((h) => [env, ...h].slice(0, 10));

    if (ttsEnabled && env.response && env.route !== lastSpokenRouteRef.current) {
      lastSpokenRouteRef.current = env.route;
      try {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(env.response);
        u.rate = 1;
        u.pitch = 1;
        window.speechSynthesis?.speak(u);
      } catch {}
    }
  }

  function submitTyped() {
    if (!typedInput.trim()) return;
    setTranscriptFinal((t) => (t + " " + typedInput.trim()).trim());
    processUtterance(typedInput.trim());
    setTypedInput("");
  }

  function replayCurrentAudio() {
    if (!current?.response) return;
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(current.response);
      window.speechSynthesis?.speak(u);
    } catch {}
  }

  // ==========================================================
  // Render
  // ==========================================================

  if (stage === "gate") {
    return <AdultGate onAccept={() => setStage("idle")} onBack={() => nav(-1)} />;
  }

  const banner = current?.safetyStop
    ? {
        text: "SAFETY STOP TRIGGERED · GET AN ADULT · CALL EMERGENCY SERVICES IF NEEDED",
        bg: "#B00020",
        color: "#FFF7EA",
      }
    : null;

  return (
    <div className="cck-page max-w-[1120px] mx-auto" data-testid="live-test-page">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--cck-navy-soft)" }}
          data-testid="live-test-back-btn"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-2">
          <StatusDot on={camOn} label="CAM" testId="live-cam-status" />
          <StatusDot on={micOn} label="MIC" testId="live-mic-status" />
          <StatusDot
            on={stage === "running"}
            label="LIVE"
            testId="live-running-status"
          />
        </div>
      </div>

      {/* Header card */}
      <div
        className="mt-4 rounded-2xl p-5 sm:p-6 border"
        style={{
          background: "rgba(16,42,67,0.04)",
          borderColor: "var(--cck-paper-line)",
        }}
        data-testid="live-test-header"
      >
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(242,106,91,0.10)", border: "1px solid var(--cck-coral-deep)" }}
          >
            <Radio size={22} color="var(--cck-coral-deep)" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="cck-eyebrow" style={{ color: "var(--cck-coral-deep)" }}>
              Live Mode · Adult-Only Technical POC
            </div>
            <h1
              className="mt-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                lineHeight: 1.1,
                color: "var(--cck-navy)",
                fontWeight: 700,
              }}
              data-testid="live-test-title"
            >
              Can Cap hear, see, classify, and respond within CCK guardrails?
            </h1>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
            >
              This is a deterministic routing test. No AI model, no network calls.
              Video and audio are live-only — nothing is recorded, saved, or
              transmitted. End Test releases all tracks immediately.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <InfoChip icon={VideoOff} label="No video saved" />
              <InfoChip icon={MicOff} label="No audio saved" />
              <InfoChip icon={Lock} label="Adult-only" />
              <InfoChip icon={ShieldCheck} label="CCK guardrails active" />
            </div>
          </div>
        </div>
      </div>

      {/* Safety Stop banner */}
      {banner && (
        <div
          className="mt-4 rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{ background: banner.bg, color: banner.color }}
          data-testid="safety-stop-banner"
          role="alert"
        >
          <AlertTriangle size={22} />
          <div
            className="font-bold tracking-wide text-sm"
            style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.04em" }}
          >
            {banner.text}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Video + permissions */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              borderColor: "var(--cck-paper-line)",
              background: "#0a1522",
              aspectRatio: "4 / 3",
            }}
            data-testid="live-video-wrap"
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
              data-testid="live-video"
            />
          </div>

          <div className="cck-card p-4 text-sm" data-testid="live-permissions">
            <div className="cck-eyebrow">Permissions</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <PermRow icon={Video} label="Camera" on={camOn} />
              <PermRow icon={Mic} label="Microphone" on={micOn} />
            </div>
            {permError && (
              <div
                className="mt-3 text-xs p-2 rounded-lg"
                style={{
                  background: "rgba(176,0,32,0.08)",
                  color: "#8a0018",
                  border: "1px solid rgba(176,0,32,0.2)",
                }}
                data-testid="live-perm-error"
              >
                {permError}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="cck-card p-4">
            <div className="cck-eyebrow">Controls</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {stage !== "running" ? (
                <button
                  onClick={startTest}
                  className="cck-btn-primary inline-flex items-center justify-center gap-2 col-span-2"
                  data-testid="live-start-btn"
                >
                  <Play size={16} /> Start Live Test
                </button>
              ) : (
                <button
                  onClick={endTest}
                  className="cck-btn-coral inline-flex items-center justify-center gap-2 col-span-2"
                  data-testid="live-end-btn"
                >
                  <Square size={16} /> End Test
                </button>
              )}
              <button
                onClick={() => setTtsEnabled((v) => !v)}
                className="cck-btn-ghost inline-flex items-center justify-center gap-2 text-sm"
                data-testid="live-tts-toggle"
              >
                {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                Audio {ttsEnabled ? "On" : "Off"}
              </button>
              <button
                onClick={clearTranscript}
                className="cck-btn-ghost inline-flex items-center justify-center gap-2 text-sm"
                data-testid="live-clear-btn"
              >
                <Eraser size={16} /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Transcript + classification */}
        <div className="lg:col-span-3 space-y-4">
          {/* Classification envelope */}
          <div className="cck-card p-5" data-testid="live-classification">
            <div className="cck-eyebrow">Classification Envelope</div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RouteChip current={current?.route} />
              <RiskChip risk={current?.risk} />
              <AdultChip value={current?.adultRequired} />
              <SafetyStopChip on={!!current?.safetyStop} />
            </div>
            {current?.routing && (
              <div
                className="mt-3 text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(242,184,75,0.14)",
                  border: "1px solid rgba(242,184,75,0.35)",
                  color: "var(--cck-gold-deep)",
                  fontFamily: "var(--font-ui)",
                }}
                data-testid="live-routing-note"
              >
                ROUTING · {current.routing}
              </div>
            )}
            {current?.matchedKeywords?.length > 0 && (
              <div className="mt-3" data-testid="live-matched-keywords">
                <div className="cck-eyebrow" style={{ fontSize: "0.62rem" }}>
                  Matched Keywords
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {current.matchedKeywords.map((k, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--cck-cream-deep)",
                        border: "1px solid var(--cck-paper-line)",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color: "var(--cck-navy)",
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Captain response */}
          <div
            className="cck-captain-card rounded-2xl p-5"
            data-testid="live-captain-response"
          >
            <div className="cck-eyebrow">Cap Response</div>
            <p
              className="mt-2 text-[15px] leading-relaxed min-h-[3.5rem]"
              style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}
              data-testid="live-response-text"
            >
              {current?.response || "Awaiting utterance…"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={replayCurrentAudio}
                disabled={!current?.response}
                className="cck-btn-ghost inline-flex items-center gap-2 text-xs"
                style={{ opacity: current?.response ? 1 : 0.5 }}
                data-testid="live-replay-audio-btn"
              >
                <Volume2 size={14} /> Play Audio
              </button>
            </div>
          </div>

          {/* Live transcript */}
          <div className="cck-card p-5" data-testid="live-transcript">
            <div className="flex items-center justify-between">
              <div className="cck-eyebrow">Live Transcript</div>
              <div className="text-[10px]" style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-ui)" }}>
                Never saved · In-memory only
              </div>
            </div>
            <div
              className="mt-3 rounded-lg px-3 py-3 text-sm min-h-[6rem] max-h-48 overflow-auto"
              style={{
                background: "var(--cck-cream-deep)",
                border: "1px solid var(--cck-paper-line-soft)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: "var(--cck-navy)",
              }}
            >
              <span data-testid="live-transcript-final">{transcriptFinal || ""}</span>
              {transcriptInterim && (
                <span
                  data-testid="live-transcript-interim"
                  style={{ opacity: 0.55, fontStyle: "italic" }}
                >
                  {" "}
                  {transcriptInterim}
                </span>
              )}
              {!transcriptFinal && !transcriptInterim && (
                <span style={{ color: "var(--cck-navy-soft)", fontStyle: "italic" }}>
                  No speech yet…
                </span>
              )}
            </div>

            {/* Manual test input (for operators without mic or to test specific phrases) */}
            <div className="mt-3">
              <label
                className="cck-eyebrow inline-flex items-center gap-1.5"
                style={{ fontSize: "0.62rem" }}
              >
                <Keyboard size={12} /> Operator test input
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  className="cck-input flex-1 text-sm"
                  placeholder='Type a phrase like "I cut my finger" or "how do I wash carrots"'
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitTyped()}
                  data-testid="live-typed-input"
                />
                <button
                  onClick={submitTyped}
                  className="cck-btn-primary inline-flex items-center gap-1.5 text-sm"
                  data-testid="live-typed-submit"
                >
                  <Send size={14} /> Classify
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="cck-card p-5" data-testid="live-history">
              <div className="cck-eyebrow">Recent Classifications · In-memory only</div>
              <div className="mt-3 space-y-2 max-h-64 overflow-auto">
                {history.map((h, i) => (
                  <HistoryRow key={i} env={h} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Known-routes legend */}
      <div className="mt-6 cck-card p-5" data-testid="live-routes-legend">
        <div className="cck-eyebrow">CCK Guardrail Routes</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {ALL_ROUTES.map((r) => {
            const m = ROUTE_META[r];
            return (
              <div
                key={r}
                className="rounded-xl p-3 border"
                style={{
                  borderColor: "var(--cck-paper-line-soft)",
                  background: "rgba(255,255,255,0.55)",
                }}
                data-testid={`route-legend-${r}`}
              >
                <div
                  className="font-bold"
                  style={{
                    color: m.color,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.label}
                </div>
                <div className="mt-1" style={{ color: "var(--cck-navy-soft)" }}>
                  {m.description}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]" style={{ fontFamily: "var(--font-ui)" }}>
                  <span className="cck-tag cck-tag-navy">Risk · {m.defaultRisk}</span>
                  <span className="cck-tag cck-tag-coral">Adult · {m.defaultAdult}</span>
                  {m.safetyStop && <span className="cck-tag cck-tag-coral">Safety Stop</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-8 text-center text-[10px]"
        style={{
          fontFamily: "var(--font-plate)",
          letterSpacing: "0.3em",
          color: "var(--cck-navy-soft)",
        }}
      >
        CAPTAIN · CULINARY · KIDS — LIVE MODE · ADULT · POC
      </div>
    </div>
  );
}

// ============================================================
// Adult gate
// ============================================================
function AdultGate({ onAccept, onBack }) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      className="cck-page flex flex-col items-center justify-center min-h-[80vh]"
      data-testid="adult-gate"
    >
      <div className="max-w-md w-full cck-card p-6 sm:p-8">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(242,106,91,0.12)", border: "1px solid var(--cck-coral-deep)" }}
        >
          <ShieldAlert size={26} color="var(--cck-coral-deep)" />
        </div>
        <div className="cck-eyebrow mt-4 text-center" style={{ color: "var(--cck-coral-deep)" }}>
          Adult-Only · Technical Preview
        </div>
        <h2
          className="mt-3 text-center"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--cck-navy)",
            lineHeight: 1.15,
          }}
        >
          Live Mode is an adult-only guardrail test.
        </h2>
        <ul
          className="mt-5 space-y-2 text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
        >
          <li>· Not for use with children.</li>
          <li>· No open-ended child mode.</li>
          <li>· Video and audio are live-only — nothing is recorded or saved.</li>
          <li>· Classification is deterministic; no AI model is called.</li>
          <li>· Camera + microphone permission will be requested.</li>
        </ul>
        <label className="mt-6 flex items-start gap-3 text-sm cursor-pointer" data-testid="adult-gate-check-label">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5"
            data-testid="adult-gate-checkbox"
          />
          <span style={{ color: "var(--cck-navy)", fontFamily: "var(--font-body)" }}>
            I am an adult (18+). I understand this is a technical proof of concept
            and will not use it with children.
          </span>
        </label>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onAccept}
            disabled={!checked}
            className="cck-btn-primary flex-1"
            style={{ opacity: checked ? 1 : 0.5 }}
            data-testid="adult-gate-continue"
          >
            Continue to Live Test
          </button>
          <button
            onClick={onBack}
            className="cck-btn-ghost flex-1"
            data-testid="adult-gate-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Small display helpers
// ============================================================
function StatusDot({ on, label, testId }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 text-[11px] font-bold"
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: on ? "var(--cck-teal-deep)" : "var(--cck-navy-soft)",
        letterSpacing: "0.04em",
      }}
      data-testid={testId}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: on ? "#12a27b" : "rgba(16,42,67,0.25)",
          boxShadow: on ? "0 0 8px rgba(18,162,123,0.7)" : "none",
        }}
      />
      {label}
    </div>
  );
}

function InfoChip({ icon: Icon, label }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: "var(--cck-cream-deep)",
        border: "1px solid var(--cck-paper-line)",
        fontFamily: "var(--font-ui)",
        color: "var(--cck-navy)",
        fontWeight: 600,
      }}
    >
      <Icon size={12} /> {label}
    </span>
  );
}

function PermRow({ icon: Icon, label, on }) {
  return (
    <div
      className="rounded-lg px-3 py-2 flex items-center gap-2"
      style={{
        background: on ? "rgba(28,124,125,0.08)" : "rgba(16,42,67,0.04)",
        border: `1px solid ${on ? "var(--cck-teal)" : "var(--cck-paper-line-soft)"}`,
      }}
    >
      <Icon size={16} color={on ? "var(--cck-teal-deep)" : "var(--cck-navy-soft)"} />
      <span
        className="text-xs font-semibold"
        style={{ fontFamily: "var(--font-ui)", color: "var(--cck-navy)" }}
      >
        {label}
      </span>
      <span
        className="ml-auto text-[10px] font-bold"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: on ? "var(--cck-teal-deep)" : "var(--cck-navy-soft)",
        }}
      >
        {on ? "GRANTED" : "PENDING"}
      </span>
    </div>
  );
}

function RouteChip({ current }) {
  const meta = current ? ROUTE_META[current] : null;
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: meta ? "rgba(255,255,255,0.7)" : "var(--cck-cream-deep)",
        border: `1.5px solid ${meta ? meta.color : "var(--cck-paper-line-soft)"}`,
      }}
      data-testid="chip-route"
    >
      <div className="cck-eyebrow" style={{ fontSize: "0.62rem" }}>
        Route
      </div>
      <div
        className="mt-1 font-bold text-sm"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: meta ? meta.color : "var(--cck-navy-soft)",
          letterSpacing: "0.02em",
        }}
        data-testid="chip-route-value"
      >
        {meta ? meta.label : "—"}
      </div>
    </div>
  );
}

const RISK_COLORS = {
  LOW: "#12a27b",
  MEDIUM: "var(--cck-gold-deep)",
  HIGH: "var(--cck-coral-deep)",
  CRITICAL: "#B00020",
};

function RiskChip({ risk }) {
  const color = risk ? RISK_COLORS[risk] : "var(--cck-navy-soft)";
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: risk ? "rgba(255,255,255,0.7)" : "var(--cck-cream-deep)",
        border: `1.5px solid ${risk ? color : "var(--cck-paper-line-soft)"}`,
      }}
      data-testid="chip-risk"
    >
      <div className="cck-eyebrow" style={{ fontSize: "0.62rem" }}>
        Risk Level
      </div>
      <div
        className="mt-1 font-bold text-sm"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color,
          letterSpacing: "0.02em",
        }}
        data-testid="chip-risk-value"
      >
        {risk || "—"}
      </div>
    </div>
  );
}

function AdultChip({ value }) {
  const color =
    value === "YES"
      ? "var(--cck-coral-deep)"
      : value === "MAYBE"
      ? "var(--cck-gold-deep)"
      : value === "NO"
      ? "#12a27b"
      : "var(--cck-navy-soft)";
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: value ? "rgba(255,255,255,0.7)" : "var(--cck-cream-deep)",
        border: `1.5px solid ${value ? color : "var(--cck-paper-line-soft)"}`,
      }}
      data-testid="chip-adult"
    >
      <div className="cck-eyebrow" style={{ fontSize: "0.62rem" }}>
        Adult Required
      </div>
      <div
        className="mt-1 font-bold text-sm"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color,
          letterSpacing: "0.02em",
        }}
        data-testid="chip-adult-value"
      >
        {value || "—"}
      </div>
    </div>
  );
}

function SafetyStopChip({ on }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: on ? "rgba(176,0,32,0.10)" : "var(--cck-cream-deep)",
        border: `1.5px solid ${on ? "#B00020" : "var(--cck-paper-line-soft)"}`,
      }}
      data-testid="chip-safety-stop"
    >
      <div className="cck-eyebrow" style={{ fontSize: "0.62rem" }}>
        Safety Stop
      </div>
      <div
        className="mt-1 font-bold text-sm"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: on ? "#B00020" : "var(--cck-navy-soft)",
          letterSpacing: "0.02em",
        }}
        data-testid="chip-safety-stop-value"
      >
        {on ? "TRIGGERED" : "INACTIVE"}
      </div>
    </div>
  );
}

function HistoryRow({ env }) {
  const meta = ROUTE_META[env.route];
  const color = meta?.color || "var(--cck-navy-soft)";
  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] gap-3 items-center text-xs py-1.5 border-b"
      style={{ borderColor: "var(--cck-paper-line-soft)" }}
    >
      <span
        className="font-bold"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color,
        }}
      >
        {meta?.label || "—"}
      </span>
      <span
        className="truncate"
        style={{ color: "var(--cck-navy)", fontFamily: "var(--font-body)" }}
        title={env.utterance}
      >
        "{env.utterance}"
      </span>
      <span
        style={{
          color: "var(--cck-navy-soft)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "10px",
        }}
      >
        {new Date(env.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}
