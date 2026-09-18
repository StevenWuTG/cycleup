import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, CheckCircle, Upload, Tag, DollarSign, AlignLeft, Type, MapPin, X } from "lucide-react";
import { categories } from "../data/categories";
import { useListings } from "../context/listings-context";

const itemCategories = categories.filter(c => c !== "All");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const initialForm = {
  title: "", description: "", price: "",
  category: [], condition: "", location: "", story: "",
};

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

export default function PostItem() {
  const { addListing }            = useListings();
  const [form, setForm]           = useState(initialForm);
  const [createdListing, setDone] = useState(null);
  const [errors, setErrors]       = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInput = useRef(null);

  const inputClass = err =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] transition bg-white text-[#1a2e1e] placeholder:text-[#c4a882] ${
      err ? "border-red-400 bg-red-50" : "border-[#ddd6cc] hover:border-[#a0785a]"
    }`;

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

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(p => ({ ...p, image: "Please choose an image file (PNG, JPG, WebP)." }));
    } else if (file.size > MAX_IMAGE_BYTES) {
      setErrors(p => ({ ...p, image: "Image must be 5MB or smaller." }));
    } else {
      if (preview) URL.revokeObjectURL(preview);
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setErrors(p => ({ ...p, image: "" }));
      return;
    }
    e.target.value = "";
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
      const listing = await addListing({
        imageFile,
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        location: form.location.trim(),
        story: form.story.trim(),
      });
      setDone(listing);
      clearImage();
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdListing) return (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-lg border border-[#e8e0d5] p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#d8f3dc] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-[#52b788]" />
        </div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-3xl font-bold text-[#1b4332] mb-2">
          It's live!
        </h2>
        <p className="text-[#6b7280] mb-6">
          <span className="font-semibold text-[#2d6a4f]">"{createdListing.title}"</span> is now on the CycleUp marketplace.
        </p>
        <div className="bg-[#f0faf3] border border-[#d8f3dc] rounded-2xl p-5 mb-6 text-left space-y-2">
          {[
            ["Title",      createdListing.title],
            ["Price",      `$${Number(createdListing.price).toFixed(2)}`],
            ["Categories", createdListing.category.join(", ")],
            ["Condition",  createdListing.condition],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm gap-3">
              <span className="text-[#6b7280]">{k}</span>
              <span className="font-medium text-[#1a2e1e] text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <Link
            to={`/item/${createdListing.id}`}
            className="block w-full text-center bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            View Listing
          </Link>
          <button
            onClick={() => { setForm(initialForm); setDone(null); }}
            className="w-full text-sm font-semibold text-[#2d6a4f] hover:underline"
          >
            List Another Item
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <p className="text-[#74c69d] text-sm font-semibold uppercase tracking-widest mb-2">Sell on CycleUp</p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-4xl lg:text-5xl font-bold text-white mb-2">
            Post your item
          </h1>
          <p className="text-white/60">Give your upcycled creation a new home</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Main form */}
          <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#e8e0d5] p-6 sm:p-8 space-y-6">

            {/* Image upload */}
            <div>
              <input
                ref={fileInput} type="file" accept="image/*" onChange={handleImage} className="hidden"
              />
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#e8e0d5]">
                  <img src={preview} alt="Selected item preview" className="w-full h-64 object-cover" />
                  <button
                    type="button" onClick={clearImage} aria-label="Remove photo"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#1a2e1e] rounded-full p-1.5 shadow"
                  >
                    <X size={16} />
                  </button>
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
              <input
                type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="City, State (e.g. Portland, OR)"
                className={inputClass(false)}
              />
            </Field>

            {/* Story */}
            <Field
              label="The Origin Story"
              icon={<Leaf size={14} />}
            >
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
              {submitting ? "Publishing…" : "Publish Listing"}
            </button>
          </form>

          {/* Sidebar tips */}
          <div className="hidden lg:flex flex-col gap-5 sticky top-24">
            <div className="bg-[#1b4332] rounded-3xl p-6 text-white">
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-xl font-bold mb-4">Listing tips</h3>
              <ul className="space-y-3 text-sm text-white/80">
                {[
                  "Use a clear, descriptive title with the material",
                  "Include dimensions in the description",
                  "Share the original item's story — buyers love context",
                  "Accurate pricing gets 3× more views",
                  "Select all relevant categories for more exposure",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#52b788]/30 text-[#74c69d] text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e0d5] p-6">
              <div className="text-2xl font-bold text-[#2d6a4f] mb-1">Free to list</div>
              <p className="text-sm text-[#6b7280]">We only take a small commission when your item sells. No upfront costs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
