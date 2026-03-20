import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WindData } from '../types';
import { beaufortScale } from '../utils/windDirection';

interface Props {
  wind: WindData;
}

export default function WindCard({ wind }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="flag" size={18} color="#64B5F6" />
        <Text style={styles.title}>Wind</Text>
        <Text style={styles.beaufort}>{beaufortScale(wind.speed)}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.value}>{Math.round(wind.speed)}</Text>
          <Text style={styles.unit}>km/h</Text>
          <Text style={styles.label}>Speed</Text>
        </View>

        <View style={styles.compass}>
          <View
            style={[
              styles.arrow,
              { transform: [{ rotate: `${wind.direction}deg` }] },
            ]}
          >
            <Ionicons name="arrow-up" size={32} color="#64B5F6" />
          </View>
          <Text style={styles.dirLabel}>{wind.directionLabel}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.value}>{Math.round(wind.gusts)}</Text>
          <Text style={styles.unit}>km/h</Text>
          <Text style={styles.label}>Gusts</Text>
        </View>
      </View>
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
  beaufort: {
    color: '#64B5F6',
    fontSize: 12,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  unit: {
    color: '#90A4AE',
    fontSize: 12,
    marginTop: -4,
  },
  label: {
    color: '#64788A',
    fontSize: 11,
    marginTop: 4,
  },
  compass: {
    alignItems: 'center',
    width: 64,
  },
  arrow: {
    marginBottom: 4,
  },
  dirLabel: {
    color: '#64B5F6',
    fontSize: 16,
    fontWeight: '700',
  },
});
