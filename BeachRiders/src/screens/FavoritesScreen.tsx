import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBeachStore } from '../store/useBeachStore';
import { Beach } from '../types';

interface Props {
  onSelectBeach: (beach: Beach) => void;
}

export default function FavoritesScreen({ onSelectBeach }: Props) {
  const navigation = useNavigation();
  const { favorites, removeFavorite, selectedBeach } = useBeachStore();

  const confirmRemove = (beach: Beach) => {
    Alert.alert(
      'Remove Favorite',
      `Remove ${beach.name} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(beach.id) },
      ]
    );
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={56} color="#1E3A5F" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Search for a beach and save it as a favorite for quick access.
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Search' as never)}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Find a Beach</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Beaches</Text>
      <FlatList
        data={favorites}
        keyExtractor={b => b.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const isActive = selectedBeach?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelectBeach(item)}
            >
              <View style={styles.cardLeft}>
                <Ionicons
                  name={isActive ? 'location' : 'location-outline'}
                  size={22}
                  color={isActive ? '#42A5F5' : '#546E7A'}
                />
                <View>
                  <Text style={[styles.cardName, isActive && styles.cardNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardCoords}>
                    {item.coordinates.latitude.toFixed(2)}°, {item.coordinates.longitude.toFixed(2)}°
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => confirmRemove(item)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="heart" size={20} color="#EF5350" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1426' },
  header: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  empty: {
    flex: 1,
    backgroundColor: '#0B1426',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: '#546E7A',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 8,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A2744',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: '#1565C0',
    backgroundColor: '#1A2C4A',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardName: {
    color: '#B0BEC5',
    fontSize: 15,
    fontWeight: '600',
  },
  cardNameActive: {
    color: '#FFFFFF',
  },
  cardCoords: {
    color: '#546E7A',
    fontSize: 11,
    marginTop: 2,
  },
});
