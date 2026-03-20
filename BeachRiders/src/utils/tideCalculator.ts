import { TideEvent, TideData } from '../types';

/**
 * Simplified sinusoidal tide calculation based on lunar cycle.
 * This approximates semi-diurnal tides (2 high + 2 low per ~24h50m).
 * For production accuracy, integrate a real tides API (e.g., NOAA, WorldTides).
 */

const LUNAR_DAY_MS = 24 * 60 * 60 * 1000 + 50 * 60 * 1000; // 24h 50m
const HALF_CYCLE_MS = LUNAR_DAY_MS / 2;

// Known full moon reference point: Jan 1 2000 18:00 UTC
const REFERENCE_EPOCH = new Date('2000-01-01T18:00:00Z').getTime();

export function calculateTides(
  latitude: number,
  date: Date = new Date()
): TideData {
  // Tidal amplitude varies with latitude (simplified)
  const amplitude = 1.2 + 0.8 * Math.abs(Math.sin((latitude * Math.PI) / 90));

  const events: TideEvent[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Phase offset based on longitude and lunar cycle
  const phaseOffset = ((date.getTime() - REFERENCE_EPOCH) % LUNAR_DAY_MS) / LUNAR_DAY_MS * 2 * Math.PI;

  // Generate events for the day: find high/low peaks
  for (let i = 0; i < 4; i++) {
    const cycleTime = (i * HALF_CYCLE_MS) - (phaseOffset / (2 * Math.PI)) * HALF_CYCLE_MS;
    const eventTime = new Date(startOfDay.getTime() + cycleTime);
    const isHigh = i % 2 === 0;

    if (eventTime.getDate() === startOfDay.getDate()) {
      events.push({
        time: eventTime.toISOString(),
        height: isHigh ? amplitude : 0.15,
        type: isHigh ? 'high' : 'low',
      });
    }
  }

  // Current height via cosine interpolation
  const elapsed = date.getTime() - startOfDay.getTime();
  const tidePhase = ((elapsed % LUNAR_DAY_MS) / LUNAR_DAY_MS) * 2 * Math.PI + phaseOffset;
  const currentHeight = amplitude / 2 * (1 + Math.cos(2 * tidePhase)) * 0.85 + 0.1;

  // Next event
  const now = date.getTime();
  const upcomingEvents = events
    .filter(e => new Date(e.time).getTime() > now)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const nextEvent = upcomingEvents[0] ?? events[events.length - 1];

  return {
    events: events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    currentHeight: Math.max(0.05, currentHeight),
    nextEvent,
  };
}

export function getTideHeightAt(
  targetTime: Date,
  events: TideEvent[]
): number {
  if (events.length < 2) return 0.5;
  const sorted = [...events].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const t = targetTime.getTime();
  let before = sorted[0];
  let after = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (new Date(sorted[i].time).getTime() <= t &&
        new Date(sorted[i + 1].time).getTime() >= t) {
      before = sorted[i];
      after = sorted[i + 1];
      break;
    }
  }

  const t1 = new Date(before.time).getTime();
  const t2 = new Date(after.time).getTime();
  const ratio = (t - t1) / (t2 - t1);
  // Cosine interpolation
  const cosRatio = (1 - Math.cos(ratio * Math.PI)) / 2;
  return before.height + (after.height - before.height) * cosRatio;
}
