import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Sparkles, Globe2, HeartHandshake, Settings as SettingsIcon, Award, ChefHat } from "lucide-react";
import { Storage } from "@/services/storage";
import { Api } from "@/services/api";
import { getLessonsByAge, BADGES, AGE_PATHS } from "@/data/lessons";
import { CaptainCulinary, CaptainCard } from "@/components/CaptainCulinary";
import OrnamentDivider from "@/components/OrnamentDivider";

export default function Dashboard() {
  const nav = useNavigate();
  const [state, setState] = useState(Storage.getState());

  useEffect(() => {
    if (!state.ageGroup) {
      nav("/age");
    } else {
      Api.syncProgress();
    }
  }, [state.ageGroup, nav]);

  const lessons = useMemo(() => getLessonsByAge(state.ageGroup), [state.ageGroup]);
  const todaysPlate = lessons[0];
  const continueLesson = lessons.find((l) => !state.completedLessons.includes(l.id)) || lessons[0];
  const path = AGE_PATHS.find((p) => p.id === state.ageGroup);

  const totalLessons = lessons.length;
  const completed = lessons.filter((l) => state.completedLessons.includes(l.id)).length;
  const progressPct = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

  if (!state.ageGroup) return null;

  return (
    <div className="cck-page" data-testid="dashboard-page">
      {/* header bar */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="cck-eyebrow">{path?.ageLabel}</div>
          <h1
            className="cck-h1 mt-1"
            style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.6rem)" }}
            data-testid="dashboard-title"
          >
            {greeting()}, {path?.title.replace(" Path", "")}.
          </h1>
        </div>
        <Link
          to="/settings"
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
          style={{ borderColor: "var(--cck-paper-line)", background: "var(--cck-cream)" }}
          data-testid="dashboard-settings-link"
        >
          <SettingsIcon size={18} color="var(--cck-navy)" />
        </Link>
      </div>

      {/* mentor card */}
      <div className="mt-6 cck-anim-fade-up">
        <CaptainCard
          title="Captain Culinary · Mentor"
          body="Today's plate is ready. I'll walk you through the image, answer your questions, and check in before we move on to the next step."
          footer={
            <button
              onClick={() => nav(`/lesson/${todaysPlate.id}`)}
              className="cck-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
              data-testid="dashboard-start-todays-plate-btn"
            >
              Open Today's Teaching Plate
              <ArrowRight size={18} />
            </button>
          }
        />
      </div>

      {/* progress strip */}
      <div className="mt-6 grid grid-cols-3 gap-3" data-testid="dashboard-progress-strip">
        <Stat label="Lessons" value={`${completed}/${totalLessons}`} />
        <Stat label="Badges" value={state.earnedBadges.length} />
        <Stat label="Path" value={progressPct + "%"} />
      </div>

      <OrnamentDivider>· Today ·</OrnamentDivider>

      {/* today's plate hero */}
      <button
        onClick={() => nav(`/lesson/${todaysPlate.id}`)}
        className="block w-full text-left cck-card overflow-hidden"
        data-testid="dashboard-todays-plate-card"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Sparkles size={18} color="var(--cck-coral-deep)" />
            <div>
              <div className="cck-eyebrow" style={{ color: "var(--cck-coral-deep)" }}>
                Today's Teaching Plate
              </div>
              <h3
                className="mt-1"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600 }}
              >
                {todaysPlate.title}
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
                {todaysPlate.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="cck-tag cck-tag-teal">{todaysPlate.path}</span>
                <span className="cck-tag cck-tag-gold">{todaysPlate.time}</span>
                <span className="cck-tag cck-tag-navy">{todaysPlate.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* continue learning */}
      {continueLesson && continueLesson.id !== todaysPlate.id && (
        <div className="mt-4">
          <button
            onClick={() => nav(`/lesson/${continueLesson.id}`)}
            className="cck-card p-5 w-full text-left flex items-center justify-between gap-3"
            data-testid="dashboard-continue-card"
          >
            <div className="min-w-0">
              <div className="cck-eyebrow" style={{ color: "var(--cck-teal-deep)" }}>Continue Learning</div>
              <h4 className="mt-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>
                {continueLesson.title}
              </h4>
            </div>
            <ArrowRight size={20} color="var(--cck-navy)" />
          </button>
        </div>
      )}

      <OrnamentDivider>· Quick Missions ·</OrnamentDivider>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <QuickTile
          to="/family"
          icon={HeartHandshake}
          color="var(--cck-coral)"
          eyebrow="Family"
          title="Family Mission"
          testId="dashboard-family-tile"
        />
        <QuickTile
          to="/global"
          icon={Globe2}
          color="var(--cck-teal)"
          eyebrow="Global"
          title="Food Mission"
          testId="dashboard-global-tile"
        />
        <QuickTile
          to="/progress"
          icon={Award}
          color="var(--cck-gold-deep)"
          eyebrow="Progress"
          title="Badges Earned"
          testId="dashboard-progress-tile"
        />
        <QuickTile
          to="/lessons"
          icon={ChefHat}
          color="var(--cck-navy)"
          eyebrow="Library"
          title="All Lessons"
          testId="dashboard-library-tile"
        />
      </div>

      {/* recommended next + badge sneak peek */}
      <div className="mt-6 cck-card p-5 flex items-center gap-4">
        <CaptainCulinary size="sm" />
        <div className="flex-1 min-w-0">
          <div className="cck-eyebrow">Up Next</div>
          <div className="mt-1 font-semibold" style={{ fontFamily: "var(--font-ui)", color: "var(--cck-navy)" }}>
            {continueLesson?.title || "All caught up — new plates land soon."}
          </div>
        </div>
        <button
          onClick={() => nav("/lessons")}
          className="cck-btn-ghost text-sm"
          data-testid="dashboard-see-all-btn"
        >
          See all
        </button>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Stat({ label, value }) {
  return (
    <div
      className="cck-card p-4 text-center"
      data-testid={`stat-${label.toLowerCase()}`}
    >
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
      >
        {value}
      </div>
      <div className="cck-eyebrow mt-1">{label}</div>
    </div>
  );
}

function QuickTile({ to, icon: Icon, color, eyebrow, title, testId }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(to)}
      className="cck-card p-5 text-left"
      data-testid={testId}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "var(--cck-cream-deep)" }}
      >
        <Icon size={20} color={color} strokeWidth={1.8} />
      </div>
      <div className="cck-eyebrow mt-3" style={{ color }}>
        {eyebrow}
      </div>
      <div
        className="mt-1 font-semibold"
        style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)", fontSize: "1.05rem" }}
      >
        {title}
      </div>
    </button>
  );
}
