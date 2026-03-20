import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Animated, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBeachStore } from '../store/useBeachStore';
import ConditionBadge from '../components/ConditionBadge';
import WindCard from '../components/WindCard';
import TideChart from '../components/TideChart';
import MarineCard from '../components/MarineCard';
import WeatherForecast from '../components/WeatherForecast';

interface Props {
  onOpenSearch: () => void;
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

export default function HomeScreen({ onOpenSearch }: Props) {
  const { beachData, loading, error, refreshData, selectedBeach } = useBeachStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        <TouchableOpacity style={styles.searchBtn} onPress={onOpenSearch}>
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
        <TouchableOpacity style={styles.locationRow} onPress={onOpenSearch}>
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
