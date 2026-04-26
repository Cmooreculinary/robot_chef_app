import React from "react";
import { ShieldCheck, Droplets, Heart, UserRound, Ban } from "lucide-react";

const cells = [
  {
    label: "Clean Hands",
    note: "Soap. Warm water. 20 seconds.",
    icon: Droplets,
    color: "var(--cck-teal)",
    bg: "rgba(28,124,125,0.10)",
  },
  {
    label: "Clear Counter",
    note: "No clutter. Stable board. Damp towel.",
    icon: ShieldCheck,
    color: "var(--cck-navy)",
    bg: "rgba(16,42,67,0.07)",
  },
  {
    label: "Safe Tools",
    note: "Sharp knife sheathed. Pot handles in.",
    icon: ShieldCheck,
    color: "var(--cck-coral-deep)",
    bg: "rgba(242,106,91,0.10)",
  },
  {
    label: "Allergy Care",
    note: "Always ask first. Read every label.",
    icon: Heart,
    color: "var(--cck-coral)",
    bg: "rgba(242,106,91,0.08)",
  },
  {
    label: "Trusted Adult",
    note: "For knives, heat, appliances, raw meat.",
    icon: UserRound,
    color: "var(--cck-gold-deep)",
    bg: "rgba(242,184,75,0.14)",
  },
  {
    label: "Do Not Touch",
    note: "Cleaners. Open flame. Hot oil.",
    icon: Ban,
    color: "var(--cck-coral-deep)",
    bg: "rgba(209,78,64,0.10)",
  },
];

export default function PlateKitchenSafety() {
  return (
    <div className="cck-plate cck-plate-teal relative w-full" data-testid="plate-kitchen-safety">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="cck-ornament" style={{ color: "var(--cck-teal-deep)" }}>
          <span>Five Habits · One Calm Kitchen</span>
        </div>

        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", lineHeight: 1 }}
        >
          K I T C H E N · S A F E T Y
        </h2>

        <p className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Before any tool, any heat, or any food — these are the habits a young chef builds first.
        </p>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cells.map(({ label, note, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl border p-4 sm:p-5 flex gap-3 items-start"
              style={{ borderColor: "var(--cck-paper-line-soft)", background: bg }}
            >
              <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "var(--cck-cream)", border: `1px solid ${color}` }}
              >
                <Icon size={22} color={color} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className="cck-plate-label text-[10.5px] sm:text-xs">{label}</div>
                <div
                  className="text-sm mt-1"
                  style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}
                >
                  {note}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-8 text-center cck-plate-hint text-xs sm:text-sm border-t pt-4"
          style={{ borderColor: "var(--cck-paper-line-soft)" }}
        >
          A safe kitchen is a kind kitchen. Practice these five habits every time you cook.
        </div>
      </div>
    </div>
  );
}
