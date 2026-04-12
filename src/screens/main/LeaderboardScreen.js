import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Type, Radius, Shadows } from '../../config/theme';
import BrushText from '../../components/ui/BrushText';
import ResponsiveContainer from '../../components/ui/ResponsiveContainer';
import useBreakpoint from '../../hooks/useBreakpoint';
import useAuthStore from '../../store/authStore';
import { fetchLeaderboard } from '../../services/database';

// Filter option lists — kept at module scope so the chip rows aren't
// recreated on every render.
const TIME_FILTERS = [
  { key: 'all', label: 'All time' },
  { key: 'year', label: 'Year' },
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
];

const PROJECT_FILTERS = [
  { key: 'all', label: 'All', color: Colors.green },
  { key: 'iris', label: 'IRIS', color: Colors.sage },
  { key: 'evergreen', label: 'Evergreen', color: Colors.green },
  { key: 'hydro', label: 'Hydro', color: Colors.skyDark || Colors.sky },
];

const SORT_FILTERS = [
  { key: 'overall', label: 'Overall' },
  { key: 'meals', label: 'Meals' },
  { key: 'hours', label: 'Hours' },
  { key: 'events', label: 'Events' },
  { key: 'raised', label: 'Raised' },
];

function fmt(n) {
  return Number(n || 0).toLocaleString();
}

function fmtMoney(n) {
  return `$${fmt(n)}`;
}

function metricValue(row, sortBy) {
  if (sortBy === 'raised') return fmtMoney(row.raised);
  if (sortBy === 'overall') return fmt(row.score);
  return fmt(row[sortBy]);
}

function metricLabel(sortBy) {
  if (sortBy === 'overall') return 'pts';
  if (sortBy === 'raised') return '';
  return sortBy;
}

// Embeddable body — used both by the standalone screen and by ImpactScreen
// when the leaderboard is rendered inline beneath the badges. Renders no
// scroll container of its own so it can sit inside any parent ScrollView.
export function LeaderboardBody({ embedded = false }) {
  const user = useAuthStore((s) => s.user);
  const { isWide } = useBreakpoint();

  const [timeRange, setTimeRange] = useState('all');
  const [project, setProject] = useState('all');
  const [sortBy, setSortBy] = useState('overall');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard({ timeRange, project, sortBy });
      setRows(data);
    } catch (e) {}
    setLoading(false);
  }, [timeRange, project, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);
  const rest = useMemo(() => rows.slice(3), [rows]);
  const myRow = useMemo(
    () => rows.find((r) => r.user_id === user?.id),
    [rows, user]
  );

  return (
    <View>
      {!embedded && (
        <>
          <BrushText variant="screenTitle" style={styles.title}>
            Leaderboard
          </BrushText>
          <Text style={styles.subtitle}>
            See who's making the biggest impact across Better Nature.
          </Text>
        </>
      )}

      <FilterRow
        label="Time"
        options={TIME_FILTERS}
        value={timeRange}
        onChange={setTimeRange}
      />
      <FilterRow
        label="Project"
        options={PROJECT_FILTERS}
        value={project}
        onChange={setProject}
        colorize
      />
      <FilterRow
        label="Sort by"
        options={SORT_FILTERS}
        value={sortBy}
        onChange={setSortBy}
      />

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.green} />
        </View>
      )}

      {!loading && rows.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyText}>
            No activity matches these filters yet. Try widening the time
            range or picking a different project.
          </Text>
        </View>
      )}

      {!loading && top3.length > 0 && (
        <View style={styles.podiumWrap}>
          {top3[1] && (
            <PodiumCard
              rank={2}
              row={top3[1]}
              sortBy={sortBy}
              color={Colors.grayMid}
              height={120}
            />
          )}
          {top3[0] && (
            <PodiumCard
              rank={1}
              row={top3[0]}
              sortBy={sortBy}
              color="#E8B931"
              height={150}
            />
          )}
          {top3[2] && (
            <PodiumCard
              rank={3}
              row={top3[2]}
              sortBy={sortBy}
              color="#C97A3D"
              height={100}
            />
          )}
        </View>
      )}

      {myRow && (
        <View style={styles.youCard}>
          <Text style={styles.youLabel}>YOUR RANK</Text>
          <View style={styles.youRow}>
            <Text style={styles.youRank}>#{myRow.rank}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.youName}>{myRow.name}</Text>
              <Text style={styles.youChapter}>{myRow.chapter}</Text>
            </View>
            <View style={styles.youMetric}>
              <Text style={styles.youValue}>{metricValue(myRow, sortBy)}</Text>
              <Text style={styles.youUnit}>{metricLabel(sortBy)}</Text>
            </View>
          </View>
        </View>
      )}

      {!loading && rest.length > 0 && (
        <View style={[styles.list, isWide && styles.listWide]}>
          {rest.map((row) => (
            <LeaderboardRow
              key={row.user_id}
              row={row}
              sortBy={sortBy}
              isMe={row.user_id === user?.id}
              wide={isWide}
            />
          ))}
        </View>
      )}

      <Text style={styles.footnote}>
        Overall score = meals + hours×8 + events×25 + dollars raised. Pickups,
        event check-ins, and donations all count automatically.
      </Text>
    </View>
  );
}

export default function LeaderboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ResponsiveContainer maxWidth={900}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <LeaderboardBody />
      </ResponsiveContainer>
    </ScrollView>
  );
}

function FilterRow({ label, options, value, onChange, colorize = false }) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {options.map((opt) => {
          const active = opt.key === value;
          const tint = colorize && opt.color ? opt.color : Colors.green;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onChange(opt.key)}
              activeOpacity={0.85}
              style={[
                styles.chip,
                active && { backgroundColor: tint, borderColor: tint },
              ]}
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function PodiumCard({ rank, row, sortBy, color, height }) {
  return (
    <View style={styles.podiumCol}>
      <View style={styles.podiumAvatarWrap}>
        <View style={[styles.podiumAvatar, { borderColor: color }]}>
          <Text style={styles.podiumInitial}>
            {row.name?.[0] || '?'}
          </Text>
        </View>
        <View style={[styles.medalDot, { backgroundColor: color }]}>
          <Text style={styles.medalText}>{rank}</Text>
        </View>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {row.name}
      </Text>
      <Text style={styles.podiumChapter} numberOfLines={1}>
        {row.chapter}
      </Text>
      <View
        style={[
          styles.podiumBar,
          { height, backgroundColor: color },
        ]}
      >
        <Text style={styles.podiumValue}>{metricValue(row, sortBy)}</Text>
        <Text style={styles.podiumUnit}>{metricLabel(sortBy)}</Text>
      </View>
    </View>
  );
}

function LeaderboardRow({ row, sortBy, isMe, wide }) {
  return (
    <View style={[styles.row, isMe && styles.rowMe, wide && styles.rowWide]}>
      <Text style={styles.rank}>#{row.rank}</Text>
      <View style={styles.avatarSmall}>
        <Text style={styles.avatarSmallText}>{row.name?.[0] || '?'}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.rowName} numberOfLines={1}>
          {row.name}
        </Text>
        <Text style={styles.rowChapter} numberOfLines={1}>
          {row.chapter}
        </Text>
      </View>
      <View style={styles.rowStats}>
        <Text style={styles.rowValue}>{metricValue(row, sortBy)}</Text>
        <Text style={styles.rowSub}>
          {fmt(row.meals)}m · {fmt(row.hours)}h · {fmtMoney(row.raised)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  back: { fontSize: 16, color: Colors.green, marginBottom: 8 },
  title: { color: Colors.green },
  subtitle: { ...Type.body, color: Colors.gray, marginTop: 4, marginBottom: 18 },

  filterRow: { marginBottom: 12 },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.gray,
    marginBottom: 6,
  },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  chipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
  chipTextActive: { color: Colors.white },

  loadingWrap: { paddingVertical: 40, alignItems: 'center' },

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    ...Shadows.card,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { ...Type.body, color: Colors.gray, textAlign: 'center' },

  // Podium
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 24,
  },
  podiumCol: { flex: 1, alignItems: 'center', maxWidth: 140 },
  podiumAvatarWrap: { alignItems: 'center', marginBottom: 6 },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.green,
  },
  medalDot: {
    position: 'absolute',
    bottom: -4,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  medalText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
  },
  podiumChapter: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 6,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 80,
  },
  podiumValue: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Caveat-Bold',
  },
  podiumUnit: { color: Colors.white, fontSize: 11, opacity: 0.85 },

  // You card
  youCard: {
    backgroundColor: Colors.green,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    ...Shadows.card,
  },
  youLabel: {
    color: '#A5C3B6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  youRow: { flexDirection: 'row', alignItems: 'center' },
  youRank: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Caveat-Bold',
    minWidth: 44,
  },
  youName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  youChapter: { color: '#C8DDD4', fontSize: 12 },
  youMetric: { alignItems: 'flex-end' },
  youValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  youUnit: { color: '#C8DDD4', fontSize: 11 },

  // List
  list: { flexDirection: 'column', gap: 8 },
  listWide: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Shadows.card,
  },
  rowWide: { flexBasis: '47%', flexGrow: 1, minWidth: 280 },
  rowMe: { borderWidth: 2, borderColor: Colors.pink },
  rank: {
    width: 36,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: Colors.white, fontWeight: '800' },
  rowName: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  rowChapter: { fontSize: 11, color: Colors.gray },
  rowStats: { alignItems: 'flex-end' },
  rowValue: { fontSize: 16, fontWeight: '800', color: Colors.green },
  rowSub: { fontSize: 10, color: Colors.grayMid, marginTop: 2 },

  footnote: {
    ...Type.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
  },
});
