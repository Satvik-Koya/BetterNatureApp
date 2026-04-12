import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PresidentDashboard from '../screens/president/PresidentDashboard';
import PresEvents from '../screens/president/PresEvents';
import PresReports from '../screens/president/PresReports';
import ChapterChecklist from '../screens/chapter/ChapterChecklist';
import ManageMembers from '../screens/admin/ManageMembers';
import BroadcastScreen from '../screens/admin/BroadcastScreen';
import SettingsScreen from '../screens/other/SettingsScreen';
import NotificationsScreen from '../screens/other/NotificationsScreen';

const Stack = createStackNavigator();

// President sees a chapter-scoped subset of admin tools.
// Reuses several admin screens; routes are aliased so the dashboard can use
// president-flavored names without colliding with executive navigator routes.
export default function PresidentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PresDashboard" component={PresidentDashboard} />
      <Stack.Screen name="ChapterChecklist" component={ChapterChecklist} />
      <Stack.Screen name="PresMembers" component={ManageMembers} />
      <Stack.Screen name="PresBroadcast" component={BroadcastScreen} />
      <Stack.Screen name="PresEvents" component={PresEvents} />
      <Stack.Screen name="PresReports" component={PresReports} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
