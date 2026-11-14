// Liens d’un lieu : localisation exacte, Instagram, Facebook.
// Si la page officielle n’est pas encore renseignée, on propose une RECHERCHE (jamais un faux lien).
const q = (s: string) => encodeURIComponent(s);

export function mapsLink(place: any) {
  if (place.lat != null && place.precision === "exact") return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q(`${place.name}, ${place.gov?.name || ""}, Tunisie`)}`;
}
export function directionsLink(place: any) {
  const dest = place.lat != null ? `${place.lat},${place.lng}` : q(`${place.name}, ${place.gov?.name || ""}, Tunisie`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
export function osmLink(place: any) {
  return place.lat != null ? `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=17/${place.lat}/${place.lng}` : null;
}
export function instagramLink(place: any) {
  if (place.instagram) return { href: place.instagram, official: true };
  const tag = place.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  return { href: `https://www.instagram.com/explore/tags/${tag}/`, official: false };
}
export function facebookLink(place: any) {
  if (place.facebook) return { href: place.facebook, official: true };
  return { href: `https://www.facebook.com/search/top?q=${q(place.name + " " + (place.gov?.name || ""))}`, official: false };
}
export const PRECISION_LABEL: Record<string, string> = {
  exact: "Position exacte du lieu",
  quartier: "Position du quartier — l’adresse exacte est à renseigner",
  ville: "Position approximative du secteur",
};
