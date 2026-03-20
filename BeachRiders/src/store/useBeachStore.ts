import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Beach, BeachData, CurrentConditions, WeatherDay } from '../types';
import { fetchAllConditions } from '../api/openMeteo';
import { calculateTides } from '../utils/tideCalculator';

const FAVORITES_KEY = '@beach_riders_favorites';

interface BeachStore {
  selectedBeach: Beach | null;
  favorites: Beach[];
  beachData: BeachData | null;
  loading: boolean;
  error: string | null;

  setSelectedBeach: (beach: Beach) => Promise<void>;
  addFavorite: (beach: Beach) => Promise<void>;
  removeFavorite: (beachId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  loadFavorites: () => Promise<void>;
}

export const useBeachStore = create<BeachStore>((set, get) => ({
  selectedBeach: null,
  favorites: [],
  beachData: null,
  loading: false,
  error: null,

  loadFavorites: async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) set({ favorites: JSON.parse(raw) });
    } catch {
      // ignore
    }
  },

  setSelectedBeach: async (beach: Beach) => {
    set({ selectedBeach: beach, loading: true, error: null });
    const { latitude, longitude } = beach.coordinates;

    try {
      const [conditionsResult, tides] = await Promise.all([
        fetchAllConditions(latitude, longitude),
        Promise.resolve(calculateTides(latitude)),
      ]);

      set({
        beachData: {
          beach,
          current: conditionsResult.current,
          tides,
          forecast: conditionsResult.forecast,
          lastUpdated: new Date().toISOString(),
        },
        loading: false,
      });
    } catch (e: any) {
      set({ loading: false, error: e.message || 'Failed to load beach data' });
    }
  },

  refreshData: async () => {
    const { selectedBeach } = get();
    if (!selectedBeach) return;
    await get().setSelectedBeach(selectedBeach);
  },

  addFavorite: async (beach: Beach) => {
    const { favorites } = get();
    if (favorites.find(f => f.id === beach.id)) return;
    const updated = [...favorites, { ...beach, isFavorite: true }];
    set({ favorites: updated });
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  },

  removeFavorite: async (beachId: string) => {
    const updated = get().favorites.filter(f => f.id !== beachId);
    set({ favorites: updated });
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  },
}));
