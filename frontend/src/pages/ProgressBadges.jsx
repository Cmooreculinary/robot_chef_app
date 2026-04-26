import React, { useState } from "react";
import { Storage } from "@/services/storage";
import { BADGES, LESSONS, AGE_PATHS } from "@/data/lessons";
import * as Lucide from "lucide-react";
import OrnamentDivider from "@/components/OrnamentDivider";
import { CaptainCulinary } from "@/components/CaptainCulinary";

export default function ProgressBadges() {
  const [state, setState] = useState(Storage.getState());

  const path = AGE_PATHS.find((p) => p.id === state.ageGroup);
  const totalLessons = LESSONS.length;
  const completed = state.completedLessons.length;
  const progressPct = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

  const nextLesson = LESSONS.find((l) => !state.completedLessons.includes(l.id));

  return (
    <div className="cck-page" data-testid="progress-page">
      <div className="cck-eyebrow">Your Mission Progress</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
        data-testid="progress-title"
      >
        Badges & Progress
      </h1>

      {/* progress hero */}
      <div className="mt-5 cck-card p-5 sm:p-6 flex items-center gap-5">
        <CaptainCulinary size="md" />
        <div className="flex-1 min-w-0">
          <div className="cck-eyebrow">{path?.title || "Your Path"}</div>
          <div
            className="mt-1 text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
            data-testid="progress-percentage"
          >
            {progressPct}%
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--cck-cream-deep)" }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--cck-teal), var(--cck-gold))",
              }}
            />
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--cck-navy-soft)" }}>
            {completed} of {totalLessons} lessons complete · {state.earnedBadges.length} badges earned
          </div>
        </div>
      </div>

      <OrnamentDivider>Badges</OrnamentDivider>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 cck-stagger" data-testid="badges-grid">
        {BADGES.map((b) => {
          const earned = state.earnedBadges.includes(b.id);
          const Icon = Lucide[b.icon] || Lucide.Award;
          return (
            <div
              key={b.id}
              className="cck-card p-4 text-center cck-anim-fade-up"
              style={{
                opacity: earned ? 1 : 0.55,
                background: earned ? "rgba(242, 184, 75, 0.10)" : "rgba(255,255,255,0.4)",
                borderColor: earned ? "var(--cck-gold)" : "var(--cck-paper-line-soft)",
              }}
              data-testid={`badge-${b.id}`}
            >
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: earned ? "var(--cck-cream)" : "var(--cck-cream-deep)",
                  border: `1.5px solid ${earned ? "var(--cck-gold-deep)" : "var(--cck-paper-line)"}`,
                }}
              >
                <Icon
                  size={26}
                  color={earned ? "var(--cck-gold-deep)" : "var(--cck-navy-soft)"}
                  strokeWidth={1.6}
                />
              </div>
              <div className="cck-plate-label mt-2 text-[10.5px]">{b.name}</div>
              <div
                className="text-[10px] mt-1"
                style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-ui)" }}
              >
                {earned ? "Earned" : "Locked"}
              </div>
            </div>
          );
        })}
      </div>

      <OrnamentDivider>Recommended Next</OrnamentDivider>

      {nextLesson ? (
        <a
          href={`/lesson/${nextLesson.id}`}
          className="cck-card p-5 block"
          data-testid="progress-next-lesson"
        >
          <div className="cck-eyebrow" style={{ color: "var(--cck-teal-deep)" }}>
            Continue Mission
          </div>
          <div
            className="mt-1 text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
          >
            {nextLesson.title}
          </div>
          <div className="mt-1 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
            {nextLesson.summary}
          </div>
        </a>
      ) : (
        <div className="cck-card p-5 text-center" data-testid="progress-all-done">
          <div className="cck-eyebrow">Mission Complete</div>
          <p className="mt-2" style={{ color: "var(--cck-navy-soft)" }}>
            Every lesson is finished. New plates land soon.
          </p>
        </div>
      )}
    </div>
  );
}
