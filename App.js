import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import MedicationsScreen from './screens/MedicationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationService from './Notificationservice';

const Tab = createBottomTabNavigator();

export default function App() {
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    loadMedications();
    NotificationService.configure();
  }, []);

  const loadMedications = async () => {
    try {
      const storedMedications = await AsyncStorage.getItem('medications');
      if (storedMedications !== null) {
        const parsedMedications = JSON.parse(storedMedications);
        setMedications(parsedMedications);
        parsedMedications.forEach(med => NotificationService.scheduleNotification(med));
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const saveMedications = async (newMedications) => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(newMedications));
    } catch (error) {
      console.error('Error saving medications:', error);
    }
  };

  const handleSetMedications = (newMedications) => {
    setMedications(newMedications);
    saveMedications(newMedications);
    NotificationService.cancelAllNotifications();
    newMedications.forEach(med => NotificationService.scheduleNotification(med));
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Medications') {
              iconName = focused ? 'medical' : 'medical-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498DB',
          tabBarInactiveTintColor: '#95A5A6',
          tabBarStyle: { backgroundColor: '#2C3E50' },
          headerStyle: {
            backgroundColor: '#2C3E50',
          },
          headerTintColor: '#ECF0F1',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Home">
          {props => <HomeScreen {...props} medications={medications} setMedications={handleSetMedications} />}
        </Tab.Screen>
        <Tab.Screen name="Medications">
          {props => <MedicationsScreen {...props} medications={medications} setMedications={handleSetMedications} />}
        </Tab.Screen>
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}