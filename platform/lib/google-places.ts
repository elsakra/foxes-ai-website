/** Google Places (legacy) REST — server-only; key never exposed */

const BASE = "https://maps.googleapis.com/maps/api/place";

export type AutocompleteSuggestion = {
  place_id: string;
  primary_text: string;
  secondary_text: string;
};

export type PlaceSnapshot = {
  place_id: string;
  display_name: string;
  formatted_address: string | null;
  formatted_phone: string | null;
  international_phone: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  primary_type: string | null;
  secondary_types: string[];
  website: string | null;
  photo_url: string | null;
};

function getKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
}

export async function fetchAutocomplete(input: string): Promise<AutocompleteSuggestion[]> {
  const key = getKey();
  if (!key || !input.trim()) return [];

  const params = new URLSearchParams({
    input: input.trim(),
    key,
  });
  const url = `${BASE}/autocomplete/json?${params}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as {
    predictions?: {
      place_id: string;
      structured_formatting: {
        main_text?: string;
        secondary_text?: string;
      };
    }[];
    status: string;
  };
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    console.warn("Places autocomplete", json.status);
    return [];
  }
  return (json.predictions ?? []).map((p) => ({
    place_id: p.place_id,
    primary_text: p.structured_formatting?.main_text ?? "",
    secondary_text: p.structured_formatting?.secondary_text ?? "",
  }));
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceSnapshot | null> {
  const key = getKey();
  if (!key || !placeId) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key,
    fields:
      "place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,types,website,photos,icon",
  });
  const url = `${BASE}/details/json?${params}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    result?: {
      place_id?: string;
      name?: string;
      formatted_address?: string;
      formatted_phone_number?: string;
      international_phone_number?: string;
      rating?: number;
      user_ratings_total?: number;
      types?: string[];
      website?: string;
      photos?: { photo_reference: string; height: number; width: number }[];
      icon?: string;
    };
    status: string;
  };
  if (json.status !== "OK" || !json.result) {
    console.warn("Places details", json.status);
    return null;
  }
  const r = json.result;
  const types = r.types ?? [];
  const primary = types.find((t) => t !== "establishment" && t !== "point_of_interest") ?? types[0] ?? null;
  const photoRef = r.photos?.[0]?.photo_reference;
  const photo_url = photoRef
    ? `/api/places/photo?photo_reference=${encodeURIComponent(photoRef)}&maxwidth=320`
    : r.icon ?? null;

  return {
    place_id: r.place_id ?? placeId,
    display_name: r.name ?? "Business",
    formatted_address: r.formatted_address ?? null,
    formatted_phone: r.formatted_phone_number ?? null,
    international_phone: r.international_phone_number ?? null,
    rating: r.rating ?? null,
    user_ratings_total: r.user_ratings_total ?? null,
    primary_type: primary,
    secondary_types: types,
    website: r.website ?? null,
    photo_url,
  };
}

export function typeToIndustryHint(types: string[]): string {
  const map: Record<string, string> = {
    restaurant: "Restaurant",
    food: "Food & beverage",
    store: "Retail",
    health: "Health & wellness",
    dentist: "Dental",
    doctor: "Medical",
    lawyer: "Legal services",
    plumber: "Home services",
    electrician: "Home services",
    gym: "Fitness",
    beauty_salon: "Beauty",
    car_repair: "Automotive",
    lodging: "Hospitality",
    real_estate_agency: "Real estate",
  };
  for (const t of types) {
    if (map[t]) return map[t];
  }
  return types[0]?.replace(/_/g, " ") ?? "";
}
