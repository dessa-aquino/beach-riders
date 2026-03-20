import React, { useRef } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

const DAYS = buildDays(14);

export default function DateCarousel({ selectedDate, onSelectDate }: Props) {
  const listRef = useRef<FlatList>(null);
  const selectedStr = selectedDate.toDateString();

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={DAYS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.toISOString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = item.toDateString() === selectedStr;
          return (
            <TouchableOpacity
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelectDate(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {DAY_ABBREVS[item.getDay()]}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                {item.getDate()}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1426',
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2744',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 54,
  },
  pillSelected: {
    backgroundColor: '#42A5F5',
  },
  dayText: {
    color: '#90A4AE',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  selectedText: {
    color: '#FFFFFF',
  },
});
