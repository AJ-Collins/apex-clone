import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: Colors[colorScheme].surfaceHighlight,
          height: Platform.OS === 'ios' ? 88 : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 6,
          paddingTop: 6,
          elevation: 8,
          borderTopWidth: StyleSheet.hairlineWidth,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -2,
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 2 : 0,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Trade',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="futures"
        options={{
          title: 'Futures',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="assets/index" options={{ href: null }} />
      <Tabs.Screen name="assets/earn" options={{ href: null }} />
      <Tabs.Screen name="assets/funding" options={{ href: null }} />
      <Tabs.Screen name="assets/spot" options={{ href: null }} />
      <Tabs.Screen name="assets/futures" options={{ href: null }} />
    </Tabs>
  );
}
