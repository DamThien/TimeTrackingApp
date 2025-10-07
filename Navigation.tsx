// Navigation.tsx
import React from 'react';
import { useColorScheme } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from './Screens/HomeScreen';
import ReportScreen from './Screens/ReportScreen';

const Tab = createMaterialTopTabNavigator();

const lightTheme = {
  background: '#fff',
  text: '#000',
  inputBackground: '#fff',
  rowBackground: '#e0f7fa',
  borderColor: '#ccc',
  tabBackground: '#1E90FF',
  tabIndicator: 'yellow',
  tabTextActive: 'white',
  tabTextInactive: '#ddd',
};

const darkTheme = {
  background: '#121212',
  text: '#fff',
  inputBackground: '#1e1e1e',
  rowBackground: '#1a2a2a',
  borderColor: '#444',
  tabBackground: '#333',
  tabIndicator: '#00bcd4',
  tabTextActive: '#fff',
  tabTextInactive: '#888',
};

export default function Navigation() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.tabBackground,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 14,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.tabIndicator,
          height: 3,
        },
        tabBarActiveTintColor: theme.tabTextActive,
        tabBarInactiveTintColor: theme.tabTextInactive,
      }}
    >
      <Tab.Screen name="Công tháng này" component={HomeScreen} />
      <Tab.Screen name="Công cũ" component={ReportScreen} />
    </Tab.Navigator>
  );
}
