import React from "react";

export const CAPTAIN_IMG =
  "https://customer-assets.emergentagent.com/job_captain-culinary/artifacts/6ehkjbxr_Chris_moore_I_need_5_images_of_this_half_robot_afting_like_he_was_talking_exp_a94f2ae5-a14a-42ce-90da-041eba5d89e9.png";

/**
 * Reusable Captain Culinary visual — used as hero, mentor card, and
 * inline avatar throughout the app. Sizes: "hero" | "lg" | "md" | "sm"
 */
export const CaptainCulinary = ({ size = "md", className = "", float = false }) => {
  const sizes = {
    hero: "w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px]",
    lg: "w-44 h-44 sm:w-56 sm:h-56",
    md: "w-28 h-28 sm:w-32 sm:h-32",
    sm: "w-16 h-16",
  };

  return (
    <div
      className={`relative ${sizes[size]} ${float ? "cck-anim-float" : ""} ${className}`}
      data-testid="captain-culinary-image"
      style={{ isolation: "isolate" }}
    >
      <img
        src={CAPTAIN_IMG}
        alt="Captain Culinary, robot chef mentor"
        className="relative w-full h-full object-contain cck-captain-eye-glow"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 52% 64% at 50% 50%, #000 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(ellipse 52% 64% at 50% 50%, #000 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0) 100%)",
          mixBlendMode: "multiply",
        }}
        draggable={false}
      />
    </div>
  );
};

/**
 * Captain narration card — used during teaching & Q&A.
 */
export const CaptainCard = ({ title = "Captain Culinary", body, footer, children }) => {
  return (
    <div className="cck-captain-card rounded-2xl p-4 sm:p-5" data-testid="captain-card">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <CaptainCulinary size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="cck-eyebrow">{title}</div>
          {body && (
            <p
              className="mt-1.5 text-[15px] leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}
            >
              {body}
            </p>
          )}
          {children}
        </div>
      </div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-[var(--cck-paper-line-soft)]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default CaptainCulinary;
