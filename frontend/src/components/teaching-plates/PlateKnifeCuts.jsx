import React from "react";

const cuts = [
  { name: "Slice", desc: "Round or oval, even thickness — for sauté, garnish, or layering." },
  { name: "Plank", desc: "Long, flat panels — the bridge from whole to baton." },
  { name: "Baton", desc: "Thick rectangles — fries, crudités, sturdy bites." },
  { name: "Small Dice", desc: "Tiny, even cubes — mirepoix, sauces, gentle stews." },
];

export default function PlateKnifeCuts() {
  return (
    <div className="cck-plate relative w-full" data-testid="plate-knife-cuts">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="cck-ornament">
          <span>Four Foundation Cuts</span>
        </div>

        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", lineHeight: 1 }}
        >
          K N I F E · C U T S
        </h2>

        <p className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Slice. Plank. Baton. Dice. The four cuts that shape almost everything you will ever cook.
        </p>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cuts.map((c, i) => (
            <div
              key={c.name}
              className="rounded-2xl border p-5 flex flex-col items-center text-center"
              style={{
                borderColor: "var(--cck-paper-line-soft)",
                background: "rgba(255,255,255,0.55)",
              }}
            >
              <CutIllustration index={i} />
              <div className="cck-plate-label mt-3">{c.name}</div>
              <div
                className="mt-1.5 text-xs sm:text-sm"
                style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
              >
                {c.desc}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-8 cck-plate-hint text-center text-xs sm:text-sm border-t pt-4"
          style={{ borderColor: "var(--cck-paper-line-soft)" }}
        >
          Stable board. Sharp blade. Bear claw. Adult supervision. Calm hands.
        </div>
      </div>
    </div>
  );
}

function CutIllustration({ index }) {
  const color = "#E8843A";
  const stroke = "#9B431B";
  const props = { width: 90, height: 70, viewBox: "0 0 90 70" };

  if (index === 0) {
    return (
      <svg {...props}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={14 + i * 20} cy={35} rx={9} ry={20} fill={color} stroke={stroke} strokeWidth="0.8" />
        ))}
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg {...props}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={10 + i * 24} y={10} width={18} height={50} rx={2} fill={color} stroke={stroke} strokeWidth="0.8" />
        ))}
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg {...props}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={6 + i * 14} y={10} width={9} height={50} rx={1.5} fill={color} stroke={stroke} strokeWidth="0.8" />
        ))}
      </svg>
    );
  }
  return (
    <svg {...props}>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = 6 + (i % 8) * 11;
        const y = 8 + Math.floor(i / 8) * 18;
        return <rect key={i} x={x} y={y} width="9" height="9" rx={1.4} fill={color} stroke={stroke} strokeWidth="0.6" />;
      })}
    </svg>
  );
}
