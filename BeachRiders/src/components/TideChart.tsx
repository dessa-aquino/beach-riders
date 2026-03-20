import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TideData } from '../types';
import { getTideHeightAt } from '../utils/tideCalculator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 120;
const PAD_X = 32;
const PAD_Y = 16;

interface Props {
  tides: TideData;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function TideChart({ tides }: Props) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const maxHeight = Math.max(...tides.events.map(e => e.height), 1.5);

  // Generate smooth curve points (every 30 min)
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let min = 0; min <= 1440; min += 15) {
      const t = new Date(startOfDay.getTime() + min * 60000);
      const h = getTideHeightAt(t, tides.events);
      const x = PAD_X + ((min / 1440) * (CHART_WIDTH - PAD_X * 2));
      const y = PAD_Y + ((1 - h / maxHeight) * (CHART_HEIGHT - PAD_Y * 2));
      pts.push({ x, y });
    }
    return pts;
  }, [tides.events]);

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const fillD = `${pathD} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  // Current time position
  const nowMin = (now.getHours() * 60 + now.getMinutes());
  const nowX = PAD_X + ((nowMin / 1440) * (CHART_WIDTH - PAD_X * 2));
  const nowH = getTideHeightAt(now, tides.events);
  const nowY = PAD_Y + ((1 - nowH / maxHeight) * (CHART_HEIGHT - PAD_Y * 2));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tides</Text>
        <Text style={styles.current}>
          Current: <Text style={styles.currentVal}>{tides.currentHeight.toFixed(2)}m</Text>
        </Text>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1E88E5" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#1E88E5" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Fill area */}
        <Path d={fillD} fill="url(#tideGrad)" />
        {/* Line */}
        <Path d={pathD} stroke="#42A5F5" strokeWidth={2} fill="none" />

        {/* Now indicator */}
        <Line x1={nowX} y1={PAD_Y - 4} x2={nowX} y2={CHART_HEIGHT - PAD_Y + 4}
          stroke="#FFD54F" strokeWidth={1.5} strokeDasharray="4,3" />
        <Circle cx={nowX} cy={nowY} r={5} fill="#FFD54F" />

        {/* Tide event labels */}
        {tides.events.map((event, i) => {
          const t = new Date(event.time);
          const min = t.getHours() * 60 + t.getMinutes();
          const ex = PAD_X + ((min / 1440) * (CHART_WIDTH - PAD_X * 2));
          const ey = PAD_Y + ((1 - event.height / maxHeight) * (CHART_HEIGHT - PAD_Y * 2));
          const isHigh = event.type === 'high';
          return (
            <React.Fragment key={i}>
              <Circle cx={ex} cy={ey} r={4} fill={isHigh ? '#64B5F6' : '#90A4AE'} />
              <SvgText
                x={ex}
                y={isHigh ? ey - 8 : ey + 14}
                textAnchor="middle"
                fill={isHigh ? '#64B5F6' : '#90A4AE'}
                fontSize={9}
              >
                {event.height.toFixed(1)}m
              </SvgText>
              <SvgText
                x={ex}
                y={isHigh ? ey - 18 : ey + 24}
                textAnchor="middle"
                fill="#607D8B"
                fontSize={8}
              >
                {formatTime(event.time)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Time axis */}
      <View style={styles.timeAxis}>
        {['00:00', '06:00', '12:00', '18:00', '24:00'].map(t => (
          <Text key={t} style={styles.timeLabel}>{t}</Text>
        ))}
      </View>

      {/* Next tide */}
      <View style={styles.nextTide}>
        <Text style={styles.nextLabel}>
          Next {tides.nextEvent.type === 'high' ? '▲ High' : '▼ Low'} tide
        </Text>
        <Text style={styles.nextVal}>
          {formatTime(tides.nextEvent.time)} — {tides.nextEvent.height.toFixed(2)}m
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2744',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '600',
  },
  current: {
    color: '#B0BEC5',
    fontSize: 13,
  },
  currentVal: {
    color: '#FFD54F',
    fontWeight: '700',
  },
  timeAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: PAD_X - 10,
  },
  timeLabel: {
    color: '#546E7A',
    fontSize: 9,
  },
  nextTide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#263254',
  },
  nextLabel: {
    color: '#90A4AE',
    fontSize: 12,
  },
  nextVal: {
    color: '#42A5F5',
    fontSize: 12,
    fontWeight: '600',
  },
});
