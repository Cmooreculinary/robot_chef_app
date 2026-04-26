import React, { useState } from "react";
import { Storage } from "@/services/storage";
import { Api } from "@/services/api";
import OrnamentDivider from "@/components/OrnamentDivider";
import { CaptainCard } from "@/components/CaptainCulinary";
import PlateRestaurant from "@/components/teaching-plates/PlateRestaurant";
import { Store, Save } from "lucide-react";
import { toast } from "sonner";

const FIELDS = [
  { key: "restaurantName", label: "Restaurant Name", placeholder: "e.g. Hearth & Table" },
  { key: "concept", label: "Concept", placeholder: "One sentence — what is this?" },
  { key: "hospitalityPromise", label: "Hospitality Promise", placeholder: "How will guests feel here?" },
  { key: "menuIdea1", label: "Menu Idea 1", placeholder: "Signature dish" },
  { key: "menuIdea2", label: "Menu Idea 2", placeholder: "Comfort dish" },
  { key: "menuIdea3", label: "Menu Idea 3", placeholder: "Sharing dish" },
  { key: "teamRoles", label: "Team Roles", placeholder: "Who does what?" },
  { key: "cleanlinessPlan", label: "Cleanliness Plan", placeholder: "Clean-as-you-go habits" },
  { key: "guestExperience", label: "Guest Experience", placeholder: "First minute · last minute" },
  { key: "communityPurpose", label: "Community Purpose", placeholder: "Whose need are you serving?" },
];

export default function RestaurantBuilder() {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(null);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async () => {
    Storage.saveRestaurant(form);
    Storage.awardBadge("restaurant-builder");
    Api.saveRestaurant(form);
    Api.syncProgress();
    setSaved(form);
    toast.success("Restaurant Concept saved · Badge: Restaurant Builder");
  };

  return (
    <div className="cck-page" data-testid="restaurant-builder-page">
      <div className="cck-eyebrow">Launch Path</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
        data-testid="rb-title"
      >
        Restaurant Concept Builder
      </h1>

      <div className="mt-5">
        <CaptainCard
          title="Captain Culinary"
          body="Hospitality is one of the oldest virtues. Build a concept that welcomes someone real, serves something specific, and runs clean."
        />
      </div>

      <OrnamentDivider>Reference Plate</OrnamentDivider>
      <PlateRestaurant />

      <OrnamentDivider>Your Concept</OrnamentDivider>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} data-testid={`rb-field-${f.key}`}>
            <label className="cck-eyebrow">{f.label}</label>
            <input
              className="cck-input mt-1.5"
              placeholder={f.placeholder}
              value={form[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              data-testid={`rb-input-${f.key}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          className="cck-btn-primary inline-flex items-center gap-2"
          data-testid="rb-save-btn"
        >
          <Save size={16} /> Save Concept
        </button>
      </div>

      {saved && (
        <div className="mt-8 cck-card p-6 cck-anim-fade-up" data-testid="rb-concept-card">
          <div className="cck-ornament">
            <span>Restaurant Concept Card</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Store size={26} color="var(--cck-navy)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
              {saved.restaurantName || "Untitled Restaurant"}
            </h3>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {FIELDS.slice(1).map((f) => (
              <div key={f.key}>
                <div className="cck-eyebrow">{f.label}</div>
                <div className="mt-1" style={{ color: "var(--cck-navy)", fontFamily: "var(--font-body)" }}>
                  {saved[f.key] || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
