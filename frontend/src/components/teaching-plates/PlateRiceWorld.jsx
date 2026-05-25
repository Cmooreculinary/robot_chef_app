import React from "react";

const regions = [
  { name: "Thailand", dish: "Jasmine", x: 75, y: 56 },
  { name: "India", dish: "Basmati", x: 67, y: 50 },
  { name: "Italy", dish: "Arborio", x: 51, y: 38 },
  { name: "Spain", dish: "Paella", x: 48, y: 42 },
  { name: "West Africa", dish: "Jollof", x: 49, y: 56 },
  { name: "Japan", dish: "Sushi rice", x: 82, y: 42 },
  { name: "Americas", dish: "Beans & rice", x: 24, y: 56 },
];

export default function PlateRiceWorld() {
  return (
    <div className="cck-plate cck-plate-teal relative w-full" data-testid="plate-rice-world">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="cck-ornament" style={{ color: "var(--cck-teal-deep)" }}>
          <span>One Grain · Many Tables</span>
        </div>

        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", lineHeight: 1 }}
        >
          R I C E · A R O U N D · T H E · W O R L D
        </h2>

        <p className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Rice grows on six continents and feeds more than half of the world.
          Each tradition has something to teach us.
        </p>

        {/* stylised world map */}
        <div className="mt-8 relative w-full aspect-[2/1] rounded-xl overflow-hidden border"
             style={{ borderColor: "var(--cck-paper-line-soft)", background: "var(--cck-soft-blue)" }}>
          <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
            {/* simplified continents — purely illustrative */}
            <g fill="#9DC089" stroke="#3F6A2A" strokeWidth="0.4">
              {/* Americas */}
              <path d="M18 22 q4 -8 12 -6 q6 8 4 18 q3 8 -2 16 q-2 8 -8 14 q-4 8 -10 6 q-6 -2 -8 -10 q-2 -8 2 -16 q-4 -8 0 -16 q4 -6 10 -6 z" />
              <path d="M30 60 q4 -2 6 4 q1 8 -2 14 q-3 8 -8 8 q-4 -2 -2 -10 q-2 -6 1 -12 q2 -4 5 -4 z" />
              {/* Europe */}
              <path d="M88 28 q6 -4 14 -2 q6 4 4 12 q-4 8 -12 8 q-8 -2 -10 -8 q-2 -6 4 -10 z" />
              {/* Africa */}
              <path d="M96 44 q8 -2 14 4 q4 12 -2 22 q-4 12 -14 14 q-8 -2 -12 -10 q-4 -10 2 -20 q4 -8 12 -10 z" />
              {/* Asia */}
              <path d="M114 24 q12 -6 28 -2 q12 4 18 14 q4 12 -2 22 q-8 8 -22 10 q-16 4 -28 -4 q-10 -8 -8 -20 q2 -12 14 -20 z" />
              <path d="M158 50 q4 -2 8 2 q2 8 -2 12 q-6 4 -10 -2 q-2 -6 4 -12 z" />
              {/* Australia */}
              <path d="M158 70 q6 -2 12 2 q4 8 -2 12 q-8 4 -14 -2 q-2 -6 4 -12 z" />
            </g>
          </svg>

          {/* region pins */}
          {regions.map((r) => (
            <div
              key={r.name}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              <div
                className="px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold whitespace-nowrap"
                style={{
                  background: "var(--cck-cream)",
                  color: "var(--cck-navy)",
                  border: "1px solid var(--cck-paper-line)",
                  fontFamily: "var(--font-ui)",
                  boxShadow: "0 2px 6px rgba(16,42,67,0.15)",
                }}
              >
                <span style={{ color: "var(--cck-coral-deep)", marginRight: 4 }}>●</span>
                {r.name} · <span style={{ fontStyle: "italic" }}>{r.dish}</span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-8 cck-plate-hint text-center text-xs sm:text-sm border-t pt-4"
          style={{ borderColor: "var(--cck-paper-line-soft)" }}
        >
          Curiosity over comparison. Each tradition is a story shared at a table.
        </div>
      </div>
    </div>
  );
}
