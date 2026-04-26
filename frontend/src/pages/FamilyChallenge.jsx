import React, { useState } from "react";
import { FAMILY_CHALLENGES } from "@/data/lessons";
import { Storage } from "@/services/storage";
import { Api } from "@/services/api";
import { CheckCircle2, Circle, HeartHandshake } from "lucide-react";
import OrnamentDivider from "@/components/OrnamentDivider";
import { CaptainCard } from "@/components/CaptainCulinary";

export default function FamilyChallenge() {
  const [state, setState] = useState(Storage.getState());

  const toggle = (id) => {
    const next = Storage.toggleChallenge(id);
    setState(next);
    Api.syncProgress();
  };

  const done = state.completedChallenges.length;
  const total = FAMILY_CHALLENGES.length;

  return (
    <div className="cck-page" data-testid="family-challenge-page">
      <div className="cck-eyebrow">Family Mission</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
        data-testid="family-title"
      >
        Cook · Care · Serve Together
      </h1>

      <div className="mt-5">
        <CaptainCard
          title="Captain Culinary"
          body="Cooking is one of the oldest ways a family takes care of each other. Pick a mission, do it with someone you love, and check it off when it's done."
        />
      </div>

      <OrnamentDivider>{done} of {total} complete</OrnamentDivider>

      <div className="space-y-3 cck-stagger">
        {FAMILY_CHALLENGES.map((c) => {
          const isDone = state.completedChallenges.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className="cck-card w-full p-5 text-left cck-anim-fade-up flex items-start gap-4"
              data-testid={`family-challenge-${c.id}`}
            >
              <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: isDone ? "rgba(28,124,125,0.12)" : "var(--cck-cream-deep)",
                  border: `1.5px solid ${isDone ? "var(--cck-teal)" : "var(--cck-paper-line)"}`,
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={20} color="var(--cck-teal-deep)" />
                ) : (
                  <Circle size={20} color="var(--cck-navy-soft)" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--cck-navy)" }}
                >
                  {c.title}
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
                  {c.prompt}
                </p>
                {isDone && (
                  <div className="mt-2 inline-flex items-center gap-1 cck-tag cck-tag-teal">
                    <HeartHandshake size={12} /> Mission Logged
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
