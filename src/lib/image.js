const MAX_SIDE = 1600;
const QUALITY = 0.85;

// Re-encodes a photo through a canvas before upload. That (a) drops hidden
// metadata such as the GPS position phone cameras embed (which would reveal a
// seller's home), (b) applies the camera's rotation so the picture isn't
// sideways, and (c) shrinks huge originals. Animated images keep only their
// first frame. Throws if the browser can't decode the file (e.g. HEIC in most
// browsers) — callers should refuse the photo rather than upload it untouched.
export async function prepareImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
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
