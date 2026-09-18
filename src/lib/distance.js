const EARTH_RADIUS_MILES = 3958.8;
const KM_PER_MILE = 1.609344;

const toRadians = degrees => (degrees * Math.PI) / 180;

// Great-circle distance between two { latitude, longitude } points, in miles.
export function distanceMiles(a, b) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Miles for the US and a few others, kilometres elsewhere. Defaults to miles
// when the browser's region can't be determined.
const MILE_REGIONS = ["US", "GB", "LR", "MM"];
function prefersMiles() {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return !region || MILE_REGIONS.includes(region);
  } catch {
    return true;
  }
}
const useMiles = prefersMiles();

export function formatDistance(miles) {
  const value = useMiles ? miles : miles * KM_PER_MILE;
  const unit = useMiles ? "mi" : "km";
  if (value < 1) return `<1 ${unit}`;
  if (value < 10) return `${value.toFixed(1)} ${unit}`;
  return `${Math.round(value).toLocaleString()} ${unit}`;
}
