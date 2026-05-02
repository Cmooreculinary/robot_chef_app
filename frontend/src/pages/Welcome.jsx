import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Droplets,
  ChefHat,
  Apple,
  Users,
  Globe2,
  HeartHandshake,
  Trophy,
  Clock,
  Pause,
  ThermometerSun,
  Radio,
  Smartphone,
  Printer,
  Presentation,
  UserRound,
  BookOpen,
  Heart,
  ShieldAlert,
  Building2,
  GraduationCap,
  Sun,
  Library,
  Sprout,
  HandHeart,
  ArrowRight,
  ArrowDown,
  Mail,
  Compass,
  Eye,
  Layers,
} from "lucide-react";
import { CaptainCulinary } from "@/components/CaptainCulinary";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_captain-culinary/artifacts/kfounkjt_LOGO%21.png";

const NAV_ITEMS = [
  { id: "mission", label: "Mission" },
  { id: "how", label: "How It Works" },
  { id: "pillars", label: "Pillars" },
  { id: "live-mode", label: "Live Mode" },
  { id: "ministry", label: "Ministry Layer" },
  { id: "use-cases", label: "Use Cases" },
];

export default function Welcome() {
  const nav = useNavigate();

  // smooth scroll for in-page anchor clicks
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="cck-landing" data-testid="welcome-page">
      <TopNav onJump={scrollTo} onPreview={() => nav("/age")} />

      <Hero onExplore={() => nav("/age")} onHow={() => scrollTo("how")} />

      <ProblemSection />
      <SolutionSection />
      <HybridArchitecture />
      <PillarsSection />
      <LiveLessonMode />
      <MinistryLayer />
      <UseCasesSection />
      <NotClaiming />
      <FinalCTA onPreview={() => nav("/age")} />
      <Footer onPreview={() => nav("/age")} onParent={() => nav("/parent")} />
    </div>
  );
}

/* ============================================================
   Top sticky nav
   ============================================================ */
function TopNav({ onJump, onPreview }) {
  return (
    <header className="cck-topnav" data-testid="landing-topnav">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2"
          data-testid="topnav-brand"
        >
          <img src={LOGO_URL} alt="" className="w-8 h-8 object-contain" style={{ mixBlendMode: "multiply" }} />
          <span
            className="cck-display text-[11px] sm:text-xs"
            style={{ color: "var(--cck-navy)" }}
          >
            Captain · Culinary · Kids
          </span>
        </button>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((it) => (
            <button
              key={it.id}
              onClick={() => onJump(it.id)}
              className="cck-topnav-link"
              data-testid={`topnav-${it.id}`}
            >
              {it.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onPreview}
          className="cck-btn-primary text-xs sm:text-sm"
          style={{ padding: "0.55rem 1.05rem" }}
          data-testid="topnav-preview-btn"
        >
          Preview the Model
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   Hero
   ============================================================ */
function Hero({ onExplore, onHow }) {
  return (
    <section
      className="cck-section cck-section-warm"
      style={{ paddingTop: "3.5rem" }}
      data-testid="hero-section"
      id="mission"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
          {/* Logo / brand */}
          <div className="flex justify-center lg:justify-start cck-anim-fade-up" style={{ isolation: "isolate" }}>
            <img
              src={LOGO_URL}
              alt="Captain Culinary Kids — Cooking · Compassion · Community"
              className="cck-anim-float w-[78vw] sm:w-[440px] lg:w-[520px] max-w-full h-auto select-none"
              style={{
                filter: "drop-shadow(0 22px 44px rgba(16,42,67,0.18))",
                mixBlendMode: "multiply",
              }}
              draggable={false}
              data-testid="welcome-logo-image"
            />
          </div>

          {/* Headline + CTAs */}
          <div className="text-center lg:text-left cck-anim-fade-up">
            <div className="cck-section-eyebrow" data-testid="welcome-eyebrow">
              <Compass size={12} /> Learn · Cook · Serve
            </div>
            <h1 className="cck-section-headline mt-5" data-testid="welcome-app-name">
              Captain Culinary Kids
            </h1>
            <div
              className="cck-display mt-3"
              style={{
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                color: "var(--cck-coral-deep)",
                letterSpacing: "0.32em",
              }}
              data-testid="welcome-tagline"
            >
              L E A R N · C O O K · S E R V E
            </div>
            <p
              className="cck-section-lead mt-6 max-w-2xl mx-auto lg:mx-0"
              data-testid="welcome-copy"
            >
              A guided food-skills learning platform helping children build
              confidence, safety, nourishment habits, and practical life skills
              through joyful, structured lessons.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center lg:items-stretch lg:justify-start justify-center gap-3">
              <button
                onClick={onExplore}
                className="cck-btn-primary inline-flex items-center justify-center gap-2"
                data-testid="welcome-start-mission-btn"
              >
                Explore the Mission <ArrowRight size={16} />
              </button>
              <button
                onClick={onHow}
                className="cck-btn-ghost inline-flex items-center justify-center gap-2"
                data-testid="welcome-how-it-works-btn"
              >
                See How It Works <ArrowDown size={16} />
              </button>
            </div>
            <div
              className="mt-7 cck-eyebrow"
              style={{ color: "var(--cck-navy-soft)" }}
              data-testid="welcome-purchase-line"
            >
              Built for Families · Schools · Churches · Ministries
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Problem
   ============================================================ */
function ProblemSection() {
  return (
    <section className="cck-section cck-section-band" data-testid="problem-section">
      <div className="cck-section-inner cck-anchor">
        <div className="max-w-3xl mx-auto text-center">
          <div className="cck-section-eyebrow cck-section-eyebrow-coral">
            <ShieldAlert size={12} /> The Need
          </div>
          <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
            Many children grow up without practical food education.
          </h2>
          <p className="cck-section-lead mt-5">
            Many children around the world grow up with limited access to
            practical food education, basic kitchen confidence, sanitation
            habits, and nourishing meal skills. Families, schools, churches, and
            ministries often want to help, but need a simple, safe, structured
            way to teach these everyday skills.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Solution
   ============================================================ */
function SolutionSection() {
  return (
    <section
      id="how"
      className="cck-section cck-section-teal"
      data-testid="solution-section"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="cck-card p-6 sm:p-8 max-w-md w-full" style={{ background: "rgba(255,255,255,0.85)" }}>
              <div className="flex items-start gap-4">
                <CaptainCulinary size="md" />
                <div>
                  <div className="cck-eyebrow" style={{ color: "var(--cck-teal-deep)" }}>
                    Captain Culinary · Mentor
                  </div>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}
                  >
                    "Today, we'll start with clean hands, a clear counter, and a
                    safe tool. Small habits build calm kitchens — and calm
                    kitchens build great chefs."
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="cck-tag cck-tag-teal">Age-aware</span>
                    <span className="cck-tag cck-tag-coral">Structured</span>
                    <span className="cck-tag cck-tag-gold">Repeatable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="cck-section-eyebrow">
              <Compass size={12} /> The Solution
            </div>
            <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
              A guided, age-aware learning experience.
            </h2>
            <p className="cck-section-lead mt-5">
              Captain Culinary Kids gives children a guided, age-aware learning
              experience where Captain Culinary teaches practical food safety,
              prep basics, sanitation, simple meals, cultural food awareness, and
              service-minded cooking. The platform supports families,
              classrooms, churches, and ministry partners with repeatable lessons
              that are warm, safe, and easy to follow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Core learning pillars
   ============================================================ */
const PILLARS = [
  { icon: ShieldCheck, color: "var(--cck-teal-deep)", title: "Food Safety", body: "Hand washing, no-touch zones, allergy awareness — the habits every chef begins with." },
  { icon: Droplets, color: "var(--cck-teal)", title: "Sanitation", body: "Clear counters, clean tools, safe surfaces. Small habits, daily practice." },
  { icon: ChefHat, color: "var(--cck-coral-deep)", title: "Knife & Prep Basics", body: "Bear-claw, stable boards, slice → plank → baton → dice. Calm hands first." },
  { icon: Apple, color: "var(--cck-gold-deep)", title: "Nourishing Meals", body: "Color, balance, variety. Snack plates and simple meals that fuel a child's day." },
  { icon: Users, color: "var(--cck-navy)", title: "Family Cooking", body: "Lessons designed to bring children to the table beside a trusted adult." },
  { icon: Globe2, color: "var(--cck-teal-deep)", title: "Global Food Awareness", body: "Curiosity over comparison — respectful learning across cuisines and cultures." },
  { icon: HeartHandshake, color: "var(--cck-coral)", title: "Service & Community", body: "Cooking as care — feeding neighbors, classmates, congregations, and family." },
  { icon: Trophy, color: "var(--cck-gold-deep)", title: "Confidence Through Practice", body: "Repeatable lessons and small wins that grow a child's quiet competence." },
];

function PillarsSection() {
  return (
    <section
      id="pillars"
      className="cck-section cck-section-band"
      data-testid="pillars-section"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="max-w-2xl mx-auto text-center">
          <div className="cck-section-eyebrow cck-section-eyebrow-gold">
            <BookOpen size={12} /> Core Learning Pillars
          </div>
          <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
            Eight foundations every young chef builds.
          </h2>
          <p className="cck-section-lead mt-4">
            Each pillar is taught through structured lessons, illustrated teaching
            plates, age-aware narration, and family-safe practice prompts.
          </p>
        </div>
        <div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 cck-stagger"
          data-testid="pillars-grid"
        >
          {PILLARS.map((p) => (
            <div key={p.title} className="cck-pillar cck-anim-fade-up" data-testid={`pillar-${p.title.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="cck-pillar-icon">
                <p.icon size={24} color={p.color} strokeWidth={1.7} />
              </div>
              <h3
                className="mt-4"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: "var(--cck-navy)" }}
              >
                {p.title}
              </h3>
              <p
                className="mt-1.5 text-[14px] leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Live Lesson Mode
   ============================================================ */
function LiveLessonMode() {
  return (
    <section
      id="live-mode"
      className="cck-section cck-section-warm"
      data-testid="live-mode-section"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="cck-section-eyebrow">
              <Clock size={12} /> Live Lesson Mode
            </div>
            <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
              30 minutes on. 15 minutes to reset.
            </h2>
            <p className="cck-section-lead mt-5">
              Lessons are designed to stay under thirty minutes. After each
              lesson, a fifteen-minute cooldown gives children time to clean up,
              reset, and prepare for the next activity. During cooldown, live
              audio, visual, and coaching features pause.
            </p>
            <p className="cck-section-lead mt-3" style={{ fontSize: "1rem" }}>
              This is a safety-conscious design principle — protecting device
              performance, reducing heat, and respecting the natural rhythm of
              how children learn.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div
              className="cck-card p-6 sm:p-8"
              style={{ background: "rgba(255,255,255,0.85)" }}
              data-testid="live-mode-diagram"
            >
              <div className="grid grid-cols-3 gap-3">
                <CycleStep icon={ChefHat} title="Lesson" caption="≤ 30 min" tone="teal" active />
                <CycleStep icon={Pause} title="Cooldown" caption="15 min" tone="gold" />
                <CycleStep icon={Sprout} title="Next Up" caption="Ready" tone="coral" />
              </div>
              <div className="mt-5 h-2 rounded-full overflow-hidden" style={{ background: "var(--cck-cream-deep)" }}>
                <div
                  className="h-full"
                  style={{
                    width: "66%",
                    background: "linear-gradient(90deg, var(--cck-teal) 0%, var(--cck-gold) 100%)",
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Pill icon={ThermometerSun} label="Reduces device heat" />
                <Pill icon={Pause} label="Audio + camera pause" />
                <Pill icon={Sun} label="Reset & cleanup" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CycleStep({ icon: Icon, title, caption, tone, active }) {
  const tones = {
    teal: { color: "var(--cck-teal-deep)", bg: "rgba(28,124,125,0.10)" },
    gold: { color: "var(--cck-gold-deep)", bg: "rgba(242,184,75,0.18)" },
    coral: { color: "var(--cck-coral-deep)", bg: "rgba(242,106,91,0.10)" },
  }[tone];
  return (
    <div
      className="rounded-2xl p-4 text-center border"
      style={{
        borderColor: active ? tones.color : "var(--cck-paper-line-soft)",
        background: tones.bg,
      }}
    >
      <div
        className="mx-auto w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "var(--cck-cream)", border: `1px solid ${tones.color}` }}
      >
        <Icon size={20} color={tones.color} strokeWidth={1.8} />
      </div>
      <div className="cck-plate-label mt-2">{title}</div>
      <div className="text-xs mt-1" style={{ color: tones.color, fontFamily: "var(--font-ui)", fontWeight: 600 }}>
        {caption}
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label }) {
  return (
    <div
      className="rounded-full px-3 py-1.5 inline-flex items-center gap-2 text-xs"
      style={{
        fontFamily: "var(--font-ui)",
        background: "var(--cck-cream)",
        border: "1px solid var(--cck-paper-line-soft)",
        color: "var(--cck-navy-soft)",
      }}
    >
      <Icon size={14} color="var(--cck-teal-deep)" /> {label}
    </div>
  );
}

/* ============================================================
   Three teaching modes
   ============================================================ */
function HybridArchitecture() {
  return (
    <section
      id="teaching-modes"
      className="cck-section"
      data-testid="teaching-modes-section"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="max-w-2xl mx-auto text-center">
          <div className="cck-section-eyebrow cck-section-eyebrow-navy">
            <Layers size={12} /> Three Teaching Modes
          </div>
          <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
            Captain Culinary teaches in three styles.
          </h2>
          <p className="cck-section-lead mt-4">
            One mentor · one curriculum · three ways to reach a child — wherever
            they learn.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 cck-stagger" data-testid="teaching-modes-grid">
          <ModeCard
            number="01"
            icon={Radio}
            tone="coral"
            title="Fully Live Interactive"
            tag="Internet · Camera · Voice"
            body="Cap teaches in real time — listening, seeing, and responding within CCK guardrails. For homes and classrooms with strong internet."
            testId="mode-live"
          />
          <ModeCard
            number="02"
            icon={Smartphone}
            tone="teal"
            title="Cap's Local Platform"
            tag="On-device · Narrated · Not interactive"
            body="Cap has every lesson onboard. He talks the class through each teaching plate — no internet needed. One-way narration, always ready."
            testId="mode-local"
          />
          <ModeCard
            number="03"
            icon={Printer}
            tone="gold"
            title="Printed Presentation"
            tag="Paper · Classroom · Teacher-led"
            body="The full teaching module is printable. A teacher walks the class through each plate as a presentation — no devices required."
            testId="mode-printed"
          />
        </div>

        <div
          className="mt-8 cck-card p-5 sm:p-6 max-w-3xl mx-auto"
          style={{ background: "rgba(255,255,255,0.75)" }}
          data-testid="delivery-formats"
        >
          <div className="cck-eyebrow text-center">Delivered Through</div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DeliveryPill icon={GraduationCap} label="Through the teacher" testId="delivery-teacher" />
            <DeliveryPill icon={UserRound} label="Individually" testId="delivery-individual" />
            <DeliveryPill icon={Users} label="As a group" testId="delivery-group" />
          </div>
          <p
            className="mt-5 text-sm text-center"
            style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-body)" }}
          >
            <strong style={{ color: "var(--cck-navy)" }}>Mix and match.</strong>{" "}
            Partners can offer any combination of the three modes to fit their
            program, their classroom, and their bandwidth.
          </p>
        </div>
      </div>
    </section>
  );
}

function ModeCard({ number, icon: Icon, tone, title, tag, body, testId }) {
  const tones = {
    teal: { color: "var(--cck-teal-deep)", ring: "rgba(28,124,125,0.25)", bg: "rgba(28,124,125,0.06)" },
    gold: { color: "var(--cck-gold-deep)", ring: "rgba(242,184,75,0.35)", bg: "rgba(242,184,75,0.09)" },
    coral: { color: "var(--cck-coral-deep)", ring: "rgba(242,106,91,0.30)", bg: "rgba(242,106,91,0.06)" },
  }[tone];
  return (
    <div
      className="cck-pillar cck-anim-fade-up relative"
      style={{ background: tones.bg, borderColor: tones.ring }}
      data-testid={testId}
    >
      <div
        className="absolute top-4 right-5 font-bold"
        style={{
          fontFamily: "var(--font-plate)",
          fontSize: "1.25rem",
          letterSpacing: "0.1em",
          color: tones.color,
          opacity: 0.7,
        }}
      >
        {number}
      </div>
      <div className="cck-pillar-icon" style={{ background: "var(--cck-cream)" }}>
        <Icon size={24} color={tones.color} strokeWidth={1.7} />
      </div>
      <div
        className="mt-4 cck-eyebrow"
        style={{ color: tones.color, fontSize: "0.62rem" }}
      >
        {tag}
      </div>
      <h3 className="mt-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: "var(--cck-navy)" }}>
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}>
        {body}
      </p>
    </div>
  );
}

function DeliveryPill({ icon: Icon, label, testId }) {
  return (
    <div
      className="rounded-xl px-4 py-3 inline-flex items-center justify-center gap-2"
      style={{
        background: "var(--cck-cream)",
        border: "1px solid var(--cck-paper-line)",
        fontFamily: "var(--font-ui)",
        fontWeight: 600,
        color: "var(--cck-navy)",
        fontSize: "0.875rem",
      }}
      data-testid={testId}
    >
      <Icon size={16} color="var(--cck-teal-deep)" strokeWidth={1.8} />
      {label}
    </div>
  );
}

/* ============================================================
   Christian voice / devotional safety layer
   ============================================================ */
function MinistryLayer() {
  return (
    <section
      id="ministry"
      className="cck-section cck-section-band"
      data-testid="ministry-section"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="cck-section-eyebrow cck-section-eyebrow-gold">
              <Heart size={12} /> Optional · For Ministry Partners
            </div>
            <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
              A separate, reviewed devotional safety layer.
            </h2>
            <p className="cck-section-lead mt-5">
              For ministry partners, Captain Culinary Kids can support a
              Christian voice layer. This is not a tone setting. It is a separate
              content and safety layer with its own approved devotional corpus,
              retrieval boundaries, and ministry-partner review.
            </p>
          </div>

          <div
            className="mt-8 cck-card p-6 sm:p-8"
            style={{
              background: "rgba(255,255,255,0.85)",
              borderColor: "var(--cck-gold)",
              boxShadow: "0 14px 30px -16px rgba(242, 184, 75, 0.45)",
            }}
            data-testid="ministry-card"
          >
            <div className="flex items-start gap-4">
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(242,184,75,0.18)", border: "1px solid var(--cck-gold-deep)" }}
              >
                <BookOpen size={22} color="var(--cck-gold-deep)" strokeWidth={1.7} />
              </div>
              <div>
                <div className="cck-eyebrow" style={{ color: "var(--cck-gold-deep)" }}>
                  Sensitive Child Faith Moments
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}>
                  Sensitive moments — grief, prayer, fear, loss, or spiritual
                  distress — must route only through approved devotional content
                  and never through open internet responses. Boundaries are
                  reviewed with each ministry partner before deployment.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Pill icon={ShieldCheck} label="Approved corpus only" />
                  <Pill icon={BookOpen} label="Retrieval boundaries" />
                  <Pill icon={Users} label="Partner review process" />
                  <Pill icon={Heart} label="Optional, never default" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Global use cases
   ============================================================ */
const USE_CASES = [
  { icon: Heart, title: "Family Kitchen", body: "A guided learning companion families use at home, beside a trusted adult." },
  { icon: Building2, title: "Church Children's Ministry", body: "Repeatable, age-aware lessons children's ministry leaders can plug into Sunday or midweek." },
  { icon: BookOpen, title: "AWANA-style Programming", body: "Designed to fit weekly, badge-driven children's programs alongside existing curricula." },
  { icon: HandHeart, title: "Mission & Feeding Partners", body: "Practical food-skills support for partners already serving children and families." },
  { icon: Sun, title: "Rural Classroom", body: "Built to work where bandwidth is limited — offline-first lesson cores keep teaching going." },
  { icon: GraduationCap, title: "Homeschool Co-op", body: "Structured, printable plates and quizzes that fit easily into co-op rotations." },
  { icon: Sprout, title: "After-School Program", body: "Calm, contained 30-minute lessons with built-in cooldown — friendly to staff schedules." },
  { icon: Library, title: "Public School Life-Skills", body: "Practical food, safety, and life-skills enrichment that respects classroom standards." },
];

function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="cck-section"
      data-testid="use-cases-section"
    >
      <div className="cck-section-inner cck-anchor">
        <div className="max-w-2xl mx-auto text-center">
          <div className="cck-section-eyebrow cck-section-eyebrow-coral">
            <Globe2 size={12} /> Where It Works
          </div>
          <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
            One platform. Many tables.
          </h2>
          <p className="cck-section-lead mt-4">
            Built to support trusted adults — wherever children show up to learn.
          </p>
        </div>
        <div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 cck-stagger"
          data-testid="use-cases-grid"
        >
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="cck-pillar cck-anim-fade-up"
              data-testid={`usecase-${u.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
            >
              <div className="cck-pillar-icon">
                <u.icon size={22} color="var(--cck-teal-deep)" strokeWidth={1.7} />
              </div>
              <h3 className="mt-4" style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--cck-navy)" }}>
                {u.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}>
                {u.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   What we are not claiming
   ============================================================ */
function NotClaiming() {
  return (
    <section className="cck-section cck-section-band" data-testid="not-claiming-section">
      <div className="cck-section-inner cck-anchor">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="cck-section-eyebrow cck-section-eyebrow-navy">
              <Eye size={12} /> Honest Scope
            </div>
            <h2 className="cck-section-headline mt-5" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)" }}>
              What we are <em style={{ fontStyle: "italic", color: "var(--cck-coral-deep)" }}>not</em> claiming.
            </h2>
          </div>
          <div
            className="mt-7 cck-card p-6 sm:p-8"
            style={{ background: "rgba(255,255,255,0.85)" }}
            data-testid="not-claiming-card"
          >
            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}>
              Captain Culinary Kids does <strong>not</strong> claim to be the
              answer to world hunger. It does <strong>not</strong> claim that
              technology replaces parents, teachers, pastors, churches, or
              feeding ministries.
            </p>
            <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy)" }}>
              It is designed as a practical support tool — helping trusted
              adults teach children food skills, safety, confidence, and service
              through structured lessons.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Final CTA
   ============================================================ */
function FinalCTA({ onPreview }) {
  return (
    <section className="cck-section" data-testid="final-cta-section">
      <div className="cck-section-inner cck-anchor">
        <div className="cck-final-cta p-8 sm:p-12 lg:p-16 text-center">
          <div className="relative z-10">
            <div
              className="cck-display"
              style={{
                color: "rgba(255,247,234,0.75)",
                fontSize: "0.7rem",
                letterSpacing: "0.4em",
              }}
            >
              · Built To Help ·
            </div>
            <h2
              className="mt-4 mx-auto max-w-3xl"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
                lineHeight: 1.1,
                color: "var(--cck-cream)",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Built to help children learn, cook, and serve — one safe lesson at a time.
            </h2>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="mailto:partners@captainculinarykids.example"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold"
                style={{
                  background: "var(--cck-gold)",
                  color: "var(--cck-navy)",
                  fontFamily: "var(--font-ui)",
                  boxShadow: "0 14px 30px -10px rgba(242,184,75,0.6)",
                }}
                data-testid="cta-partner-btn"
              >
                <Mail size={16} /> Partner With Us
              </a>
              <button
                onClick={onPreview}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(255,247,234,0.8)",
                  color: "var(--cck-cream)",
                  fontFamily: "var(--font-ui)",
                }}
                data-testid="cta-preview-btn"
              >
                Preview the Learning Model <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Footer
   ============================================================ */
function Footer({ onPreview, onParent }) {
  return (
    <footer className="cck-footer" data-testid="landing-footer">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="w-9 h-9 object-contain" style={{ mixBlendMode: "multiply" }} />
            <span className="cck-display text-xs" style={{ color: "var(--cck-navy)" }}>
              Captain · Culinary · Kids
            </span>
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-body)" }}>
            Learn · Cook · Serve. A guided food-skills learning platform for
            families, schools, churches, and ministries.
          </p>
        </div>
        <FooterCol
          title="Product"
          items={[
            { label: "Preview the Model", onClick: onPreview, testId: "footer-preview" },
            { label: "Lessons", href: "/lessons", testId: "footer-lessons" },
            { label: "Live Mode", to: "live-mode", testId: "footer-live-mode" },
            { label: "Pillars", to: "pillars", testId: "footer-pillars" },
          ]}
        />
        <FooterCol
          title="Partners"
          items={[
            { label: "For Parents · Teachers", onClick: onParent, testId: "footer-parent" },
            { label: "Ministry Layer", to: "ministry", testId: "footer-ministry" },
            { label: "Use Cases", to: "use-cases", testId: "footer-use-cases" },
            { label: "Three Teaching Modes", to: "teaching-modes", testId: "footer-teaching-modes" },
          ]}
        />
        <FooterCol
          title="Coming Next"
          items={[
            { label: "Live Mode Test · adult", href: "/live-test", testId: "footer-live-test" },
            { label: "Lessons hub", testId: "footer-coming-lessons" },
            { label: "Partners portal", testId: "footer-coming-partners" },
            { label: "Safety guide", testId: "footer-coming-safety" },
          ]}
        />
      </div>
      <div
        className="text-center text-xs py-5 border-t"
        style={{
          borderColor: "var(--cck-paper-line-soft)",
          color: "var(--cck-navy-soft)",
          fontFamily: "var(--font-plate)",
          letterSpacing: "0.32em",
        }}
        data-testid="footer-copy"
      >
        © {new Date().getFullYear()} · CAPTAIN · CULINARY · KIDS · LEARN · COOK · SERVE
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="cck-eyebrow">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            {it.onClick ? (
              <button onClick={it.onClick} className="cck-topnav-link text-left" data-testid={it.testId}>
                {it.label}
              </button>
            ) : it.to ? (
              <button
                onClick={() => {
                  const el = document.getElementById(it.to);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="cck-topnav-link text-left"
                data-testid={it.testId}
              >
                {it.label}
              </button>
            ) : it.href ? (
              <a href={it.href} className="cck-topnav-link" data-testid={it.testId}>
                {it.label}
              </a>
            ) : (
              <span className="cck-topnav-link" style={{ opacity: 0.55 }} data-testid={it.testId}>
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
