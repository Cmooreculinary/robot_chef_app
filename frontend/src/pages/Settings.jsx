import React, { useState } from "react";
import { Storage } from "@/services/storage";
import { Api } from "@/services/api";
import OrnamentDivider from "@/components/OrnamentDivider";
import { Switch } from "@/components/ui/switch";
import { CaptainCulinary } from "@/components/CaptainCulinary";
import { AGE_PATHS } from "@/data/lessons";
import { Volume2, Type, ShieldCheck, RotateCcw, Info } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [state, setState] = useState(Storage.getState());
  const [confirmReset, setConfirmReset] = useState(false);

  const updateAge = (id) => {
    Storage.setAgeGroup(id);
    setState(Storage.getState());
    toast.success("Age path updated");
  };
  const toggle = (key) => {
    const next = Storage.updateSettings({ [key]: !state.settings[key] });
    setState(next);
    Api.syncProgress();
  };
  const setTextSize = (size) => {
    const next = Storage.updateSettings({ textSize: size });
    setState(next);
  };
  const reset = () => {
    Storage.resetProgress();
    setState(Storage.getState());
    setConfirmReset(false);
    Api.syncProgress();
    toast.success("Progress reset");
  };

  return (
    <div className="cck-page" data-testid="settings-page">
      <div className="cck-eyebrow">Settings</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
        data-testid="settings-title"
      >
        Your Kitchen, Your Way
      </h1>

      <OrnamentDivider>Age Path</OrnamentDivider>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="settings-age-group">
        {AGE_PATHS.filter((p) => p.id !== "parent").map((p) => (
          <button
            key={p.id}
            onClick={() => updateAge(p.id)}
            className="cck-card p-3 text-center"
            style={{
              borderColor: state.ageGroup === p.id ? "var(--cck-teal)" : "var(--cck-paper-line-soft)",
              background: state.ageGroup === p.id ? "rgba(28,124,125,0.08)" : "rgba(255,255,255,0.5)",
            }}
            data-testid={`settings-age-${p.id}`}
          >
            <div className="cck-eyebrow">{p.ageLabel}</div>
            <div className="mt-1 text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {p.title.replace(" Path", "")}
            </div>
          </button>
        ))}
      </div>

      <OrnamentDivider>Preferences</OrnamentDivider>

      <Row icon={Volume2} label="Sound" hint="Tones and confirmations">
        <Switch
          checked={state.settings.soundOn}
          onCheckedChange={() => toggle("soundOn")}
          data-testid="settings-sound-switch"
        />
      </Row>

      <Row icon={Type} label="Text Size" hint="Larger text for younger eyes">
        <div className="flex gap-2">
          <SizeBtn label="Regular" active={state.settings.textSize === "regular"} onClick={() => setTextSize("regular")} testId="settings-text-regular" />
          <SizeBtn label="Large" active={state.settings.textSize === "large"} onClick={() => setTextSize("large")} testId="settings-text-large" />
        </div>
      </Row>

      <Row icon={ShieldCheck} label="Parent Safety Reminders" hint="Show 'ask an adult' notes during lessons">
        <Switch
          checked={state.settings.parentReminders}
          onCheckedChange={() => toggle("parentReminders")}
          data-testid="settings-reminders-switch"
        />
      </Row>

      <OrnamentDivider>Progress</OrnamentDivider>

      <div className="cck-card p-5" data-testid="settings-reset-card">
        <div className="flex items-start gap-3">
          <RotateCcw size={20} color="var(--cck-coral-deep)" />
          <div className="flex-1">
            <div
              className="font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
            >
              Reset Progress
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
              Clears completed lessons, badges, and challenges. Settings stay.
            </p>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="cck-btn-ghost mt-3 text-sm"
                data-testid="settings-reset-btn"
              >
                Reset...
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={reset}
                  className="cck-btn-coral text-sm"
                  data-testid="settings-reset-confirm-btn"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="cck-btn-ghost text-sm"
                  data-testid="settings-reset-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrnamentDivider>About</OrnamentDivider>

      <div className="cck-card p-5 flex items-start gap-3" data-testid="settings-about">
        <Info size={20} color="var(--cck-teal-deep)" />
        <div>
          <div
            className="font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
          >
            Captain Culinary Kids · v1.0.0
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--cck-navy-soft)" }}>
            Buy once. Learn for life. One app, three age paths, years of food
            skills. A phone app families can own, revisit, and grow with.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <CaptainCulinary size="md" />
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, hint, children }) {
  return (
    <div className="cck-card p-5 flex items-center gap-4 mb-3">
      <div
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "var(--cck-cream-deep)" }}
      >
        <Icon size={20} color="var(--cck-navy)" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--cck-navy)" }}
        >
          {label}
        </div>
        <div className="text-xs" style={{ color: "var(--cck-navy-soft)" }}>
          {hint}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SizeBtn({ label, active, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        fontFamily: "var(--font-ui)",
        background: active ? "var(--cck-navy)" : "var(--cck-cream-deep)",
        color: active ? "var(--cck-cream)" : "var(--cck-navy)",
        border: `1px solid ${active ? "var(--cck-navy)" : "var(--cck-paper-line)"}`,
      }}
    >
      {label}
    </button>
  );
}
