import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchBeaches, SearchResult } from '../api/geocoding';
import { useBeachStore } from '../store/useBeachStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedBeach } = useBeachStore();
  const navigation = useNavigation();

  const search = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const found = await searchBeaches(text);
      setResults(found);
    } catch {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (result: SearchResult) => {
    setSelectedBeach({
      id: result.id,
      name: result.name || result.displayName.split(',')[0],
      coordinates: result.coordinates,
    });
    navigation.navigate('Home' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#546E7A" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="e.g. Bondi Beach, Pipeline..."
          placeholderTextColor="#546E7A"
          value={query}
          onChangeText={search}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#42A5F5" style={styles.loader} />}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.result} onPress={() => handleSelect(item)}>
            <Ionicons name="location" size={16} color="#42A5F5" style={styles.locIcon} />
            <View style={styles.resultText}>
              <Text style={styles.resultName} numberOfLines={1}>
                {item.name || item.displayName.split(',')[0]}
              </Text>
              <Text style={styles.resultSub} numberOfLines={1}>{item.displayName}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query.length >= 3 && !loading ? (
            <Text style={styles.empty}>No results found</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2744',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  loader: { marginLeft: 8 },
  error: {
    color: '#EF5350',
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locIcon: { marginRight: 10 },
  resultText: { flex: 1 },
  resultName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resultSub: {
    color: '#546E7A',
    fontSize: 11,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#1A2744',
    marginLeft: 42,
  },
  empty: {
    color: '#546E7A',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
