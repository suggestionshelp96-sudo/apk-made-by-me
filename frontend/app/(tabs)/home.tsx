import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';

import { useTheme } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { StepRing, GlassCard, StatCard, LineChart, AdBanner, NativeAdCard, Sheet, PillButton } from '@/src/components/ui';
import { trackInteraction, maybeShowInterstitial } from '@/src/ads/manager';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { state, today, setSteps, resetToday, getStreak } = useStore();
  const t0 = today();
  const [confirmReset, setConfirmReset] = useState(false);

  const openDetail = (route: string) => {
    trackInteraction();
    maybeShowInterstitial(`open:${route}`);
    router.push(route as any);
  };

  // Real pedometer subscription
  useEffect(() => {
    let sub: any;
    let baseline = 0;
    let base0 = t0.steps;
    (async () => {
      try {
        const avail = await Pedometer.isAvailableAsync();
        if (!avail) return;
        sub = Pedometer.watchStepCount((r) => {
          if (baseline === 0) baseline = r.steps;
          const delta = r.steps - baseline;
          setSteps(base0 + Math.max(0, delta));
        });
      } catch {}
    })();
    return () => { sub && sub.remove && sub.remove(); };
  }, []); // eslint-disable-line

  const week = last7Days(state.days);
  const weekTotal = week.reduce((a, d) => a + d.steps, 0);
  const streak = getStreak();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="home-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '33', borderColor: theme.primary }]}>
              <Ionicons name="person" size={22} color={theme.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>{t('hi')}, {state.profile.name} 👋</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>{t('welcomeBack')}</Text>
            </View>
          </View>
          <View style={[styles.streakChip, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '55' }]}>
            <Ionicons name="flame" size={14} color={theme.primary} />
            <Text style={{ color: theme.primary, fontWeight: '800', marginLeft: 4, fontSize: 13 }}>{streak}</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={styles.iconBtn} testID="home-settings-icon">
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </Pressable>
        </View>

        {/* Step ring card */}
        <View style={{ paddingHorizontal: 16 }}>
          <GlassCard glow style={{ alignItems: 'center', paddingVertical: 24 }} testID="home-ring-card">
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ color: theme.textMuted, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>{t('dailyGoal')}</Text>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginTop: 2 }}>{state.settings.stepGoal.toLocaleString()} {t('stepsLabel').toLowerCase()}</Text>
              </View>
              <Pressable onPress={() => router.push('/settings/step-goal')} style={[styles.editChip, { borderColor: theme.cardBorder }]} testID="home-edit-goal">
                <Ionicons name="create-outline" size={14} color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>{t('editGoal')}</Text>
              </Pressable>
            </View>
            <StepRing steps={t0.steps} goal={state.settings.stepGoal} />
          </GlassCard>
        </View>

        {/* 2x2 stat cards - full width */}
        <View style={{ paddingHorizontal: 16, marginTop: 16, flexDirection: 'row', gap: 12 }}>
          <StatCard icon="flame" label={t('calories')} value={`${t0.caloriesBurned}`} sublabel="kcal" onPress={() => openDetail('/detail/calories')} testID="stat-calories" />
          <StatCard icon="location" label={t('distance')} value={t0.distanceKm.toFixed(2)} sublabel="km" onPress={() => openDetail('/detail/distance')} testID="stat-distance" />
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', gap: 12 }}>
          <StatCard icon="water" label={t('hydration')} value={`${Math.round(t0.water/100)/10}`} sublabel={`/ ${state.settings.waterGoalMl/1000}L`} onPress={() => openDetail('/detail/hydration')} testID="stat-hydration" color={theme.info} />
          <StatCard icon="moon" label={t('sleep')} value={`${Math.floor(t0.sleepMin/60)}h ${t0.sleepMin%60}m`} sublabel={t('lastNight')} onPress={() => openDetail('/detail/sleep')} testID="stat-sleep" color={theme.secondary} />
        </View>

        {/* Weekly progress */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <GlassCard testID="home-weekly-card">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>{t('weeklyProgress')}</Text>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>{t('avg')} {Math.round(weekTotal/7).toLocaleString()}</Text>
            </View>
            <LineChart series={week.map((d, i) => ({ label: ['S','M','T','W','T','F','S'][new Date(d.date).getDay()], value: d.steps }))} />
          </GlassCard>
        </View>

        {/* Native ad - non-critical section below weekly progress */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <NativeAdCard testID="home-native-ad" />
        </View>

        {/* Daily Goals */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>{t('dailyGoals')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/habits')}><Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>{t('viewAll')}</Text></Pressable>
          </View>
          <GlassCard style={{ padding: 0 }}>
            {[
              { icon: 'water' as const, key: 'water', label: t('waterGoal'), value: `${Math.round(t0.water/100)/10} / ${state.settings.waterGoalMl/1000} L`, color: theme.info, route: '/detail/hydration' },
              { icon: 'moon' as const, key: 'sleep', label: t('sleepGoal'), value: `${Math.floor(t0.sleepMin/60)}h / ${state.settings.sleepGoalHr}h`, color: theme.secondary, route: '/detail/sleep' },
              { icon: 'walk' as const, key: 'step', label: t('stepGoal'), value: `${t0.steps.toLocaleString()} / ${(state.settings.stepGoal/1000).toFixed(0)}K`, color: theme.primary, route: '/(tabs)/steps' },
            ].map((g, i) => (
              <Pressable key={i} onPress={() => router.push(g.route as any)} style={[styles.goalRow, { borderBottomColor: theme.divider, borderBottomWidth: i < 2 ? StyleSheet.hairlineWidth : 0 }]} testID={`goal-${g.key}`}>
                <View style={[styles.goalIcon, { backgroundColor: g.color + '22' }]}><Ionicons name={g.icon} size={18} color={g.color} /></View>
                <Text style={{ color: theme.text, flex: 1, marginLeft: 12, fontWeight: '600', fontSize: 14 }}>{g.label}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>{g.value}</Text>
              </Pressable>
            ))}
          </GlassCard>
        </View>

        <AdBanner />

        {/* Reset button */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable onPress={() => setConfirmReset(true)} testID="home-reset-button" style={[styles.resetBtn, { borderColor: theme.danger + '55' }]}>
            <Ionicons name="refresh" size={16} color={theme.danger} />
            <Text style={{ color: theme.danger, marginLeft: 8, fontWeight: '700' }}>{t('resetToday')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Sheet visible={confirmReset} onClose={() => setConfirmReset(false)} title={t('resetTitle')}>
        <Text style={{ color: theme.textMuted, marginBottom: 20 }}>{t('resetBody')}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><PillButton label={t('cancel')} onPress={() => setConfirmReset(false)} variant="ghost" testID="reset-cancel" /></View>
          <View style={{ flex: 1 }}><PillButton label={t('reset')} onPress={() => { resetToday(); setConfirmReset(false); }} variant="danger" testID="reset-confirm" /></View>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  streakChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  editChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  goalRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  goalIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 999, borderWidth: 1 },
});
