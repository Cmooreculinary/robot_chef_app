import React from "react";
import { Apple, Egg, Wheat, GlassWater, Heart } from "lucide-react";

const sections = [
  { label: "Bright Fruit", icon: Apple, color: "#D14E40", bg: "rgba(242,106,91,0.10)" },
  { label: "Protein", icon: Egg, color: "#C99224", bg: "rgba(242,184,75,0.14)" },
  { label: "Whole Grain", icon: Wheat, color: "#7A4F1F", bg: "rgba(199,182,142,0.20)" },
  { label: "Water", icon: GlassWater, color: "#1C7C7D", bg: "rgba(28,124,125,0.10)" },
];

export default function PlateSnackPlate() {
  return (
    <div className="cck-plate cck-plate-gold relative w-full" data-testid="plate-snack-plate">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="cck-ornament" style={{ color: "var(--cck-gold-deep)" }}>
          <span>Color · Balance · Care</span>
        </div>

        <h2
          className="cck-plate-title text-center mt-4 sm:mt-6"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", lineHeight: 1 }}
        >
          S N A C K · P L A T E
        </h2>

        <p className="cck-plate-hint text-center mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Four small choices that turn any quick snack into a balanced moment of care.
        </p>

        {/* round plate composition */}
        <div className="mt-8 flex justify-center">
          <div
            className="relative rounded-full border-4 flex items-center justify-center"
            style={{
              width: "min(70vw, 420px)",
              height: "min(70vw, 420px)",
              borderColor: "var(--cck-paper-line)",
              background:
                "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #FFF7EA 70%)",
            }}
          >
            {/* quadrants */}
            <div className="absolute inset-3 grid grid-cols-2 grid-rows-2 rounded-full overflow-hidden">
              {sections.map(({ label, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center gap-2 p-3"
                  style={{ background: bg }}
                >
                  <Icon size={36} color={color} strokeWidth={1.6} />
                  <div
                    className="cck-plate-label text-center"
                    style={{ color }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* center medallion */}
            <div
              className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border"
              style={{
                background: "var(--cck-cream)",
                borderColor: "var(--cck-paper-line)",
                boxShadow: "0 2px 10px rgba(16,42,67,0.12)",
              }}
            >
              <Heart size={28} color="#F26A5B" fill="#F26A5B" />
            </div>
          </div>
        </div>

        <div
          className="mt-8 text-center cck-plate-hint text-xs sm:text-sm border-t pt-4 max-w-xl mx-auto"
          style={{ borderColor: "var(--cck-paper-line-soft)" }}
        >
          Always ask about allergies first. The heart in the center is your reminder
          that food is care.
        </div>
      </div>
    </div>
  );
}
