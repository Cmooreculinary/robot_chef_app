import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircleQuestion, RefreshCw, BookOpen, ChevronDown } from "lucide-react";
import { getLessonById, ASK_PROMPTS } from "@/data/lessons";
import { generateCaptainResponse } from "@/services/captainCulinaryCoach";
import { getPlate } from "@/components/teaching-plates";
import { CaptainCard, CaptainCulinary } from "@/components/CaptainCulinary";
import OrnamentDivider from "@/components/OrnamentDivider";

export default function LiveTeachingPlate() {
  const { lessonId } = useParams();
  const nav = useNavigate();
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);
  const [stepIdx, setStepIdx] = useState(-1); // -1 = welcome
  const [askOpen, setAskOpen] = useState(false);
  const [askQuery, setAskQuery] = useState("");
  const [askResponse, setAskResponse] = useState(null);
  const [biblicalShown, setBiblicalShown] = useState(false);

  const isWelcome = stepIdx === -1;
  const totalSteps = lesson?.steps?.length || 0;
  const isLastStep = !!lesson && stepIdx === totalSteps - 1;

  const captainResponse = useMemo(() => {
    if (!lesson) return { kind: "greeting", text: "", followUp: null };
    if (isWelcome) {
      return generateCaptainResponse({
        ageGroup: lesson.ageGroup,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonPath: lesson.path,
        currentTeachingPlate: lesson.plateKey,
        safetyLevel: lesson.safetyLevel,
        allowBiblicalConnection: false,
      });
    }
    return generateCaptainResponse({
      ageGroup: lesson.ageGroup,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonPath: lesson.path,
      currentTeachingPlate: lesson.plateKey,
      lessonStep: lesson.steps[stepIdx].id,
      safetyLevel: lesson.safetyLevel,
      allowBiblicalConnection: false,
    });
  }, [stepIdx, isWelcome, lesson]);

  if (!lesson) {
    return (
      <div className="cck-page" data-testid="lesson-not-found">
        <p>Lesson not found.</p>
        <button onClick={() => nav("/lessons")} className="cck-btn-ghost mt-4">
          Back to Library
        </button>
      </div>
    );
  }

  const Plate = getPlate(lesson.plateKey);

  const moveOn = () => {
    setBiblicalShown(false);
    setAskResponse(null);
    if (isWelcome) {
      setStepIdx(0);
    } else if (isLastStep) {
      nav(`/quiz/${lesson.id}`);
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  const explainAgain = () => {
    setAskResponse({
      kind: "explain",
      text: captainResponse.text,
      followUp: captainResponse.followUp,
    });
  };

  const handleAsk = (q) => {
    const r = generateCaptainResponse({
      ageGroup: lesson.ageGroup,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonPath: lesson.path,
      currentTeachingPlate: lesson.plateKey,
      lessonStep: isWelcome ? null : lesson.steps[stepIdx].id,
      safetyLevel: lesson.safetyLevel,
      allowBiblicalConnection: true,
      userQuestion: q,
    });
    setAskResponse(r);
    setAskQuery("");
    setAskOpen(false);
  };

  const showBiblical = () => {
    setBiblicalShown(true);
    setAskResponse({
      kind: "biblical",
      text: lesson.biblical,
      followUp: "Would you like to move on, or do you have any questions?",
    });
  };

  return (
    <div className="cck-page" data-testid="live-teaching-plate-page">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => nav("/lessons")}
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--cck-navy-soft)" }}
          data-testid="lesson-back-btn"
        >
          <ArrowLeft size={18} /> Library
        </button>
        <div className="flex items-center gap-1.5" data-testid="lesson-step-dots">
          <Dot active={isWelcome} />
          {lesson.steps.map((s, i) => (
            <Dot key={s.id} active={i === stepIdx} done={i < stepIdx} />
          ))}
        </div>
      </div>

      {/* lesson header */}
      <div className="mt-3">
        <div className="cck-eyebrow">{lesson.path}</div>
        <h1
          className="cck-h1 mt-1"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
          data-testid="lesson-title"
        >
          {lesson.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="cck-tag cck-tag-gold">{lesson.time}</span>
          <span className="cck-tag cck-tag-teal">{lesson.safetyLevel}</span>
          <span className="cck-tag cck-tag-navy">{lesson.difficulty}</span>
        </div>
      </div>

      {/* the plate — dominates the screen */}
      <div className="mt-5 cck-anim-fade-up" data-testid="teaching-plate-container">
        <Plate />
      </div>

      {/* current step header */}
      {!isWelcome && (
        <OrnamentDivider>
          Step {stepIdx + 1} of {totalSteps} · {lesson.steps[stepIdx].title}
        </OrnamentDivider>
      )}
      {isWelcome && <OrnamentDivider>Welcome</OrnamentDivider>}

      {/* captain narration */}
      <CaptainCard
        title="Captain Culinary"
        body={askResponse ? askResponse.text : captainResponse.text}
        footer={
          <div
            className="text-sm italic"
            style={{ fontFamily: "var(--font-body)", color: "var(--cck-teal-deep)" }}
            data-testid="captain-followup"
          >
            {askResponse?.followUp || captainResponse.followUp}
          </div>
        }
      />

      {/* actions */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={moveOn}
          className="cck-btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base"
          data-testid="lesson-move-on-btn"
        >
          {isLastStep ? "Take the Quiz" : isWelcome ? "Begin" : "Move On"}
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => setAskOpen((v) => !v)}
          className="cck-btn-coral inline-flex items-center justify-center gap-2 text-sm sm:text-base"
          data-testid="lesson-ask-question-btn"
        >
          <MessageCircleQuestion size={16} />
          Ask
        </button>
        <button
          onClick={explainAgain}
          className="cck-btn-ghost inline-flex items-center justify-center gap-2 text-sm"
          data-testid="lesson-explain-again-btn"
        >
          <RefreshCw size={16} />
          Explain Again
        </button>
        <button
          onClick={showBiblical}
          className="cck-btn-gold inline-flex items-center justify-center gap-2 text-sm"
          data-testid="lesson-biblical-btn"
          disabled={biblicalShown}
        >
          <BookOpen size={16} />
          Life Connection
        </button>
      </div>

      {/* ask captain quick prompts */}
      {askOpen && (
        <div className="mt-5 cck-card p-5 cck-anim-fade-up" data-testid="ask-captain-panel">
          <div className="flex items-center gap-3">
            <CaptainCulinary size="sm" />
            <div>
              <div className="cck-eyebrow">Ask Captain</div>
              <div className="text-sm mt-1" style={{ color: "var(--cck-navy-soft)" }}>
                Choose a question or type your own.
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ASK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleAsk(p)}
                className="cck-btn-ghost text-xs sm:text-sm"
                data-testid={`ask-prompt-${p.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && askQuery.trim()) handleAsk(askQuery.trim());
              }}
              placeholder="Type your question..."
              className="cck-input flex-1"
              data-testid="ask-captain-input"
            />
            <button
              onClick={() => askQuery.trim() && handleAsk(askQuery.trim())}
              className="cck-btn-primary text-sm"
              data-testid="ask-captain-submit"
            >
              Ask
            </button>
          </div>
          <button
            onClick={() => setAskOpen(false)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--cck-navy-soft)" }}
            data-testid="ask-captain-close"
          >
            <ChevronDown size={14} /> Close
          </button>
        </div>
      )}

      {/* lesson summary block */}
      <div className="mt-6 cck-card p-5 text-sm" data-testid="lesson-meta">
        <div className="cck-eyebrow">Lesson Notes</div>
        <p className="mt-2" style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-body)" }}>
          {lesson.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="cck-tag cck-tag-blue">Family Challenge</span>
          <span className="text-sm" style={{ color: "var(--cck-navy)" }}>
            {lesson.familyChallenge}
          </span>
        </div>
      </div>
    </div>
  );
}

function Dot({ active, done }) {
  let bg = "var(--cck-paper-line-soft)";
  if (done) bg = "var(--cck-teal)";
  if (active) bg = "var(--cck-coral)";
  return (
    <div
      className="w-2 h-2 rounded-full transition-colors duration-300"
      style={{ background: bg }}
    />
  );
}
