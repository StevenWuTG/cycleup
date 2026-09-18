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

  // Row-level security silently filters out rows the user doesn't own, so an
  // empty result means nothing was deleted.
  async function deleteListing(listing) {
    const { data, error } = await supabase
      .from("listings").delete().eq("id", listing.id).select("id");
    if (error) throw error;
    if (data.length === 0) throw new Error("You can only delete your own listings.");
    setListings(prev => prev.filter(l => l.id !== listing.id));

    // Best effort: the row is already gone, so a leftover photo isn't fatal.
    const path = listing.image_url?.split(`/${IMAGE_BUCKET}/`)[1];
    if (path) await supabase.storage.from(IMAGE_BUCKET).remove([decodeURIComponent(path)]);
  }

  return (
    <ListingsContext.Provider value={{ listings, loading, error, addListing, deleteListing }}>
      {children}
    </ListingsContext.Provider>
  );
}
