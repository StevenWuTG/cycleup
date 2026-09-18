import { useEffect, useRef, useState } from "react";
import { Leaf, Upload, Tag, DollarSign, AlignLeft, Type, MapPin, X, ImagePlus } from "lucide-react";
import { categories } from "../data/categories";
import LocationPicker from "./LocationPicker";
import { prepareImage } from "../lib/image";

const itemCategories = categories.filter(c => c !== "All");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 5;

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
// for editing. `onSubmit({ fields, photos })` does the saving, where `photos` is the
// complete ordered list (first = cover) of `{ url }` (kept) and `{ file }` (new);
// throwing from it shows the error and keeps the form intact.
export default function ListingForm({ listing, submitLabel, submittingLabel, onSubmit, className = "" }) {
  const [form, setForm]           = useState(() => formFromListing(listing));
  const [place, setPlace]         = useState(() => placeFromListing(listing));
  const [errors, setErrors]       = useState({});
  // Ordered photos. `preview` is what the thumbnail shows: the stored URL for a
  // kept photo, or a temporary blob URL for a newly chosen one.
  const [photos, setPhotos]       = useState(() =>
    (listing?.image_urls ?? []).map(url => ({ id: crypto.randomUUID(), url, preview: url })));
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInput = useRef(null);

  // Blob URLs for new photos, released as photos are removed and when the form goes away.
  const blobUrls = useRef(new Set());
  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, []);

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

  // Reads the chosen files through prepareImage (which strips hidden metadata
  // like GPS) and appends what fits. Files that can't be used are skipped and
  // reported together rather than failing the whole batch.
  async function addPhotos(e) {
    const input = e.target;
    const files = [...input.files];
    input.value = "";
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;
    const problems = [];
    if (files.length > room) problems.push(`A listing can have up to ${MAX_PHOTOS} photos, so ${files.length - room} weren't added.`);

    setProcessing(true);
    const prepared = await Promise.all(files.slice(0, room).map(async file => {
      if (!file.type.startsWith("image/")) { problems.push(`${file.name} isn't an image.`); return null; }
      if (file.size > MAX_IMAGE_BYTES) { problems.push(`${file.name} is over 5MB.`); return null; }
      try {
        const clean = await prepareImage(file);
        const preview = URL.createObjectURL(clean);
        blobUrls.current.add(preview);
        return { id: crypto.randomUUID(), file: clean, preview };
      } catch {
        problems.push(`We couldn't read ${file.name}. Try a JPEG or PNG.`);
        return null;
      }
    }));
    setProcessing(false);

    const added = prepared.filter(Boolean);
    if (added.length > 0) setPhotos(prev => [...prev, ...added].slice(0, MAX_PHOTOS));
    setErrors(p => ({ ...p, image: problems.join(" ") }));
  }

  function removePhoto(id) {
    const photo = photos.find(p => p.id === id);
    if (photo?.file) {
      URL.revokeObjectURL(photo.preview);
      blobUrls.current.delete(photo.preview);
    }
    setPhotos(prev => prev.filter(p => p.id !== id));
    setErrors(p => ({ ...p, image: "" }));
  }

  function makeCover(id) {
    setPhotos(prev => {
      const chosen = prev.find(p => p.id === id);
      return [chosen, ...prev.filter(p => p.id !== id)];
    });
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
        photos: photos.map(p => (p.file ? { file: p.file } : { url: p.url })),
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

      {/* Photos */}
      <div>
        <input ref={fileInput} type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" />
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#1a2e1e]">
            <ImagePlus size={14} />
            Photos
          </span>
          <span className="text-xs text-[#a0785a]">{photos.length} of {MAX_PHOTOS}</span>
        </div>

        {photos.length === 0 ? (
          <button
            type="button" onClick={() => fileInput.current.click()}
            className="w-full border-2 border-dashed border-[#d8f3dc] rounded-2xl p-8 text-center hover:border-[#52b788] hover:bg-[#f0faf3] transition-colors"
          >
            <div className="w-12 h-12 bg-[#d8f3dc] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-[#2d6a4f]" />
            </div>
            <p className="font-semibold text-[#2d6a4f] text-sm mb-1">Upload photos</p>
            <p className="text-xs text-[#a0785a]">PNG, JPG or WebP, up to 5MB each · up to {MAX_PHOTOS} photos</p>
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-[#e8e0d5] bg-[#faf6f0]">
                <img src={photo.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 ? (
                  <span className="absolute top-2 left-2 bg-[#1b4332] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button" onClick={() => makeCover(photo.id)}
                    className="absolute bottom-2 left-2 bg-white/90 hover:bg-white text-[#1a2e1e] text-[11px] font-semibold px-2 py-1 rounded-full shadow"
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-[#1a2e1e] rounded-full p-1.5 shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button" onClick={() => fileInput.current.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-[#d8f3dc] hover:border-[#52b788] hover:bg-[#f0faf3] flex flex-col items-center justify-center gap-1.5 text-[#2d6a4f] text-xs font-semibold transition-colors"
              >
                <Upload size={20} />
                Add photos
              </button>
            )}
          </div>
        )}

        {processing && <p className="text-xs text-[#8d8073] mt-2">Getting your photos ready…</p>}
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
        type="submit" disabled={submitting || processing}
        className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <Leaf size={18} />
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
