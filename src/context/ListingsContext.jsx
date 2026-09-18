import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ListingsContext } from "./listings-context";
import { useAuth } from "./auth-context";

const IMAGE_BUCKET = "listing-images";

// Photos live under a folder named after the uploader; storage policies
// only let a user write to their own folder.
async function uploadImage(file, userId) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best effort: a leftover photo is harmless, so a failed cleanup never
// fails the operation that triggered it.
async function removeStoredImages(urls) {
  const paths = urls
    .map(url => url.split(`/${IMAGE_BUCKET}/`)[1])
    .filter(Boolean)
    .map(decodeURIComponent);
  if (paths.length === 0) return;
  await supabase.storage.from(IMAGE_BUCKET).remove(paths);
}

// Turns the form's ordered photo list into final URLs, uploading the new ones.
// Each item is either { url } (already stored) or { file } (to upload). If any
// upload fails, the ones that did succeed are removed again so nothing is
// orphaned, and the first error is thrown. Returns the URLs (in order) and just
// the freshly uploaded ones (for cleanup if a later step fails).
async function resolvePhotos(photos, userId) {
  const results = await Promise.allSettled(
    photos.map(photo => (photo.file ? uploadImage(photo.file, userId) : Promise.resolve(photo.url))),
  );
  const uploaded = photos
    .map((photo, i) => (photo.file && results[i].status === "fulfilled" ? results[i].value : null))
    .filter(Boolean);
  const failed = results.find(r => r.status === "rejected");
  if (failed) {
    await removeStoredImages(uploaded);
    throw failed.reason;
  }
  return { urls: results.map(r => r.value), uploaded };
}

export function ListingsProvider({ children }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("listings")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setListings(data);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // `photos` is the ordered list from the form (first = cover). Uploads them
  // first, then inserts the row. Throws on failure so the caller can surface the
  // error and keep the form intact. The database sets user_id and seller from
  // the logged-in user, so they aren't sent here.
  async function addListing({ photos = [], ...data }) {
    if (!user) throw new Error("You need to be signed in to post an item.");
    const { urls, uploaded } = await resolvePhotos(photos, user.id);
    const { data: row, error } = await supabase
      .from("listings")
      .insert({ ...data, image_urls: urls })
      .select()
      .single();
    if (error) {
      await removeStoredImages(uploaded); // don't orphan the new photos
      throw error;
    }
    setListings(prev => [row, ...prev]);
    return row;
  }

  // `photos` is the complete, ordered set the listing should end up with: kept
  // photos as { url } and new ones as { file }. Photos that were on the listing
  // but aren't in the list any more are deleted from storage afterwards.
  // Row-level security silently filters out rows the user doesn't own, so an
  // empty result means nothing was updated. seller/user_id can't be changed
  // (a database trigger locks them), so they're never sent.
  async function updateListing(listing, { photos = [], ...fields }) {
    if (!user) throw new Error("You need to be signed in to edit a listing.");
    const { urls, uploaded } = await resolvePhotos(photos, user.id);

    const { data, error } = await supabase
      .from("listings").update({ ...fields, image_urls: urls }).eq("id", listing.id).select();
    if (error || data.length === 0) {
      await removeStoredImages(uploaded); // don't orphan the new photos
      throw error ?? new Error("You can only edit your own listings.");
    }

    setListings(prev => prev.map(l => (l.id === listing.id ? data[0] : l)));
    await removeStoredImages(listing.image_urls.filter(url => !urls.includes(url)));
    return data[0];
  }

  // Row-level security silently filters out rows the user doesn't own, so an
  // empty result means nothing was deleted.
  async function deleteListing(listing) {
    const { data, error } = await supabase
      .from("listings").delete().eq("id", listing.id).select("id");
    if (error) throw error;
    if (data.length === 0) throw new Error("You can only delete your own listings.");
    setListings(prev => prev.filter(l => l.id !== listing.id));

    await removeStoredImages(listing.image_urls);
  }

  return (
    <ListingsContext.Provider value={{ listings, loading, error, addListing, updateListing, deleteListing }}>
      {children}
    </ListingsContext.Provider>
  );
}
