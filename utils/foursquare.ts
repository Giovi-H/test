const FSQ_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;
const BASE_URL = 'https://places-api.foursquare.com';
const VERSION = '2025-06-17';

export const FILTER_QUERIES: Record<string, string> = {
  matcha: 'matcha',
  dessert: 'dessert cafe',
  study: 'study cafe',
  cozy: 'cozy cafe',
  coffee: 'coffee',
  boba: 'boba',
  aesthetic: 'aesthetic cafe',
  visited: '',
  saved: '',
};


export async function getNearbyCafes(
  lat: number,
  lng: number,
  radius: number = 3200,
  query?: string
) {
  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    fsq_category_ids: '4bf58dd8d48988d16d941735,4bf58dd8d48988d1e0931735,4bf58dd8d48988d1dc931735,52e81612bcbc57f1066b7a0c,4bf58dd8d48988d16a941735,4bf58dd8d48988d1d0941735,5744ccdfe4b0c0459246b4e2',
    radius: String(radius),
    limit: '50',
    sort: 'DISTANCE',
    fields: 'fsq_place_id,name,location,categories,distance,latitude,longitude',
    ...(query ? { query } : {}),
  });

  try {
    const response = await fetch(`${BASE_URL}/places/search?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${FSQ_API_KEY}`,
        Accept: 'application/json',
        'X-Places-Api-Version': VERSION,
      },
    });

    const data = await response.json();
if (!response.ok) {
  console.error('Foursquare error:', data);
  return [];
}

return data.results ?? [];

  } catch (err) {
    console.error('Foursquare fetch error:', err);
    return [];
  }
}

export async function getCafeDetails(fsqId: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/places/${fsqId}?fields=fsq_place_id,name,location,categories,distance,tel,website`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${FSQ_API_KEY}`,
          Accept: 'application/json',
          'X-Places-Api-Version': VERSION,
        },
      }
    );
    return response.json();
  } catch (err) {
    console.error('Foursquare error:', err);
    return null;
  }
}