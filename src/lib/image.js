const MAX_SIDE = 1600;
const QUALITY = 0.85;

// Browsers (including every iOS browser, which all sit on WebKit) can't
// decode HEIC/HEIF as an image at all -- not via createImageBitmap, not via
// <img>. iPhones store photos in that format by default ("Settings > Camera >
// Formats > High Efficiency"), and whether the OS transcodes a given photo to
// JPEG before handing it to a web page turns out to be inconsistent across
// iOS versions and picker flows, so we can't rely on that happening. Decoding
// HEIC ourselves via libheif (WASM, loaded lazily so it doesn't cost anything
// for the common case) sidesteps that unreliability entirely.
function looksLikeHeic(file) {
  const type = (file.type || "").toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  if (type) return false; // a real, different declared type -- trust it
  return /\.hei[cf]$/i.test(file.name || ""); // no type reported: fall back to the extension
}

async function convertHeic(file) {
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  // A HEIC file can hold a burst/Live Photo, which heic2any returns as an
  // array of blobs; we only want a single cover image, so take the first.
  return Array.isArray(converted) ? converted[0] : converted;
}

// createImageBitmap(file) can also fail on some ordinary JPEGs that browsers
// otherwise display fine; the <img> pipeline is more permissive, so that's
// tried next (losing nothing: modern browsers already auto-rotate <img> per
// EXIF on load, so a bitmap taken from it is already correctly oriented
// without needing the imageOrientation option again).
async function decodeToBitmap(file) {
  if (looksLikeHeic(file)) file = await convertHeic(file);
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (err) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(err);
        img.src = url;
      });
      return await createImageBitmap(img);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

// Re-encodes a photo through a canvas before upload. That (a) drops hidden
// metadata such as the GPS position phone cameras embed (which would reveal a
// seller's home), (b) applies the camera's rotation so the picture isn't
// sideways, and (c) shrinks huge originals. Animated images keep only their
// first frame. Throws if the browser truly can't decode the file (e.g. HEIC
// in most browsers) — callers should refuse the photo rather than upload it
// untouched.
export async function prepareImage(file) {
  const bitmap = await decodeToBitmap(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // transparent areas would otherwise turn black in a JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Couldn't encode the image."))), "image/jpeg", QUALITY));
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
