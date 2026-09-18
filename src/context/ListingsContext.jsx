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
async function removeStoredImage(url) {
  const path = url?.split(`/${IMAGE_BUCKET}/`)[1];
  if (!path) return;
  await supabase.storage.from(IMAGE_BUCKET).remove([decodeURIComponent(path)]);
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

  // Uploads the optional photo first, then inserts the row. Throws on failure
  // so the caller can surface the error and keep the form intact. The database
  // sets user_id and seller from the logged-in user, so they aren't sent here.
  async function addListing({ imageFile, ...data }) {
    if (!user) throw new Error("You need to be signed in to post an item.");
    const image_url = imageFile ? await uploadImage(imageFile, user.id) : null;
    const { data: row, error } = await supabase
      .from("listings")
      .insert({ ...data, image_url })
      .select()
      .single();
    if (error) throw error;
    setListings(prev => [row, ...prev]);
    return row;
  }

  // `imageFile` replaces the photo, `removeImage` clears it, neither keeps it.
  // Row-level security silently filters out rows the user doesn't own, so an
  // empty result means nothing was updated. seller/user_id can't be changed
  // (a database trigger locks them), so they're never sent.
  async function updateListing(listing, { imageFile, removeImage, ...fields }) {
    if (!user) throw new Error("You need to be signed in to edit a listing.");
    const uploadedUrl = imageFile ? await uploadImage(imageFile, user.id) : null;
    const image_url = uploadedUrl ?? (removeImage ? null : listing.image_url);

    const { data, error } = await supabase
      .from("listings").update({ ...fields, image_url }).eq("id", listing.id).select();
    if (error || data.length === 0) {
      await removeStoredImage(uploadedUrl); // don't orphan the new photo
      throw error ?? new Error("You can only edit your own listings.");
    }

    setListings(prev => prev.map(l => (l.id === listing.id ? data[0] : l)));
    if (image_url !== listing.image_url) await removeStoredImage(listing.image_url);
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

    await removeStoredImage(listing.image_url);
  }

  return (
    <ListingsContext.Provider value={{ listings, loading, error, addListing, updateListing, deleteListing }}>
      {children}
    </ListingsContext.Provider>
  );
}
