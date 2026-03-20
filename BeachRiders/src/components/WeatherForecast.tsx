import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherDay } from '../types';

interface Props {
  forecast: WeatherDay[];
}

function weatherIcon(code: number): keyof typeof Ionicons.glyphMap {
  if (code === 0) return 'sunny';
  if (code <= 2) return 'partly-sunny';
  if (code <= 3) return 'cloudy';
  if (code <= 49) return 'cloud'; // fog/mist
  if (code <= 59) return 'rainy';
  if (code <= 69) return 'rainy';
  if (code <= 79) return 'snow';
  if (code <= 82) return 'rainy';
  if (code <= 84) return 'snow';
  if (code <= 99) return 'thunderstorm';
  return 'cloud';
}

function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly Cloudy';
  if (code <= 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 84) return 'Snow';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  return d.toLocaleDateString('en', { weekday: 'short' });
}

export default function WeatherForecast({ forecast }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>7-Day Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {forecast.map((day, i) => (
          <View key={i} style={styles.dayCard}>
            <Text style={styles.day}>{formatDay(day.date)}</Text>
            <Ionicons
              name={weatherIcon(day.weatherCode)}
              size={22}
              color="#64B5F6"
              style={styles.icon}
            />
            <Text style={styles.desc}>{weatherLabel(day.weatherCode)}</Text>
            <Text style={styles.maxTemp}>{Math.round(day.tempMax)}°</Text>
            <Text style={styles.minTemp}>{Math.round(day.tempMin)}°</Text>
            {day.precipitation > 0 && (
              <View style={styles.rain}>
                <Ionicons name="water" size={10} color="#42A5F5" />
                <Text style={styles.rainText}>{day.precipitation.toFixed(1)}mm</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2744',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayCard: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#0F1C36',
    borderRadius: 12,
  },
  day: {
    color: '#90A4AE',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  icon: {
    marginVertical: 6,
  },
  desc: {
    color: '#607D8B',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 6,
  },
  maxTemp: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  minTemp: {
    color: '#546E7A',
    fontSize: 12,
    marginTop: 1,
  },
  rain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  rainText: {
    color: '#42A5F5',
    fontSize: 9,
  },
});
