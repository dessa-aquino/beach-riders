export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Beach {
  id: string;
  name: string;
  coordinates: Coordinates;
  isFavorite?: boolean;
}

export type ConditionLevel = 'excellent' | 'good' | 'moderate' | 'poor';

export interface WindData {
  speed: number; // km/h
  gusts: number; // km/h
  direction: number; // degrees
  directionLabel: string;
}

export interface TideEvent {
  time: string; // ISO string
  height: number; // meters
  type: 'high' | 'low';
}

export interface TideData {
  events: TideEvent[];
  currentHeight: number;
  nextEvent: TideEvent;
}

export interface WeatherDay {
  date: string; // ISO date
  tempMax: number;
  tempMin: number;
  precipitation: number; // mm
  cloudCover: number; // %
  weatherCode: number;
}

export interface MarineData {
  waveHeight: number; // meters
  wavePeriod: number; // seconds
  waveDirection: number; // degrees
  swellHeight: number;
  swellPeriod: number;
}

export interface CurrentConditions {
  wind: WindData;
  marine: MarineData;
  temperature: number;
  weatherCode: number;
  condition: ConditionLevel;
  conditionScore: number;
}

export interface BeachData {
  beach: Beach;
  current: CurrentConditions;
  tides: TideData;
  forecast: WeatherDay[];
  lastUpdated: string;
}
