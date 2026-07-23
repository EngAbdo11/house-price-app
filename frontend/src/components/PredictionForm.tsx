import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocations, predictPrice } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

// NOTE: these option lists must exactly match the string values your model
// was trained on (OneHotEncoder(handle_unknown="ignore") will silently treat
// anything else as unknown). Verify against df["Furnishing"].unique(),
// df["Transaction"].unique(), df["Ownership"].unique(), df["facing"].unique()
// in your notebook and adjust if they differ.
const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const TRANSACTION_OPTIONS = ["New Property", "Resale"];
const OWNERSHIP_OPTIONS = [
  "Freehold",
  "Leasehold",
  "Co-operative Society",
  "Power Of Attorney",
];
const FACING_OPTIONS = [
  "East",
  "North",
  "North - East",
  "North - West",
  "South",
  "South - East",
  "South - West",
  "West",
];

type FormState = {
  location: string;
  carpet_area_sqft: string;
  floor_num: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
};

const initialState: FormState = {
  location: "",
  carpet_area_sqft: "",
  floor_num: "",
  bathroom: "",
  balcony: "",
  furnishing: "",
  transaction: "",
  ownership: "",
  facing: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function PredictionForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [locations, setLocations] = useState<string[]>([]);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch((err: Error) => setLocationsError(err.message));
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!form.location) next.location = "Choose a location.";
    if (!form.furnishing) next.furnishing = "Choose a furnishing status.";
    if (!form.transaction) next.transaction = "Choose a transaction type.";
    if (!form.ownership) next.ownership = "Choose an ownership type.";
    if (!form.facing) next.facing = "Choose which way the property faces.";

    const area = Number(form.carpet_area_sqft);
    if (form.carpet_area_sqft === "" || Number.isNaN(area)) {
      next.carpet_area_sqft = "Enter the carpet area.";
    } else if (area <= 0) {
      next.carpet_area_sqft = "Carpet area must be greater than 0.";
    }

    for (const [key, label] of [
      ["floor_num", "floor number"],
      ["bathroom", "number of bathrooms"],
      ["balcony", "number of balconies"],
    ] as const) {
      const raw = form[key];
      if (raw === "") {
        next[key] = `Enter the ${label}.`;
        continue;
      }
      const value = Number(raw);
      if (Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
        next[key] = `Enter a valid ${label} (0 or more).`;
      }
    }

    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpet_area_sqft),
      floor_num: Number(form.floor_num),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony),
      furnishing: form.furnishing,
      transaction: form.transaction,
      ownership: form.ownership,
      facing: form.facing,
    };

    setSubmitting(true);
    try {
      const result = await predictPrice(payload);
      navigate("/result", { state: { price: result.predicted_price } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          disabled={locations.length === 0}
        >
          <option value="">
            {locationsError ? "Locations unavailable" : "Select a location"}
          </option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        {locationsError && <p className="field-error">{locationsError}</p>}
        {errors.location && <p className="field-error">{errors.location}</p>}
      </div>

      <div className="field">
        <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
        <input
          id="carpet_area_sqft"
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={form.carpet_area_sqft}
          onChange={(e) => updateField("carpet_area_sqft", e.target.value)}
        />
        {errors.carpet_area_sqft && (
          <p className="field-error">{errors.carpet_area_sqft}</p>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="floor_num">Floor</label>
          <input
            id="floor_num"
            type="number"
            step={1}
            inputMode="numeric"
            value={form.floor_num}
            onChange={(e) => updateField("floor_num", e.target.value)}
          />
          {errors.floor_num && <p className="field-error">{errors.floor_num}</p>}
        </div>

        <div className="field">
          <label htmlFor="bathroom">Bathrooms</label>
          <input
            id="bathroom"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={form.bathroom}
            onChange={(e) => updateField("bathroom", e.target.value)}
          />
          {errors.bathroom && <p className="field-error">{errors.bathroom}</p>}
        </div>

        <div className="field">
          <label htmlFor="balcony">Balconies</label>
          <input
            id="balcony"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={form.balcony}
            onChange={(e) => updateField("balcony", e.target.value)}
          />
          {errors.balcony && <p className="field-error">{errors.balcony}</p>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="furnishing">Furnishing</label>
          <select
            id="furnishing"
            value={form.furnishing}
            onChange={(e) => updateField("furnishing", e.target.value)}
          >
            <option value="">Select</option>
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.furnishing && <p className="field-error">{errors.furnishing}</p>}
        </div>

        <div className="field">
          <label htmlFor="transaction">Transaction</label>
          <select
            id="transaction"
            value={form.transaction}
            onChange={(e) => updateField("transaction", e.target.value)}
          >
            <option value="">Select</option>
            {TRANSACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.transaction && <p className="field-error">{errors.transaction}</p>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="ownership">Ownership</label>
          <select
            id="ownership"
            value={form.ownership}
            onChange={(e) => updateField("ownership", e.target.value)}
          >
            <option value="">Select</option>
            {OWNERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.ownership && <p className="field-error">{errors.ownership}</p>}
        </div>

        <div className="field">
          <label htmlFor="facing">Facing</label>
          <select
            id="facing"
            value={form.facing}
            onChange={(e) => updateField("facing", e.target.value)}
          >
            <option value="">Select</option>
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.facing && <p className="field-error">{errors.facing}</p>}
        </div>
      </div>

      {submitError && <p className="submit-error">{submitError}</p>}

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? "Estimating…" : "Estimate price"}
      </button>
    </form>
  );
}
