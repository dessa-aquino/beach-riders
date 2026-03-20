import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConditionLevel } from '../types';

interface Props {
  level: ConditionLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS: Record<ConditionLevel, string> = {
  excellent: '#00C896',
  good: '#4CAF50',
  moderate: '#FFC107',
  poor: '#F44336',
};

const LABELS: Record<ConditionLevel, string> = {
  excellent: 'Excellent',
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
};

export default function ConditionBadge({ level, score, size = 'md' }: Props) {
  const color = COLORS[level];
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: color, width: isSm ? 6 : 10, height: isSm ? 6 : 10 }]} />
      <Text style={[styles.label, { color, fontSize: isSm ? 11 : isLg ? 18 : 14 }]}>
        {LABELS[level]}
      </Text>
      {score !== undefined && !isSm && (
        <Text style={[styles.score, { color, fontSize: isSm ? 10 : 12 }]}>
          {score}/100
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  dot: {
    borderRadius: 99,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  score: {
    opacity: 0.7,
    marginLeft: 2,
  },
});
