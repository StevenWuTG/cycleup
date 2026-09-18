import { useEffect, useRef, useState } from "react";
import { Leaf, Upload, Tag, DollarSign, AlignLeft, Type, MapPin, X, ImagePlus } from "lucide-react";
import { categories } from "../data/categories";
import LocationPicker from "./LocationPicker";
import { prepareImage } from "../lib/image";

const itemCategories = categories.filter(c => c !== "All");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const emptyForm = {
  title: "", description: "", price: "",
  category: [], condition: "", story: "",
};

function formFromListing(listing) {
  if (!listing) return emptyForm;
  return {
    title: listing.title,
    description: listing.description ?? "",
    price: String(listing.price),
    category: listing.category,
    condition: listing.condition ?? "",
    story: listing.story ?? "",
  };
}

// Listings made before coordinates existed have a text label but no position.
function placeFromListing(listing) {
  if (!listing?.location) return null;
  return { label: listing.location, latitude: listing.latitude ?? null, longitude: listing.longitude ?? null };
}

function Field({ label, required, icon, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-[#1a2e1e] mb-2">
        {icon}
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

const inputClass = err =>
  `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] transition bg-white text-[#1a2e1e] placeholder:text-[#c4a882] ${
    err ? "border-red-400 bg-red-50" : "border-[#ddd6cc] hover:border-[#a0785a]"
  }`;

// The listing form shared by "post" and "edit". Pass `listing` to pre-fill it
// for editing. `onSubmit({ fields, imageFile, removeImage })` does the saving;
// throwing from it shows the error and keeps the form intact.
export default function ListingForm({ listing, submitLabel, submittingLabel, onSubmit, className = "" }) {
  const existingImageUrl = listing?.image_url ?? null;

  const [form, setForm]           = useState(() => formFromListing(listing));
  const [place, setPlace]         = useState(() => placeFromListing(listing));
  const [errors, setErrors]       = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInput = useRef(null);

  // Release the temporary preview URL when it's replaced or the form unmounts.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const shownImage = preview ?? (removeExisting ? null : existingImageUrl);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  }

  function toggleCat(cat) {
    setForm(p => ({
      ...p,
      category: p.category.includes(cat) ? p.category.filter(c => c !== cat) : [...p.category, cat],
    }));
    if (errors.category) setErrors(p => ({ ...p, category: "" }));
  }

  // First click undoes a newly chosen photo (back to the current one, if any);
  // clicking again removes the current photo.
  function removePhoto() {
    if (preview) {
      setImageFile(null);
      setPreview(null);
      if (fileInput.current) fileInput.current.value = "";
    } else {
      setRemoveExisting(true);
    }
  }

  async function handleImage(e) {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    let problem = "";
    if (!file.type.startsWith("image/")) {
      problem = "Please choose an image file (PNG, JPG, WebP).";
    } else if (file.size > MAX_IMAGE_BYTES) {
      problem = "Image must be 5MB or smaller.";
    } else {
      try {
        // Strips hidden metadata (like GPS) before the photo ever leaves the browser.
        const clean = await prepareImage(file);
        setImageFile(clean);
        setPreview(URL.createObjectURL(clean));
        setRemoveExisting(false);
        setErrors(p => ({ ...p, image: "" }));
      } catch {
        problem = "We couldn't read that photo. Try a JPEG or PNG.";
      }
    }
    if (problem) setErrors(p => ({ ...p, image: problem }));
    input.value = "";
  }

  function validate() {
    const e = {};
    if (!form.title.trim())                              e.title       = "Title is required.";
    if (!form.description.trim())                        e.description = "Description is required.";
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid price.";
    if (form.category.length === 0)                      e.category    = "Select at least one category.";
    if (!form.condition)                                 e.condition   = "Select item condition.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        fields: {
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          category: form.category,
          condition: form.condition,
          location: place?.label ?? "",
          latitude: place?.latitude ?? null,
          longitude: place?.longitude ?? null,
          story: form.story.trim(),
        },
        imageFile,
        removeImage: removeExisting && !imageFile,
      });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
    // On success the caller navigates away or swaps the screen, so the form
    // is left in its submitting state rather than flashing back to editable.
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`bg-white rounded-3xl shadow-sm border border-[#e8e0d5] p-6 sm:p-8 space-y-6 ${className}`}>

      {/* Photo */}
      <div>
        <input ref={fileInput} type="file" accept="image/*" onChange={handleImage} className="hidden" />
        {shownImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-[#e8e0d5]">
            <img src={shownImage} alt="Item photo" className="w-full h-64 object-cover" />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button" onClick={() => fileInput.current.click()}
                className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-[#1a2e1e] text-xs font-semibold rounded-full px-3 py-1.5 shadow"
              >
                <ImagePlus size={14} />
                Change
              </button>
              <button
                type="button" onClick={removePhoto} aria-label="Remove photo"
                className="bg-white/90 hover:bg-white text-[#1a2e1e] rounded-full p-1.5 shadow"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button" onClick={() => fileInput.current.click()}
            className="w-full border-2 border-dashed border-[#d8f3dc] rounded-2xl p-8 text-center hover:border-[#52b788] hover:bg-[#f0faf3] transition-colors"
          >
            <div className="w-12 h-12 bg-[#d8f3dc] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-[#2d6a4f]" />
            </div>
            <p className="font-semibold text-[#2d6a4f] text-sm mb-1">Upload a photo</p>
            <p className="text-xs text-[#a0785a]">PNG, JPG or WebP up to 5MB</p>
          </button>
        )}
        {errors.image && <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>}
      </div>

      {/* Title */}
      <Field label="Item Title" required icon={<Type size={14} />} error={errors.title}>
        <input
          type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="e.g. Reclaimed Wood Shelf with Industrial Pipe"
          className={inputClass(errors.title)}
        />
      </Field>

      {/* Description */}
      <Field label="Description" required icon={<AlignLeft size={14} />} error={errors.description}>
        <textarea
          name="description" value={form.description} onChange={handleChange} rows={4}
          placeholder="Materials used, dimensions, unique features, care instructions…"
          className={inputClass(errors.description) + " resize-none"}
        />
      </Field>

      {/* Price + Condition */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Price (USD)" required icon={<DollarSign size={14} />} error={errors.price}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0785a] text-sm font-medium">$</span>
            <input
              type="number" name="price" value={form.price} onChange={handleChange}
              placeholder="0.00" min="0" step="0.01"
              className={inputClass(errors.price) + " pl-8"}
            />
          </div>
        </Field>
        <Field label="Condition" required error={errors.condition}>
          <select
            name="condition" value={form.condition} onChange={handleChange}
            className={inputClass(errors.condition) + " cursor-pointer"}
          >
            <option value="" disabled>Select condition…</option>
            <option>New (upcycled)</option>
            <option>Like New</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </Field>
      </div>

      {/* Categories */}
      <Field label="Categories" required icon={<Tag size={14} />} error={errors.category}>
        <div className="flex flex-wrap gap-2">
          {itemCategories.map(cat => (
            <button
              key={cat} type="button" onClick={() => toggleCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                form.category.includes(cat)
                  ? "bg-[#1b4332] text-white border-[#1b4332] shadow-sm"
                  : "bg-white text-[#6b7280] border-[#ddd6cc] hover:border-[#52b788] hover:text-[#2d6a4f]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Field>

      {/* Location */}
      <Field label="Location" icon={<MapPin size={14} />}>
        <LocationPicker
          id="location" value={place} onChange={setPlace} allowFreeText
          placeholder="Search for your city or ZIP code…"
          inputClassName={inputClass(false)}
        />
        {place && place.latitude == null ? (
          <p className="text-xs text-amber-700 mt-1.5">
            Choose a suggestion from the list so buyers can sort by distance. Without one, your listing shows this text but no distance.
          </p>
        ) : (
          <p className="text-xs text-[#a0785a] mt-1.5">
            Buyers see your city and roughly how far away it is, never your street address.
          </p>
        )}
      </Field>

      {/* Story */}
      <Field label="The Origin Story" icon={<Leaf size={14} />}>
        <textarea
          name="story" value={form.story} onChange={handleChange} rows={3}
          placeholder="What was this before? Where did the materials come from? Buyers love the backstory…"
          className={inputClass(false) + " resize-none"}
        />
      </Field>

      {submitError && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</p>
      )}

      <button
        type="submit" disabled={submitting}
        className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <Leaf size={18} />
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
