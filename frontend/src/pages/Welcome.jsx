import React from "react";
import { useNavigate } from "react-router-dom";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_captain-culinary/artifacts/kfounkjt_LOGO%21.png";

export default function Welcome() {
  const nav = useNavigate();
  return (
    <div className="cck-page min-h-screen flex flex-col" data-testid="welcome-page">
      <div className="flex-1 flex flex-col items-center justify-center text-center cck-anim-fade-up">
        {/* Provided logo — used as-is, reasonably large */}
        <div
          className="w-full flex justify-center"
          style={{ isolation: "isolate" }}
          data-testid="welcome-logo-wrap"
        >
          <img
            src={LOGO_URL}
            alt="Captain Culinary Kids — Cooking · Compassion · Community · Learn · Cook · Serve"
            draggable={false}
            className="cck-anim-float w-[88vw] sm:w-[560px] lg:w-[640px] max-w-[720px] h-auto select-none"
            style={{
              filter: "drop-shadow(0 18px 36px rgba(16,42,67,0.18))",
              mixBlendMode: "multiply",
            }}
            data-testid="welcome-logo-image"
          />
        </div>

        {/* welcome copy (text below the logo) */}
        <p
          className="mt-8 sm:mt-10 max-w-xl mx-auto text-base sm:text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
          data-testid="welcome-copy"
        >
          Welcome to Captain Culinary Kids. I'm Captain Culinary, your chef
          mentor for food skills, family cooking, global learning, and service.
          Choose your path and begin your mission.
        </p>

        {/* actions */}
        <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
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
          className="mt-7 cck-eyebrow"
          style={{ color: "var(--cck-navy-soft)" }}
          data-testid="welcome-purchase-line"
        >
          Buy Once · Build Food Skills For Years
        </div>
      </div>
    </div>
  );
}
