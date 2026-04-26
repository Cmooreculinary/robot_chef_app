import React from "react";
import { useNavigate } from "react-router-dom";
import { CaptainCulinary } from "@/components/CaptainCulinary";
import OrnamentDivider from "@/components/OrnamentDivider";

export default function Welcome() {
  const nav = useNavigate();
  return (
    <div className="cck-page min-h-screen flex flex-col" data-testid="welcome-page">
      <div className="flex-1 flex flex-col items-center justify-center text-center cck-anim-fade-up">
        {/* eyebrow */}
        <div className="cck-eyebrow" data-testid="welcome-eyebrow">
          A Captain Culinary App
        </div>

        {/* hero captain */}
        <div className="mt-4 sm:mt-6 relative">
          <CaptainCulinary size="hero" float />
        </div>

        {/* app name */}
        <h1
          className="cck-h1 mt-6 sm:mt-8"
          style={{ fontSize: "clamp(2.4rem, 7vw, 4.6rem)" }}
          data-testid="welcome-app-name"
        >
          Captain Culinary
          <span
            className="block cck-display mt-2"
            style={{ fontSize: "clamp(0.9rem, 2.4vw, 1.4rem)", color: "var(--cck-teal-deep)" }}
          >
            K I D S
          </span>
        </h1>

        {/* tagline */}
        <div
          className="mt-3 sm:mt-4 cck-display"
          style={{ fontSize: "clamp(0.85rem, 2vw, 1rem)", color: "var(--cck-coral-deep)" }}
          data-testid="welcome-tagline"
        >
          Learn · Cook · Serve
        </div>

        <OrnamentDivider>· · ·</OrnamentDivider>

        {/* welcome copy */}
        <p
          className="max-w-xl mx-auto text-base sm:text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
          data-testid="welcome-copy"
        >
          Welcome to Captain Culinary Kids. I'm Captain Culinary, your chef
          mentor for food skills, family cooking, global learning, and service.
          Choose your path and begin your mission.
        </p>

        {/* actions */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <button
            onClick={() => nav("/age")}
            className="cck-btn-primary text-base sm:text-lg"
            data-testid="welcome-start-mission-btn"
          >
            Start Your Mission
          </button>
          <button
            onClick={() => nav("/parent")}
            className="cck-btn-ghost text-base sm:text-lg"
            data-testid="welcome-parent-info-btn"
          >
            Parent / Teacher Info
          </button>
        </div>

        {/* one-time purchase line */}
        <div
          className="mt-8 cck-eyebrow"
          style={{ color: "var(--cck-navy-soft)" }}
          data-testid="welcome-purchase-line"
        >
          Buy Once · Build Food Skills For Years
        </div>
      </div>

      {/* footer mark */}
      <div
        className="text-center mt-10 text-xs"
        style={{ fontFamily: "var(--font-plate)", letterSpacing: "0.3em", color: "var(--cck-navy-soft)" }}
      >
        EST · CAPTAIN · CULINARY · KIDS
      </div>
    </div>
  );
}
