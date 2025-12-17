import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { Colors } from '../../src/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32', // Emerald Green for active
        tabBarInactiveTintColor: '#757575', // Gray for inactive
        headerShown: true,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // slightly transparent white
          },
          default: {
            backgroundColor: '#ffffff',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Import',
          tabBarLabel: 'Scanner',
          headerTitle: 'Allergen Scanner',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="barcode-scan" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="history" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="account" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
    </Tabs>
  );
}
