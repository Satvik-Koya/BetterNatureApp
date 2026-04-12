import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupStep1 from '../screens/auth/SignupStep1';
import SignupStep2 from '../screens/auth/SignupStep2';
import SignupStep3 from '../screens/auth/SignupStep3';
import StartChapter from '../screens/chapter/StartChapter';

// NOTE: RestaurantSignup is intentionally NOT exposed here. Restaurants are
// onboarded manually by the org and receive login credentials directly. The
// president and executive portals are also gated behind login (no public
// portal cards on the welcome screen).

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupStep1" component={SignupStep1} />
      <Stack.Screen name="SignupStep2" component={SignupStep2} />
      <Stack.Screen name="SignupStep3" component={SignupStep3} />
      <Stack.Screen name="StartChapter" component={StartChapter} />
    </Stack.Navigator>
  );
}
