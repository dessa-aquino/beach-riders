import { Beach, Coordinates } from '../types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  coordinates: Coordinates;
}

export async function searchBeaches(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: `${query} beach`,
    format: 'json',
    limit: '8',
    addressdetails: '1',
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'BeachRiders/1.0' },
  });
  if (!res.ok) throw new Error('Geocoding API error');

  const results = await res.json();
  return results.map((r: any) => ({
    id: String(r.place_id),
    name: r.name || query,
    displayName: r.display_name,
    coordinates: {
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    },
  }));
}

export async function reverseGeocode(coords: Coordinates): Promise<string> {
  const params = new URLSearchParams({
    lat: String(coords.latitude),
    lon: String(coords.longitude),
    format: 'json',
  });

  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'BeachRiders/1.0' },
  });
  if (!res.ok) return 'Current Location';

  const data = await res.json();
  return (
    data.address?.beach ||
    data.address?.suburb ||
    data.address?.city ||
    data.address?.county ||
    'Current Location'
  );
}
