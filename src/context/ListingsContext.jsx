import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ListingsContext } from "./listings-context";

const IMAGE_BUCKET = "listing-images";

async function uploadImage(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function ListingsProvider({ children }) {
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
  // so the caller can surface the error and keep the form intact.
  async function addListing({ imageFile, ...data }) {
    const image_url = imageFile ? await uploadImage(imageFile) : null;
    const { data: row, error } = await supabase
      .from("listings")
      .insert({ ...data, image_url })
      .select()
      .single();
    if (error) throw error;
    setListings(prev => [row, ...prev]);
    return row;
  }

  return (
    <ListingsContext.Provider value={{ listings, loading, error, addListing }}>
      {children}
    </ListingsContext.Provider>
  );
}
