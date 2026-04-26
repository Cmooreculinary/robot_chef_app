import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LESSONS, AGE_PATHS } from "@/data/lessons";
import { Clock, ShieldCheck, Award, ArrowRight } from "lucide-react";
import { Storage } from "@/services/storage";
import OrnamentDivider from "@/components/OrnamentDivider";

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

export default function LessonLibrary() {
  const nav = useNavigate();
  const state = Storage.getState();
  const [age, setAge] = useState(state.ageGroup === "parent" ? "all" : state.ageGroup || "all");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = useMemo(() => {
    return LESSONS.filter((l) => {
      if (age !== "all" && l.ageGroup !== age) return false;
      if (difficulty !== "All" && l.difficulty !== difficulty) return false;
      return true;
    });
  }, [age, difficulty]);

  return (
    <div className="cck-page" data-testid="lesson-library-page">
      <div className="cck-eyebrow">Curriculum</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)" }}
        data-testid="library-title"
      >
        Lesson Library
      </h1>
      <p
        className="mt-2 max-w-xl"
        style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
      >
        Every plate begins as a lesson. Choose by age, path, or difficulty.
      </p>

      {/* filters */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap gap-2" data-testid="library-age-filter">
          <FilterPill label="All Ages" active={age === "all"} onClick={() => setAge("all")} testId="library-age-all" />
          {AGE_PATHS.filter((p) => p.id !== "parent").map((p) => (
            <FilterPill
              key={p.id}
              label={p.ageLabel}
              active={age === p.id}
              onClick={() => setAge(p.id)}
              testId={`library-age-${p.id}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2" data-testid="library-difficulty-filter">
          {DIFFICULTIES.map((d) => (
            <FilterPill
              key={d}
              label={d}
              active={difficulty === d}
              onClick={() => setDifficulty(d)}
              testId={`library-difficulty-${d.toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <OrnamentDivider>{filtered.length} plates</OrnamentDivider>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cck-stagger" data-testid="library-grid">
        {filtered.map((l) => {
          const done = state.completedLessons.includes(l.id);
          return (
            <div
              key={l.id}
              className="cck-card p-5 cck-anim-fade-up flex flex-col"
              data-testid={`library-card-${l.id}`}
            >
              <div className="flex flex-wrap gap-1.5">
                <span className="cck-tag cck-tag-teal">{l.path}</span>
                <span className="cck-tag cck-tag-gold">{l.ageGroup}</span>
                {done && <span className="cck-tag cck-tag-coral">Completed</span>}
              </div>
              <h3
                className="mt-3"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 600 }}
              >
                {l.title}
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
                {l.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs" style={{ color: "var(--cck-navy-soft)" }}>
                <span className="inline-flex items-center gap-1"><Clock size={14} /> {l.time}</span>
                <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> {l.safetyLevel}</span>
                <span className="inline-flex items-center gap-1"><Award size={14} /> {l.difficulty}</span>
              </div>
              <div className="mt-auto pt-5">
                <button
                  onClick={() => nav(`/lesson/${l.id}`)}
                  className="cck-btn-primary w-full inline-flex items-center justify-center gap-2"
                  data-testid={`library-start-${l.id}`}
                >
                  Start Lesson <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
      style={{
        fontFamily: "var(--font-ui)",
        background: active ? "var(--cck-navy)" : "var(--cck-cream-deep)",
        color: active ? "var(--cck-cream)" : "var(--cck-navy)",
        border: `1px solid ${active ? "var(--cck-navy)" : "var(--cck-paper-line)"}`,
      }}
    >
      {label}
    </button>
  );
}
