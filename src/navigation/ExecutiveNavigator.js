import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExecutiveDashboard from '../screens/executive/ExecutiveDashboard';
import ExecFinance from '../screens/executive/ExecFinance';
import ManageChapters from '../screens/admin/ManageChapters';
import ManageMembers from '../screens/admin/ManageMembers';
import ManageRestaurants from '../screens/admin/ManageRestaurants';
import GlobalHistory from '../screens/admin/GlobalHistory';
import BroadcastScreen from '../screens/admin/BroadcastScreen';
import ExportReports from '../screens/admin/ExportReports';
import SettingsScreen from '../screens/other/SettingsScreen';
import NotificationsScreen from '../screens/other/NotificationsScreen';

const Stack = createStackNavigator();

export default function ExecutiveNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExecDashboard" component={ExecutiveDashboard} />
      <Stack.Screen name="ManageChapters" component={ManageChapters} />
      <Stack.Screen name="ManageMembers" component={ManageMembers} />
      <Stack.Screen name="ManageRestaurants" component={ManageRestaurants} />
      <Stack.Screen name="GlobalHistory" component={GlobalHistory} />
      <Stack.Screen name="Broadcast" component={BroadcastScreen} />
      <Stack.Screen name="ExportReports" component={ExportReports} />
      <Stack.Screen name="ExecFinance" component={ExecFinance} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
