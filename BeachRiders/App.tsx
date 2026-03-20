import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SearchModal from './src/screens/SearchModal';
import { useBeachStore } from './src/store/useBeachStore';
import { Beach } from './src/types';

const Tab = createBottomTabNavigator();

export default function App() {
  const [searchVisible, setSearchVisible] = useState(false);
  const { loadFavorites, setSelectedBeach } = useBeachStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleSelectBeach = (beach: Beach) => {
    setSelectedBeach(beach);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B1426" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#42A5F5',
            background: '#0B1426',
            card: '#0F1C36',
            text: '#FFFFFF',
            border: '#1A2744',
            notification: '#42A5F5',
          },
          fonts: Platform.select({
            ios: {
              regular: { fontFamily: 'System', fontWeight: '400' as const },
              medium: { fontFamily: 'System', fontWeight: '500' as const },
              bold: { fontFamily: 'System', fontWeight: '700' as const },
              heavy: { fontFamily: 'System', fontWeight: '800' as const },
            },
            default: {
              regular: { fontFamily: 'sans-serif', fontWeight: 'normal' as const },
              medium: { fontFamily: 'sans-serif-medium', fontWeight: 'normal' as const },
              bold: { fontFamily: 'sans-serif', fontWeight: '700' as const },
              heavy: { fontFamily: 'sans-serif', fontWeight: '900' as const },
            },
          })!,
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0F1C36',
              borderTopColor: '#1A2744',
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: '#42A5F5',
            tabBarInactiveTintColor: '#546E7A',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;
              if (route.name === 'Home') {
                iconName = focused ? 'water' : 'water-outline';
              } else {
                iconName = focused ? 'heart' : 'heart-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home">
            {() => (
              <HomeScreen onOpenSearch={() => setSearchVisible(true)} />
            )}
          </Tab.Screen>
          <Tab.Screen name="Favorites">
            {() => (
              <FavoritesScreen
                onSelectBeach={handleSelectBeach}
                onOpenSearch={() => setSearchVisible(true)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </SafeAreaProvider>
  );
}
