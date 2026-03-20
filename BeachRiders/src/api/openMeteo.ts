import { WindData, WeatherDay, MarineData, CurrentConditions } from '../types';
import { degreesToCardinal } from '../utils/windDirection';
import { calculateCondition } from '../utils/conditionCalculator';

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';

export async function fetchWeatherAndWind(
  latitude: number,
  longitude: number
): Promise<{ current: Omit<CurrentConditions, 'condition' | 'conditionScore'>; forecast: WeatherDay[] }> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'weathercode',
      'windspeed_10m',
      'windgusts_10m',
      'winddirection_10m',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'cloudcover_mean',
      'weathercode',
    ].join(','),
    forecast_days: '7',
    timezone: 'auto',
    windspeed_unit: 'kmh',
  });

  const res = await fetch(`${FORECAST_BASE}?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();

  const c = data.current;
  const wind: WindData = {
    speed: c.windspeed_10m,
    gusts: c.windgusts_10m,
    direction: c.winddirection_10m,
    directionLabel: degreesToCardinal(c.winddirection_10m),
  };

  const d = data.daily;
  const forecast: WeatherDay[] = d.time.map((date: string, i: number) => ({
    date,
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    precipitation: d.precipitation_sum[i],
    cloudCover: d.cloudcover_mean[i],
    weatherCode: d.weathercode[i],
  }));

  return {
    current: {
      wind,
      temperature: c.temperature_2m,
      weatherCode: c.weathercode,
      marine: {
        waveHeight: 0,
        wavePeriod: 0,
        waveDirection: 0,
        swellHeight: 0,
        swellPeriod: 0,
      },
    },
    forecast,
  };
}

export async function fetchMarineData(
  latitude: number,
  longitude: number
): Promise<MarineData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'wave_height',
      'wave_period',
      'wave_direction',
      'swell_wave_height',
      'swell_wave_period',
    ].join(','),
  });

  try {
    const res = await fetch(`${MARINE_BASE}?${params}`);
    if (!res.ok) throw new Error(`Marine API error: ${res.status}`);
    const data = await res.json();
    const c = data.current;

    return {
      waveHeight: c.wave_height ?? 0,
      wavePeriod: c.wave_period ?? 0,
      waveDirection: c.wave_direction ?? 0,
      swellHeight: c.swell_wave_height ?? 0,
      swellPeriod: c.swell_wave_period ?? 0,
    };
  } catch {
    // Marine data may not be available for all locations (inland)
    return {
      waveHeight: 0,
      wavePeriod: 0,
      waveDirection: 0,
      swellHeight: 0,
      swellPeriod: 0,
    };
  }
}

export async function fetchAllConditions(
  latitude: number,
  longitude: number
): Promise<{ current: CurrentConditions; forecast: WeatherDay[] }> {
  const [weatherResult, marine] = await Promise.all([
    fetchWeatherAndWind(latitude, longitude),
    fetchMarineData(latitude, longitude),
  ]);

  const conditionResult = calculateCondition(
    weatherResult.current.wind,
    marine,
    weatherResult.current.weatherCode
  );

  return {
    current: {
      ...weatherResult.current,
      marine,
      condition: conditionResult.level,
      conditionScore: conditionResult.score,
    },
    forecast: weatherResult.forecast,
  };
}
