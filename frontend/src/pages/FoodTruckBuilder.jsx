import React, { useState } from "react";
import { Storage } from "@/services/storage";
import { Api } from "@/services/api";
import OrnamentDivider from "@/components/OrnamentDivider";
import { CaptainCard } from "@/components/CaptainCulinary";
import PlateFoodTruck from "@/components/teaching-plates/PlateFoodTruck";
import { Truck, Save } from "lucide-react";
import { toast } from "sonner";

const FIELDS = [
  { key: "truckName", label: "Food Truck Name", placeholder: "e.g. Captain's Corner" },
  { key: "foodIdea", label: "Food Idea", placeholder: "One thing you'll do really well" },
  { key: "menu1", label: "Menu Item 1", placeholder: "Signature dish" },
  { key: "menu2", label: "Menu Item 2", placeholder: "Side or sandwich" },
  { key: "menu3", label: "Menu Item 3", placeholder: "Drink, snack, or dessert" },
  { key: "targetCustomer", label: "Target Customer", placeholder: "Who will love this?" },
  { key: "brandStyle", label: "Brand Colors / Style", placeholder: "Warm cream + coral" },
  { key: "safetyNote", label: "Safety Note", placeholder: "Hand-wash station, food temps..." },
  { key: "costThought", label: "Simple Cost Thought", placeholder: "Roughly how priced?" },
  { key: "serviceMission", label: "Service Mission", placeholder: "Who in your community will this serve?" },
];

export default function FoodTruckBuilder() {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(null);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async () => {
    Storage.saveFoodTruck(form);
    Storage.awardBadge("food-truck-rookie");
    Api.saveFoodTruck(form);
    Api.syncProgress();
    setSaved(form);
    toast.success("Food Truck Concept saved · Badge: Food Truck Rookie");
  };

  return (
    <div className="cck-page" data-testid="food-truck-builder-page">
      <div className="cck-eyebrow">Launch Path</div>
      <h1
        className="cck-h1 mt-1"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}
        data-testid="ft-title"
      >
        Food Truck Concept Builder
      </h1>

      <div className="mt-5">
        <CaptainCard
          title="Captain Culinary"
          body="A great truck does one thing very well, serves a real community, and stays calm under pressure. Build the concept first — the rest follows."
        />
      </div>

      <OrnamentDivider>Reference Plate</OrnamentDivider>
      <PlateFoodTruck />

      <OrnamentDivider>Your Concept</OrnamentDivider>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} data-testid={`ft-field-${f.key}`}>
            <label className="cck-eyebrow" style={{ color: "var(--cck-coral-deep)" }}>
              {f.label}
            </label>
            <input
              className="cck-input mt-1.5"
              placeholder={f.placeholder}
              value={form[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              data-testid={`ft-input-${f.key}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          className="cck-btn-primary inline-flex items-center gap-2"
          data-testid="ft-save-btn"
        >
          <Save size={16} /> Save Concept
        </button>
      </div>

      {saved && (
        <div className="mt-8 cck-card p-6 cck-anim-fade-up" data-testid="ft-concept-card">
          <div className="cck-ornament" style={{ color: "var(--cck-coral-deep)" }}>
            <span>Food Truck Concept Card</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Truck size={26} color="var(--cck-coral-deep)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
              {saved.truckName || "Untitled Truck"}
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
