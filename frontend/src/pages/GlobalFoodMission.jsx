import React, { useState } from "react";
import { GLOBAL_MISSIONS } from "@/data/lessons";
import { Globe2, MessagesSquare, ChefHat, BookOpen, Sparkles } from "lucide-react";
import OrnamentDivider from "@/components/OrnamentDivider";
import { CaptainCard } from "@/components/CaptainCulinary";

const DETAILS = {
  rice: {
    note: "Rice grows on six continents and feeds more than half the world. Each tradition has a story.",
    skill: "Wash rice gently, measure water carefully, lid on, low heat — the universal rules.",
    discuss: "Ask your family about a rice dish they grew up with.",
    cook: "With an adult, prepare a simple rice from one tradition.",
    life: "Hospitality often begins with grain. To share rice is to share a small kindness.",
  },
  bread: {
    note: "From naan to sourdough, bread is one of the most universal foods on earth.",
    skill: "Watch how dough comes together — flour, water, salt, time. Every culture has a flour and a fire.",
    discuss: "Which bread does your family love most?",
    cook: "Try a no-knead flatbread with an adult.",
    life: "Breaking bread together is older than any country.",
  },
  "soup-stew": {
    note: "Slow, warm, and communal — every culture has its pot of love.",
    skill: "Build a base — onion, garlic, fat — then layer flavors patiently.",
    discuss: "What soup means home for your family?",
    cook: "Pick one tradition's stew. Plan it. Cook it with an adult.",
    life: "A pot of soup feeds many. Service often looks like this.",
  },
  "tropical-fruits": {
    note: "Mango, papaya, lychee, durian — bright, sun-fed fruits of warm regions.",
    skill: "Pick by smell and weight. Cut with care.",
    discuss: "Which tropical fruit have you never tried?",
    cook: "Build a tropical fruit plate as a family snack.",
    life: "Curiosity is a quiet way to honor other cultures.",
  },
  spices: {
    note: "A pinch of spice can travel ten thousand miles in one breath.",
    skill: "Smell first. Toast gently. A little spice goes a long way.",
    discuss: "Open the spice cabinet and smell three together.",
    cook: "Make a simple rice or yogurt with one new spice.",
    life: "Even a tiny ingredient can transform a meal — and a moment.",
  },
  "family-meals": {
    note: "What does dinner look like in homes around the world? Curiosity over comparison.",
    skill: "Set the table with intention. Light a candle. Wait for everyone.",
    discuss: "Ask one neighbor or friend about their family dinner.",
    cook: "Make a family meal together this week.",
    life: "The table is one of the great teachers.",
  },
};

export default function GlobalFoodMission() {
  const [open, setOpen] = useState(null);
  const detail = open ? DETAILS[open.id] : null;

  return (
    <div className="cck-page" data-testid="global-mission-page">
      <div className="cck-eyebrow">Global Food Mission</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
        data-testid="global-title"
      >
        One World · Many Tables
      </h1>

      <div className="mt-5">
        <CaptainCard
          title="Captain Culinary"
          body="Food teaches respect. Pick a mission, learn the tradition with curiosity, and try one small step at home."
        />
      </div>

      <OrnamentDivider>Six Missions</OrnamentDivider>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cck-stagger" data-testid="global-grid">
        {GLOBAL_MISSIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => setOpen(m)}
            className="cck-card p-5 text-left cck-anim-fade-up"
            data-testid={`global-mission-${m.id}`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(28,124,125,0.10)" }}
            >
              <Globe2 size={20} color="var(--cck-teal-deep)" strokeWidth={1.8} />
            </div>
            <div
              className="mt-3 font-semibold"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--cck-navy)" }}
            >
              {m.title}
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
              {m.note}
            </p>
            <div className="mt-3 cck-tag cck-tag-teal">{m.region}</div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6"
          style={{ background: "rgba(16,42,67,0.45)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpen(null)}
          data-testid="global-modal-overlay"
        >
          <div
            className="cck-card max-w-lg w-full p-6 cck-anim-fade-up"
            onClick={(e) => e.stopPropagation()}
            data-testid="global-modal"
          >
            <div className="cck-eyebrow" style={{ color: "var(--cck-teal-deep)" }}>{open.region}</div>
            <h3
              className="mt-1"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600 }}
            >
              {open.title}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
              {detail.note}
            </p>
            <OrnamentDivider>Mission</OrnamentDivider>
            <div className="space-y-3 text-sm">
              <Row icon={ChefHat} title="Beginner Skill" body={detail.skill} />
              <Row icon={MessagesSquare} title="Family Discussion" body={detail.discuss} />
              <Row icon={Sparkles} title="Supervised Cooking Challenge" body={detail.cook} />
              <Row icon={BookOpen} title="Life Connection" body={detail.life} />
            </div>
            <button
              onClick={() => setOpen(null)}
              className="cck-btn-primary mt-5 w-full"
              data-testid="global-modal-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-3">
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "var(--cck-cream-deep)" }}
      >
        <Icon size={18} color="var(--cck-navy)" strokeWidth={1.8} />
      </div>
      <div>
        <div className="cck-eyebrow">{title}</div>
        <p className="mt-1" style={{ color: "var(--cck-navy)", fontFamily: "var(--font-body)" }}>
          {body}
        </p>
      </div>
    </div>
  );
}
