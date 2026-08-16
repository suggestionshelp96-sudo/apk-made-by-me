import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const icons: Record<string, any> = { home: 'home', steps: 'walk', workout: 'flame', habits: 'checkmark-done', body: 'body' };
  const labels: Record<string, string> = { home: t('home'), steps: t('steps'), workout: t('workout'), habits: t('habits'), body: t('body') };

  return (
    <View style={[styles.tabWrap, { backgroundColor: theme.bgElev, borderColor: theme.cardBorder, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route: any, i: number) => {
        const focused = state.index === i;
        const label = labels[route.name] || route.name;
        return (
          <Pressable
            key={route.key}
            onPress={() => { const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!focused && !e.defaultPrevented) navigation.navigate(route.name); }}
            style={styles.tabItem}
            testID={`tab-${route.name}`}
          >
            <View style={[styles.tabIcon, focused && { backgroundColor: theme.primary + '22', shadowColor: theme.glow, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8 }]}>
              <Ionicons name={icons[route.name] || 'ellipse'} size={22} color={focused ? theme.primary : theme.textMuted} />
            </View>
            <Text style={{ fontSize: 10, color: focused ? theme.primary : theme.textFaint, marginTop: 4, fontWeight: focused ? '700' : '500' }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="steps" options={{ title: 'Steps' }} />
      <Tabs.Screen name="workout" options={{ title: 'Workout' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="body" options={{ title: 'Body' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabWrap: { flexDirection: 'row', paddingTop: 10, paddingHorizontal: 8, borderTopWidth: 1 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
