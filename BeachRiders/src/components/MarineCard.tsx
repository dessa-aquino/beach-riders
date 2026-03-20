import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarineData } from '../types';
import { degreesToCardinal } from '../utils/windDirection';

interface Props {
  marine: MarineData;
}

function waveQuality(height: number, period: number): string {
  if (height < 0.3) return 'Flat';
  if (height > 3) return 'Massive';
  if (period > 12 && height > 0.8) return 'Clean';
  if (period < 6) return 'Choppy';
  return 'Average';
}

export default function MarineCard({ marine }: Props) {
  const quality = waveQuality(marine.waveHeight, marine.wavePeriod);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="water" size={18} color="#42A5F5" />
        <Text style={styles.title}>Waves & Swell</Text>
        <Text style={styles.quality}>{quality}</Text>
      </View>

      <View style={styles.grid}>
        <Stat label="Wave Height" value={`${marine.waveHeight.toFixed(1)}m`} />
        <Stat label="Wave Period" value={`${marine.wavePeriod.toFixed(0)}s`} />
        <Stat label="Swell Height" value={`${marine.swellHeight.toFixed(1)}m`} />
        <Stat label="Wave Dir" value={degreesToCardinal(marine.waveDirection)} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A2744',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  title: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  quality: {
    color: '#42A5F5',
    fontSize: 12,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    width: '45%',
    backgroundColor: '#0F1C36',
    borderRadius: 10,
    padding: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#546E7A',
    fontSize: 11,
    marginTop: 2,
  },
});
