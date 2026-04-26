import React from "react";
import { Store, Sparkles, Users, Sparkle, Heart, ClipboardList } from "lucide-react";

const legs = [
  { label: "Hospitality", icon: Heart, color: "var(--cck-coral)" },
  { label: "Team Roles", icon: Users, color: "var(--cck-navy)" },
  { label: "Cleanliness", icon: Sparkle, color: "var(--cck-teal)" },
  { label: "Concept", icon: ClipboardList, color: "var(--cck-gold-deep)" },
];

export default function PlateRestaurant() {
  return (
    <div className="cck-plate relative w-full" data-testid="plate-restaurant">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="cck-ornament">
          <span>Hospitality · Team · Cleanliness · Concept</span>
        </div>

        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", lineHeight: 1 }}
        >
          R E S T A U R A N T
        </h2>

        <p className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Guests remember how they were treated long after they forget what they ate.
        </p>

        {/* storefront illustration */}
        <div className="mt-8 flex justify-center">
          <svg viewBox="0 0 280 130" className="w-full max-w-md">
            <g fill="#FFF7EA" stroke="#102A43" strokeWidth="1.5">
              <rect x="20" y="40" width="240" height="80" rx="3" />
              <path d="M14 40 l16 -22 h220 l16 22 z" />
            </g>
            <g fill="#1C7C7D">
              <rect x="20" y="34" width="240" height="6" />
            </g>
            <g fill="#102A43" fontFamily="IM Fell English SC, serif" letterSpacing="3">
              <text x="140" y="62" textAnchor="middle" fontSize="14" fill="#FFF7EA">YOUR · NAME</text>
            </g>
            <g fill="#DDF3FF" stroke="#102A43" strokeWidth="1">
              <rect x="40" y="72" width="60" height="40" />
              <rect x="180" y="72" width="60" height="40" />
              <line x1="70" y1="72" x2="70" y2="112" stroke="#102A43" />
              <line x1="210" y1="72" x2="210" y2="112" stroke="#102A43" />
            </g>
            <g fill="#F2B84B" stroke="#C99224" strokeWidth="0.8">
              <rect x="115" y="72" width="50" height="48" rx="2" />
              <circle cx="158" cy="96" r="2" fill="#102A43" />
            </g>
            <g fill="#F26A5B" stroke="#9B431B" strokeWidth="0.8">
              <rect x="116" y="78" width="48" height="6" />
            </g>
          </svg>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {legs.map(({ label, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border p-4 text-center"
              style={{
                borderColor: "var(--cck-paper-line-soft)",
                background: "rgba(255,255,255,0.55)",
              }}
            >
              <div
                className="mx-auto w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--cck-cream-deep)" }}
              >
                <Icon size={20} color={color} strokeWidth={1.8} />
              </div>
              <div className="cck-plate-label mt-2">{label}</div>
            </div>
          ))}
        </div>

        <div
          className="mt-8 cck-plate-hint text-center text-xs sm:text-sm border-t pt-4"
          style={{ borderColor: "var(--cck-paper-line-soft)" }}
        >
          Hospitality is one of the oldest virtues. Build it into every shift.
        </div>
      </div>
    </div>
  );
}
