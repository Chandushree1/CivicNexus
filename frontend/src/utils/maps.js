// Builds a Google Maps "Get Directions" URL from the officer's current location
// (Google Maps fills that in automatically) to the complaint's GPS coordinates.
// No API key needed — this is Google's public web deep-link format.
export function getDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

// Opens the raw pin location (no route) — useful for just double-checking a spot.
export function getMapViewUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
