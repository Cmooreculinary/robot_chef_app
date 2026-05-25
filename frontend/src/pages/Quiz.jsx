import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from "lucide-react";
import { getLessonById, BADGES } from "@/data/lessons";
import { Storage } from "@/services/storage";
import { Api } from "@/services/api";
import { CaptainCard } from "@/components/CaptainCulinary";
import OrnamentDivider from "@/components/OrnamentDivider";
import { toast } from "sonner";

export default function Quiz() {
  const { lessonId } = useParams();
  const nav = useNavigate();
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!lesson) {
    return (
      <div className="cck-page" data-testid="quiz-not-found">
        Lesson not found.
      </div>
    );
  }

  const correctCount = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const allCorrect = correctCount === lesson.quiz.length;
  const badge = BADGES.find((b) => b.id === lesson.badge);

  const submit = () => {
    setSubmitted(true);
    if (correctCount === lesson.quiz.length && !completed) {
      Storage.completeLesson(lesson.id, lesson.badge);
      Api.syncProgress();
      setCompleted(true);
      toast.success(`Badge earned: ${badge?.name || "Lesson Complete"}`);
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="cck-page" data-testid="quiz-page">
      <div className="cck-eyebrow">Lesson Quiz</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
        data-testid="quiz-title"
      >
        {lesson.title}
      </h1>

      <OrnamentDivider>Three Questions</OrnamentDivider>

      <div className="space-y-5">
        {lesson.quiz.map((q, i) => (
          <div
            key={i}
            className="cck-card p-5"
            data-testid={`quiz-question-${i}`}
          >
            <div className="cck-eyebrow">Question {i + 1}</div>
            <div
              className="mt-2 text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
            >
              {q.q}
            </div>
            <div className="mt-3 grid gap-2">
              {q.choices.map((c, ci) => {
                const picked = answers[i] === ci;
                const isCorrect = q.answer === ci;
                let border = "var(--cck-paper-line)";
                let bg = picked ? "var(--cck-soft-blue)" : "rgba(255,255,255,0.6)";
                if (submitted && picked && isCorrect) {
                  border = "var(--cck-teal)";
                  bg = "rgba(28,124,125,0.12)";
                } else if (submitted && picked && !isCorrect) {
                  border = "var(--cck-coral-deep)";
                  bg = "rgba(242,106,91,0.10)";
                } else if (submitted && isCorrect) {
                  border = "var(--cck-teal)";
                }
                return (
                  <button
                    key={ci}
                    disabled={submitted}
                    onClick={() => setAnswers({ ...answers, [i]: ci })}
                    className="text-left rounded-xl px-4 py-3 transition-all duration-200"
                    style={{
                      border: `1.5px solid ${border}`,
                      background: bg,
                      fontFamily: "var(--font-ui)",
                      color: "var(--cck-navy)",
                    }}
                    data-testid={`quiz-q${i}-choice-${ci}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{c}</span>
                      {submitted && picked && isCorrect && <CheckCircle2 size={18} color="var(--cck-teal)" />}
                      {submitted && picked && !isCorrect && <XCircle size={18} color="var(--cck-coral-deep)" />}
                      {submitted && !picked && isCorrect && <CheckCircle2 size={16} color="var(--cck-teal)" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="mt-6 flex justify-end">
          <button
            disabled={Object.keys(answers).length < lesson.quiz.length}
            onClick={submit}
            className="cck-btn-primary inline-flex items-center gap-2"
            style={{ opacity: Object.keys(answers).length < lesson.quiz.length ? 0.5 : 1 }}
            data-testid="quiz-submit-btn"
          >
            Submit <ArrowRight size={16} />
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-8 cck-anim-fade-up" data-testid="quiz-result">
          <CaptainCard
            title="Captain Culinary"
            body={
              allCorrect
                ? `Great work, chef. ${correctCount} of ${lesson.quiz.length} correct. Your safe choices keep the kitchen calm.`
                : `Good try. You got ${correctCount} of ${lesson.quiz.length} correct. Let's slow down and think like a safe chef. Try again — you'll get it.`
            }
            footer={
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={reset} className="cck-btn-ghost inline-flex items-center gap-2" data-testid="quiz-try-again-btn">
                  <RotateCcw size={16} /> Try Again
                </button>
                {allCorrect && (
                  <>
                    <button
                      onClick={() => nav("/progress")}
                      className="cck-btn-primary inline-flex items-center gap-2"
                      data-testid="quiz-see-badges-btn"
                    >
                      <Award size={16} /> See My Badges
                    </button>
                    <button
                      onClick={() => nav("/lessons")}
                      className="cck-btn-coral inline-flex items-center gap-2"
                      data-testid="quiz-next-lesson-btn"
                    >
                      Next Lesson <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>
            }
          >
            {allCorrect && badge && (
              <div className="mt-3 cck-tag cck-tag-gold">
                <Award size={14} /> Badge Earned: {badge.name}
              </div>
            )}
          </CaptainCard>
        </div>
      )}
    </div>
  );
}
