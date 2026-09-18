// Place search uses Open-Meteo's free geocoding API (no key needed, CORS
// enabled, city and postal-code search). It's free for non-commercial use;
// swap this module for another provider (Mapbox, Google, ...) if that changes.
// Everything else in the app only sees { label, latitude, longitude }.

function labelFor(result) {
  const country = result.country_code === "US" ? null : result.country;
  return [result.name, result.admin1, country].filter(Boolean).join(", ");
}

export async function searchPlaces(query, { count = 8 } = {}) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Place search is unavailable right now.");
  const data = await response.json();

  // The API can return several rows with the same label; keep the first.
  const seen = new Set();
  const places = [];
  for (const r of data.results ?? []) {
    const label = labelFor(r);
    if (seen.has(label)) continue;
    seen.add(label);
    places.push({ label, latitude: r.latitude, longitude: r.longitude });
  }
  return places;
}

// The browser's own position, rounded to ~1 km so a stored value is never
// more precise than a neighbourhood. Rejects with a user-readable message.
export function getCurrentPlace() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser doesn't support location. Try searching for a city instead."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        label: "Current location",
        latitude: Math.round(coords.latitude * 100) / 100,
        longitude: Math.round(coords.longitude * 100) / 100,
      }),
      error => reject(new Error(
        error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. You can search for a city instead."
          : "Couldn't get your location. Try searching for a city instead."
      )),
      { timeout: 10000, maximumAge: 300000 },
    );
  });
}
