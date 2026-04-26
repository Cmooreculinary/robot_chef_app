import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout, ChefHat, Compass, Users } from "lucide-react";
import { AGE_PATHS } from "@/data/lessons";
import { Storage } from "@/services/storage";
import { CaptainCulinary } from "@/components/CaptainCulinary";

const ICONS = {
  "7-12": Sprout,
  "13-16": ChefHat,
  "17-19": Compass,
  parent: Users,
};

const ACCENT_TO_BORDER = {
  teal: "var(--cck-teal)",
  coral: "var(--cck-coral)",
  gold: "var(--cck-gold)",
  navy: "var(--cck-navy)",
};

const ACCENT_TO_BG = {
  teal: "rgba(28,124,125,0.08)",
  coral: "rgba(242,106,91,0.08)",
  gold: "rgba(242,184,75,0.10)",
  navy: "rgba(16,42,67,0.06)",
};

export default function AgeSelection() {
  const nav = useNavigate();

  const choose = (id) => {
    if (id === "parent") {
      nav("/parent");
      return;
    }
    Storage.setAgeGroup(id);
    nav("/dashboard");
  };

  return (
    <div className="cck-page" data-testid="age-selection-page">
      {/* back */}
      <button
        onClick={() => nav("/")}
        className="inline-flex items-center gap-2 mb-4 text-sm font-semibold"
        style={{ color: "var(--cck-navy-soft)" }}
        data-testid="age-back-btn"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="text-center cck-anim-fade-up">
        <CaptainCulinary size="md" className="mx-auto" />
        <div className="cck-eyebrow mt-3">Choose Your Path</div>
        <h1
          className="cck-h1 mt-2"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          data-testid="age-title"
        >
          Which mission begins today?
        </h1>
        <p
          className="mt-3 max-w-xl mx-auto"
          style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
        >
          Each path is shaped for the chef in front of me. Pick the one that
          fits — you can always change paths later in Settings.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 cck-stagger">
        {AGE_PATHS.map((p) => {
          const Icon = ICONS[p.id] || ChefHat;
          return (
            <button
              key={p.id}
              onClick={() => choose(p.id)}
              data-testid={`age-card-${p.id}`}
              className="cck-card p-5 sm:p-6 text-left cck-anim-fade-up"
              style={{
                background: ACCENT_TO_BG[p.accent],
                borderColor: ACCENT_TO_BORDER[p.accent],
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--cck-cream)", border: `1px solid ${ACCENT_TO_BORDER[p.accent]}` }}
                >
                  <Icon size={22} color={ACCENT_TO_BORDER[p.accent]} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="cck-eyebrow" style={{ color: ACCENT_TO_BORDER[p.accent] }}>
                    {p.ageLabel}
                  </div>
                  <h3
                    className="mt-1"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600 }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="mt-2 text-[15px] leading-relaxed"
                    style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
                  >
                    {p.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
