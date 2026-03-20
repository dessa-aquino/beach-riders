import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Animated, ActivityIndicator, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBeachStore } from '../store/useBeachStore';
import ConditionBadge from '../components/ConditionBadge';
import WindCard from '../components/WindCard';
import TideChart from '../components/TideChart';
import MarineCard from '../components/MarineCard';
import WeatherForecast from '../components/WeatherForecast';
import { fetchAllConditions } from '../api/openMeteo';
import { Beach, CurrentConditions } from '../types';

interface FavHighlightsProps {
  favorites: Beach[];
  selectedDate: Date;
  onSelectBeach: (beach: Beach) => void;
}

function FavoritesHighlights({ favorites, selectedDate, onSelectBeach }: FavHighlightsProps) {
  const [conditionsCache, setConditionsCache] = useState<Record<string, CurrentConditions>>({});

  const fetchConditions = useCallback(async () => {
    const results = await Promise.allSettled(
      favorites.map(async beach => {
        // selectedDate is used as a dependency; date-aware fetching will be
        // enabled once the date param is added to fetchAllConditions
        const { current } = await fetchAllConditions(
          beach.coordinates.latitude,
          beach.coordinates.longitude,
        );
        return { id: beach.id, current };
      })
    );
    const next: Record<string, CurrentConditions> = {};
    results.forEach(r => {
      if (r.status === 'fulfilled') next[r.value.id] = r.value.current;
    });
    setConditionsCache(next);
  }, [favorites, selectedDate]);

  useEffect(() => {
    if (favorites.length > 0) fetchConditions();
  }, [fetchConditions]);

  if (favorites.length === 0) return null;

  return (
    <View style={hlStyles.section}>
      <Text style={hlStyles.sectionTitle}>Favorite Beaches</Text>
      <FlatList
        horizontal
        data={favorites}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={hlStyles.listContent}
        renderItem={({ item }) => {
          const cond = conditionsCache[item.id];
          return (
            <TouchableOpacity
              style={hlStyles.card}
              onPress={() => onSelectBeach(item)}
              activeOpacity={0.75}
            >
              <Text style={hlStyles.beachName} numberOfLines={2}>{item.name}</Text>
              {cond ? (
                <>
                  <ConditionBadge level={cond.condition} size="sm" />
                  <View style={hlStyles.statsRow}>
                    <View style={hlStyles.stat}>
                      <Ionicons name="thermometer-outline" size={13} color="#64B5F6" />
                      <Text style={hlStyles.statText}>{Math.round(cond.temperature)}°C</Text>
                    </View>
                    <View style={hlStyles.stat}>
                      <Ionicons name="water-outline" size={13} color="#64B5F6" />
                      <Text style={hlStyles.statText}>{cond.marine.waveHeight.toFixed(1)}m</Text>
                    </View>
                  </View>
                </>
              ) : (
                <ActivityIndicator size="small" color="#42A5F5" style={{ marginTop: 8 }} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function weatherIcon(code: number): keyof typeof Ionicons.glyphMap {
  if (code === 0) return 'sunny';
  if (code <= 2) return 'partly-sunny';
  if (code <= 3) return 'cloudy';
  if (code <= 49) return 'cloud';
  if (code <= 69) return 'rainy';
  if (code <= 79) return 'snow';
  if (code <= 82) return 'rainy';
  return 'thunderstorm';
}

export default function HomeScreen() {
  const {
    beachData, loading, error, refreshData, selectedBeach,
    favorites, selectedDate, setSelectedBeach,
  } = useBeachStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (beachData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [beachData]);

  if (!selectedBeach) {
    return (
      <LinearGradient colors={['#0B1426', '#0D1F3C']} style={styles.emptyContainer}>
        <Ionicons name="water" size={64} color="#1E3A5F" />
        <Text style={styles.emptyTitle}>Beach Riders</Text>
        <Text style={styles.emptySubtitle}>Search for a beach to get started</Text>
        <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search' as never)}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.searchBtnText}>Find a Beach</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const lastUpdated = beachData?.lastUpdated
    ? new Date(beachData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} tintColor="#42A5F5" />
      }
    >
      {/* Header */}
      <LinearGradient colors={['#0B1426', '#0D1F3C']} style={styles.header}>
        <TouchableOpacity style={styles.locationRow} onPress={() => navigation.navigate('Search' as never)}>
          <Ionicons name="location" size={18} color="#42A5F5" />
          <Text style={styles.beachName} numberOfLines={1}>{selectedBeach.name}</Text>
          <Ionicons name="chevron-down" size={16} color="#42A5F5" />
        </TouchableOpacity>
        {lastUpdated && (
          <Text style={styles.updated}>Updated {lastUpdated}</Text>
        )}
      </LinearGradient>

      {loading && !beachData && (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#42A5F5" />
          <Text style={styles.loadingText}>Loading conditions...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={16} color="#EF5350" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refreshData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {beachData && (
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          {/* Condition hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroTemp}>
                  {Math.round(beachData.current.temperature)}°C
                </Text>
                <Ionicons
                  name={weatherIcon(beachData.current.weatherCode)}
                  size={32}
                  color="#64B5F6"
                  style={{ marginTop: 4 }}
                />
              </View>
              <View style={styles.heroRight}>
                <ConditionBadge
                  level={beachData.current.condition}
                  score={beachData.current.conditionScore}
                  size="lg"
                />
              </View>
            </View>

            <View style={styles.sportRow}>
              <View style={styles.sportBadge}>
                <Text style={styles.sportIcon}>🏄</Text>
                <Text style={styles.sportLabel}>Surf</Text>
              </View>
              <View style={styles.sportBadge}>
                <Text style={styles.sportIcon}>🪁</Text>
                <Text style={styles.sportLabel}>Kite</Text>
              </View>
            </View>
          </View>

          <WindCard wind={beachData.current.wind} />
          <MarineCard marine={beachData.current.marine} />
          <TideChart tides={beachData.tides} />
          <WeatherForecast forecast={beachData.forecast} />

          <FavoritesHighlights
            favorites={favorites}
            selectedDate={selectedDate}
            onSelectBeach={setSelectedBeach}
          />

          <View style={{ height: 24 }} />
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0B1426' },
  content: { paddingBottom: 20 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySubtitle: {
    color: '#546E7A',
    fontSize: 16,
    textAlign: 'center',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    marginTop: 16,
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beachName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  updated: { color: '#546E7A', fontSize: 11, marginTop: 4, marginLeft: 24 },
  loadingCenter: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: { color: '#546E7A', fontSize: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1010',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  errorText: { color: '#EF5350', flex: 1, fontSize: 13 },
  retryText: { color: '#42A5F5', fontWeight: '600' },
  heroCard: {
    backgroundColor: '#1A2744',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTemp: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
  },
  heroRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  sportRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#263254',
    paddingTop: 12,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1C36',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  sportIcon: { fontSize: 14 },
  sportLabel: { color: '#B0BEC5', fontSize: 12, fontWeight: '600' },
});

const hlStyles = StyleSheet.create({
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    color: '#B0BEC5',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: 160,
    backgroundColor: '#1A2744',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#263254',
  },
  beachName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: '#90A4AE',
    fontSize: 12,
    fontWeight: '600',
  },
});
