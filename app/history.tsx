import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWithdrawalStore } from '@/store/withdrawalStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['Crypto address', 'Binance account', 'Cash'] as const;

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { history, fetchHistory, loading } = useWithdrawalStore();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Crypto address');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
  };

  const formatAmount = (amount: number) => {
    if (!amount && amount !== 0) return '0';
    return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completed';
      case 'PENDING':
      case 'APPROVED': return 'Processing(0/1)';
      case 'REJECTED': return 'Failed';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return theme.textSecondary;
      case 'PENDING':
      case 'APPROVED': return theme.textSecondary;
      case 'REJECTED': return theme.red;
      default: return theme.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Assets</Text>
            <Ionicons name="caret-down" size={12} color={theme.text} style={{ marginLeft: 4, marginTop: 2 }} />
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Withdraw</Text>
        </View>
        <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="download-outline" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.surfaceHighlight }]}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={styles.tabBtn} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, { color: activeTab === tab ? theme.yellow : theme.textSecondary }]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={[styles.activeLine, { backgroundColor: theme.yellow }]} />}
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Help row */}
      <TouchableOpacity style={styles.helpRow}>
        <Text style={[styles.helpText, { color: theme.textSecondary }]}>
          Why hasn't my withdrawal arrived?
        </Text>
        <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.yellow}
            colors={[theme.yellow]}
          />
        }
      >
        {loading && history.length === 0 ? (
          <ActivityIndicator size="large" color={theme.yellow} style={{ marginTop: 60 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={theme.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No withdrawal history</Text>
          </View>
        ) : (
          history.map((item, index) => (
            <TouchableOpacity
              key={item.id || index.toString()}
              style={[styles.historyItem, { borderBottomColor: theme.surfaceHighlight }]}
              onPress={() => router.push({ pathname: '/history-details', params: { id: item.id } } as any)}
            >
              <View style={styles.itemLeft}>
                <Text style={[styles.currencyText, { color: theme.text }]}>{item.currency}</Text>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.amountText, { color: theme.text }]}>-{formatAmount(item.amount)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 4, width: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  downloadBtn: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tabBtn: { marginRight: 20, paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '600' },
  activeLine: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 3, borderRadius: 1.5,
  },
  filterBtn: { paddingVertical: 12, paddingLeft: 8 },
  helpRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 18,
  },
  helpText: { fontSize: 14 },
  listContainer: { paddingBottom: 40 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 15 },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 18,
    borderBottomWidth: 1,
  },
  itemLeft: { gap: 6 },
  currencyText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 13 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  amountText: { fontSize: 16, fontWeight: 'bold' },
  statusText: { fontSize: 13 },
});
