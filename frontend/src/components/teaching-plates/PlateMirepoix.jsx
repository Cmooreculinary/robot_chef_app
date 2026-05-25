import React from "react";

/**
 * Vintage culinary teaching plate — Mirepoix.
 * Renders the canonical onion / celery / carrot progression
 * from WHOLE → TRIMMED → SLICES → BATONS → SMALL DICE.
 */
export default function PlateMirepoix() {
  return (
    <div className="cck-plate cck-plate-coral relative w-full" data-testid="plate-mirepoix">
      <div className="p-5 sm:p-8 lg:p-10">
        {/* eyebrow */}
        <div className="text-center cck-ornament" style={{ color: "var(--cck-coral-deep)" }}>
          <span>From Vegetable to Small Dice</span>
        </div>

        {/* big plate title */}
        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", lineHeight: 1 }}
        >
          M I R E P O I X
        </h2>

        <p
          className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base"
        >
          The classic aromatic foundation for soups, sauces, stews, and many
          kitchen creations.
        </p>

        {/* progression header */}
        <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-4">
          {["Whole", "Trimmed", "Slice / Plank", "Baton", "Small Dice"].map((label, i) => (
            <div key={label} className="text-center">
              <div className="cck-plate-label text-[10px] sm:text-xs">{`${i + 1} · ${label}`}</div>
            </div>
          ))}
        </div>

        {/* rows: onion, celery, carrot */}
        <div className="mt-4 sm:mt-6 space-y-7">
          <ProgressionRow color="#F2D9A8" stroke="#7A4F1F" label="Onion" shape="onion" />
          <ProgressionRow color="#9DC089" stroke="#3F6A2A" label="Celery" shape="celery" />
          <ProgressionRow color="#E8843A" stroke="#9B431B" label="Carrot" shape="carrot" />
        </div>

        {/* footer note */}
        <div
          className="mt-8 cck-plate-hint text-center text-xs sm:text-sm border-t pt-4"
          style={{ borderColor: "var(--cck-paper-line-soft)" }}
        >
          Read each row left to right. Notice how every cut grows smaller and
          more even. Calm hands, sharp blade, even pieces.
        </div>
      </div>
    </div>
  );
}

function ProgressionRow({ color, stroke, label, shape }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center">
      <Stage>{renderShape(shape, "whole", color, stroke)}</Stage>
      <Stage>{renderShape(shape, "trimmed", color, stroke)}</Stage>
      <Stage>{renderShape(shape, "slice", color, stroke)}</Stage>
      <Stage>{renderShape(shape, "baton", color, stroke)}</Stage>
      <Stage>
        {renderShape(shape, "dice", color, stroke)}
        <div
          className="cck-plate-label mt-1.5 text-[10px] sm:text-[11px]"
          style={{ color: stroke }}
        >
          {label}
        </div>
      </Stage>
    </div>
  );
}

function Stage({ children }) {
  return (
    <div className="aspect-square flex flex-col items-center justify-center">
      {children}
    </div>
  );
}

function renderShape(shape, stage, color, stroke) {
  const size = 56;
  const props = { width: "100%", height: "100%", viewBox: `0 0 ${size} ${size}` };
  if (shape === "onion") {
    if (stage === "whole") {
      return (
        <svg {...props}>
          <ellipse cx="28" cy="34" rx="18" ry="20" fill={color} stroke={stroke} strokeWidth="1" />
          <path d="M28 14 q-2 -8 4 -10" fill="none" stroke={stroke} strokeWidth="1.5" />
          <path d="M22 22 q6 14 12 0" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.6" />
        </svg>
      );
    }
    if (stage === "trimmed") {
      return (
        <svg {...props}>
          <ellipse cx="28" cy="32" rx="16" ry="16" fill={color} stroke={stroke} strokeWidth="1" />
          <path d="M16 32 q12 -10 24 0" fill="none" stroke={stroke} strokeWidth="0.7" />
          <path d="M16 32 q12 10 24 0" fill="none" stroke={stroke} strokeWidth="0.7" />
        </svg>
      );
    }
    if (stage === "slice") {
      return (
        <svg {...props}>
          <g transform="translate(8 12)">
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={20} cy={6 + i * 11} rx="18" ry="5" fill={color} stroke={stroke} strokeWidth="0.8" />
            ))}
          </g>
        </svg>
      );
    }
    if (stage === "baton") {
      return (
        <svg {...props}>
          <g transform="translate(8 12)" stroke={stroke} strokeWidth="0.7">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 9} y="2" width="6" height="32" rx="1" fill={color} />
            ))}
          </g>
        </svg>
      );
    }
    return (
      <svg {...props}>
        <g stroke={stroke} strokeWidth="0.6">
          {Array.from({ length: 16 }).map((_, i) => {
            const x = 8 + (i % 4) * 10;
            const y = 8 + Math.floor(i / 4) * 10;
            return <rect key={i} x={x} y={y} width="7" height="7" rx="1.2" fill={color} />;
          })}
        </g>
      </svg>
    );
  }

  if (shape === "celery") {
    if (stage === "whole") {
      return (
        <svg {...props}>
          <path d="M22 50 q3 -28 6 -42 q3 14 6 42 z" fill={color} stroke={stroke} strokeWidth="1" />
          <path d="M22 12 q-2 -8 4 -10 M34 12 q3 -7 -2 -10" fill="none" stroke={stroke} strokeWidth="1" />
        </svg>
      );
    }
    if (stage === "trimmed") {
      return (
        <svg {...props}>
          <rect x="22" y="10" width="14" height="38" rx="4" fill={color} stroke={stroke} strokeWidth="1" />
          <path d="M22 18 h14 M22 30 h14" fill="none" stroke={stroke} strokeWidth="0.6" />
        </svg>
      );
    }
    if (stage === "slice") {
      return (
        <svg {...props}>
          <g transform="translate(6 12)">
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${i * 14 + 4} 4 q5 -2 10 0 v32 q-5 2 -10 0 z`}
                fill={color}
                stroke={stroke}
                strokeWidth="0.7"
              />
            ))}
          </g>
        </svg>
      );
    }
    if (stage === "baton") {
      return (
        <svg {...props}>
          <g transform="translate(8 12)" stroke={stroke} strokeWidth="0.7">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 9} y="2" width="6" height="32" rx="1" fill={color} />
            ))}
          </g>
        </svg>
      );
    }
    return (
      <svg {...props}>
        <g stroke={stroke} strokeWidth="0.6">
          {Array.from({ length: 16 }).map((_, i) => {
            const x = 8 + (i % 4) * 10;
            const y = 8 + Math.floor(i / 4) * 10;
            return <rect key={i} x={x} y={y} width="7" height="7" rx="1.2" fill={color} />;
          })}
        </g>
      </svg>
    );
  }

  // carrot
  if (stage === "whole") {
    return (
      <svg {...props}>
        <path d="M28 50 q-2 -28 0 -38 q12 8 0 38 z" fill={color} stroke={stroke} strokeWidth="1" />
        <path d="M28 12 q-3 -8 -8 -10 M28 12 q3 -8 8 -10 M28 14 q0 -8 0 -12" fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }
  if (stage === "trimmed") {
    return (
      <svg {...props}>
        <path d="M22 12 q6 -2 12 0 q1 12 -6 38 q-7 -26 -6 -38 z" fill={color} stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }
  if (stage === "slice") {
    return (
      <svg {...props}>
        <g transform="translate(10 14)" stroke={stroke} strokeWidth="0.7">
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={18} cy={4 + i * 12} rx="16" ry="4.5" fill={color} />
          ))}
        </g>
      </svg>
    );
  }
  if (stage === "baton") {
    return (
      <svg {...props}>
        <g transform="translate(8 12)" stroke={stroke} strokeWidth="0.7">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 9} y="2" width="6" height="32" rx="1" fill={color} />
          ))}
        </g>
      </svg>
    );
  }
  return (
    <svg {...props}>
      <g stroke={stroke} strokeWidth="0.6">
        {Array.from({ length: 16 }).map((_, i) => {
          const x = 8 + (i % 4) * 10;
          const y = 8 + Math.floor(i / 4) * 10;
          return <rect key={i} x={x} y={y} width="7" height="7" rx="1.2" fill={color} />;
        })}
      </g>
    </svg>
  );
}
