import React from "react";
import { Truck, Users, Utensils, HeartHandshake, Tag } from "lucide-react";

const parts = [
  { label: "Name", icon: Tag, hint: "Memorable. Honest. Easy to say." },
  { label: "Idea", icon: Truck, hint: "One thing, done very well." },
  { label: "Menu", icon: Utensils, hint: "Three items. Real customers. Real cost." },
  { label: "Customer", icon: Users, hint: "Who is this for? Where do they live?" },
  { label: "Service", icon: HeartHandshake, hint: "What community need does this answer?" },
];

export default function PlateFoodTruck() {
  return (
    <div className="cck-plate cck-plate-coral relative w-full" data-testid="plate-food-truck">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="cck-ornament" style={{ color: "var(--cck-coral-deep)" }}>
          <span>One Truck · One Mission</span>
        </div>

        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", lineHeight: 1 }}
        >
          F O O D · T R U C K
        </h2>

        <p className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base">
          A great food truck is a small kitchen with a big purpose. Build the
          concept first — the rest follows.
        </p>

        {/* truck illustration */}
        <div className="mt-8 flex justify-center">
          <svg viewBox="0 0 280 110" className="w-full max-w-md">
            <g fill="#FFF7EA" stroke="#102A43" strokeWidth="1.5">
              <rect x="10" y="20" width="160" height="60" rx="6" />
              <path d="M170 35 h70 l20 20 v25 h-90 z" />
            </g>
            <g fill="#F26A5B" stroke="#9B431B" strokeWidth="1">
              <rect x="14" y="24" width="152" height="20" />
              <text x="90" y="38" textAnchor="middle" fontFamily="IM Fell English SC, serif"
                    fontSize="11" fill="#FFF7EA" letterSpacing="2">YOUR · TRUCK</text>
            </g>
            <g fill="#DDF3FF" stroke="#102A43" strokeWidth="1">
              <rect x="180" y="42" width="60" height="28" rx="2" />
            </g>
            <g fill="#1F3D5C" stroke="#102A43" strokeWidth="1">
              <circle cx="60" cy="92" r="12" />
              <circle cx="200" cy="92" r="12" />
              <circle cx="60" cy="92" r="5" fill="#FFF7EA" />
              <circle cx="200" cy="92" r="5" fill="#FFF7EA" />
            </g>
            <g fill="#F2B84B" stroke="#C99224" strokeWidth="0.8">
              <rect x="22" y="50" width="22" height="22" rx="3" />
              <rect x="50" y="50" width="22" height="22" rx="3" />
              <rect x="78" y="50" width="22" height="22" rx="3" />
              <rect x="106" y="50" width="22" height="22" rx="3" />
              <rect x="134" y="50" width="22" height="22" rx="3" />
            </g>
          </svg>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {parts.map(({ label, icon: Icon, hint }) => (
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
                style={{ background: "rgba(242,106,91,0.12)" }}
              >
                <Icon size={20} color="var(--cck-coral-deep)" strokeWidth={1.8} />
              </div>
              <div className="cck-plate-label mt-2">{label}</div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-body)" }}
              >
                {hint}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
