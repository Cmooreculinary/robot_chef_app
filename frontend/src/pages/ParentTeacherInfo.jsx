import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, BookOpen, Users, Building2, Heart, GraduationCap, Sparkles } from "lucide-react";
import { CaptainCulinary } from "@/components/CaptainCulinary";
import OrnamentDivider from "@/components/OrnamentDivider";

const useCases = [
  { icon: Heart, title: "Family Use", body: "A phone app families can own, revisit, and grow with for years." },
  { icon: GraduationCap, title: "Homeschool", body: "Structured plates, quizzes, and badges that fit any curriculum." },
  { icon: Building2, title: "School / Classroom", body: "Print-quality plates, group quizzes, and discussion prompts." },
  { icon: Users, title: "Youth Group / Ministry", body: "Service-minded lessons with optional life and biblical connections." },
  { icon: Sparkles, title: "Children's Home / Community", body: "Safe, age-aware paths from junior chef to launch path." },
];

export default function ParentTeacherInfo() {
  const nav = useNavigate();
  return (
    <div className="cck-page" data-testid="parent-info-page">
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold mb-4"
        style={{ color: "var(--cck-navy-soft)" }}
        data-testid="parent-back-btn"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="text-center cck-anim-fade-up">
        <CaptainCulinary size="md" className="mx-auto" />
        <div className="cck-eyebrow mt-3">For Parents · Teachers · Mentors</div>
        <h1
          className="cck-h1 mt-1"
          style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
          data-testid="parent-title"
        >
          A premium classroom in your pocket.
        </h1>
        <p
          className="mt-3 max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
        >
          Captain Culinary Kids teaches through full-screen educational
          illustration plates. Each plate is designed for app learning, classroom
          display, and printable use. Captain Culinary narrates the lesson,
          answers questions, adds short life and biblical connections when
          appropriate, and checks whether the learner is ready to move on.
        </p>
      </div>

      <OrnamentDivider>What it teaches</OrnamentDivider>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBlock title="Three age paths" body="Junior Chef (7–12), Skill Builder (13–16), Launch Path (17–19) — each with age-appropriate tone, content, and supervision rules." />
        <InfoBlock title="Beautiful teaching plates" body="Vintage-inspired educational illustrations (Mirepoix, Knife Cuts, Snack Plate, Rice Around the World, Food Truck, Restaurant) — built to teach, display, and print." />
        <InfoBlock title="Safe by design" body="Adult supervision required for knives, heat, appliances, raw meat, and cleaning chemicals for younger learners. Allergy reminders are built in." />
        <InfoBlock title="Builders for older learners" body="Food Truck and Restaurant concept builders translate skills into community-minded entrepreneurship." />
        <InfoBlock title="Family missions" body="Cooking, serving, and family memory prompts — turning kitchen learning into shared time." />
        <InfoBlock title="Global food learning" body="Curiosity over comparison. Six respectful global food missions woven into the curriculum." />
      </div>

      <OrnamentDivider>Where it shines</OrnamentDivider>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 cck-stagger">
        {useCases.map((u) => (
          <div key={u.title} className="cck-card p-5 cck-anim-fade-up">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--cck-cream-deep)" }}
            >
              <u.icon size={20} color="var(--cck-teal-deep)" strokeWidth={1.8} />
            </div>
            <h3 className="mt-3" style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600 }}>
              {u.title}
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
              {u.body}
            </p>
          </div>
        ))}
      </div>

      <OrnamentDivider>Safety standard</OrnamentDivider>

      <div className="cck-card p-5" data-testid="safety-block">
        <div className="flex items-start gap-3">
          <ShieldCheck size={22} color="var(--cck-teal-deep)" />
          <div>
            <p className="text-sm" style={{ color: "var(--cck-navy)", fontFamily: "var(--font-body)" }}>
              <strong>This app is a guided learning companion and does not replace adult supervision.</strong>
              <br />
              Children should never use knives, heat, appliances, raw meat, or cleaning chemicals
              without a trusted adult. Captain Culinary Kids does not provide medical advice. If a
              user describes injury, fire, choking, or an allergic reaction, get an adult
              immediately and contact emergency help if needed.
            </p>
          </div>
        </div>
      </div>

      <OrnamentDivider>One-time purchase</OrnamentDivider>

      <div className="cck-card p-6 text-center" data-testid="purchase-block">
        <BookOpen size={26} color="var(--cck-coral-deep)" className="mx-auto" />
        <h3 className="mt-2" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
          Buy once. Learn for life.
        </h3>
        <p className="mt-2 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
          One app · three age paths · years of food skills. Core lessons are
          included with purchase. No subscription required for the core learning path.
        </p>
        <button
          onClick={() => nav("/age")}
          className="cck-btn-primary mt-5"
          data-testid="parent-start-btn"
        >
          Start a Path
        </button>
      </div>
    </div>
  );
}

function InfoBlock({ title, body }) {
  return (
    <div className="cck-card p-5">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600 }}>
        {title}
      </h3>
      <p className="mt-1.5 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
        {body}
      </p>
    </div>
  );
}
