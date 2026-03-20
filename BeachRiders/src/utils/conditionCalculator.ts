import { ConditionLevel, WindData, MarineData } from '../types';

interface ConditionResult {
  level: ConditionLevel;
  score: number; // 0-100
  label: string;
  surferLabel: string;
  kiterLabel: string;
}

/**
 * Calculates overall beach condition based on wind, wave, and weather data.
 * Each sport has different ideal conditions:
 * - Surf: moderate onshore wind, wave height 1-2.5m, period 8-14s
 * - Kite: wind 15-35 km/h, steady (low gust delta)
 */
export function calculateCondition(
  wind: WindData,
  marine: MarineData,
  weatherCode: number
): ConditionResult {
  let score = 100;

  // --- Wind penalties ---
  if (wind.speed < 5) score -= 10; // too calm
  if (wind.speed > 50) score -= 40; // dangerous
  else if (wind.speed > 35) score -= 20;

  const gustDelta = wind.gusts - wind.speed;
  if (gustDelta > 20) score -= 20; // very gusty
  else if (gustDelta > 10) score -= 10;

  // --- Wave penalties ---
  if (marine.waveHeight < 0.3) score -= 20; // flat
  if (marine.waveHeight > 4) score -= 35; // too big
  else if (marine.waveHeight > 2.5) score -= 15;

  if (marine.wavePeriod < 5) score -= 15; // choppy
  if (marine.wavePeriod > 18) score -= 10; // closeout risk

  // --- Weather penalties ---
  const severeWeather = [95, 96, 99, 65, 67, 75, 82];
  if (severeWeather.includes(weatherCode)) score -= 40;
  const moderateWeather = [61, 63, 71, 73, 80, 81];
  if (moderateWeather.includes(weatherCode)) score -= 15;

  score = Math.max(0, Math.min(100, score));

  let level: ConditionLevel;
  let label: string;
  if (score >= 80) { level = 'excellent'; label = 'Excellent'; }
  else if (score >= 60) { level = 'good'; label = 'Good'; }
  else if (score >= 35) { level = 'moderate'; label = 'Moderate'; }
  else { level = 'poor'; label = 'Poor'; }

  // Sport-specific labels
  const surferScore = getSurferScore(wind, marine);
  const kiterScore = getKiterScore(wind);

  return {
    level,
    score,
    label,
    surferLabel: rateLabel(surferScore),
    kiterLabel: rateLabel(kiterScore),
  };
}

function getSurferScore(wind: WindData, marine: MarineData): number {
  let s = 100;
  // Ideal wave height 0.8–2.5m
  if (marine.waveHeight < 0.5) s -= 40;
  else if (marine.waveHeight < 0.8) s -= 20;
  else if (marine.waveHeight > 3) s -= 30;
  else if (marine.waveHeight > 2.5) s -= 10;
  // Ideal period 8–14s
  if (marine.wavePeriod < 6) s -= 30;
  else if (marine.wavePeriod < 8) s -= 15;
  else if (marine.wavePeriod > 16) s -= 10;
  // Wind: offshore (180-360) better for surf
  if (wind.speed > 30) s -= 20;
  return Math.max(0, s);
}

function getKiterScore(wind: WindData): number {
  let s = 100;
  // Ideal 15–35 km/h
  if (wind.speed < 12) s -= 50;
  else if (wind.speed < 15) s -= 25;
  else if (wind.speed > 40) s -= 40;
  else if (wind.speed > 35) s -= 20;
  // Gust consistency
  const delta = wind.gusts - wind.speed;
  if (delta > 15) s -= 30;
  else if (delta > 8) s -= 15;
  return Math.max(0, s);
}

function rateLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 55) return 'Good';
  if (score >= 35) return 'Moderate';
  return 'Poor';
}
