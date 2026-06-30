import { AssetsHeader } from '@/components/AssetsHeader';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const BALANCES = [
  { id: 'USDT', name: 'TetherUS', amount: '0.00', color: '#26a17b', icon: 'currency-usd' },
  { id: 'BTC', name: 'Bitcoin', amount: '0.00', color: '#f7931a', icon: 'bitcoin' },
  { id: 'BNB', name: 'BNB', amount: '0.00', color: '#f3ba2f', icon: 'currency-btc' },
];

export default function SpotScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { balances } = usePortfolioStore();

  const mappedBalances = [
    { id: 'USDT', name: 'TetherUS', amount: balances.find(b => b.currency === 'USDT')?.balance || '0.00', color: '#26a17b', icon: 'currency-usd' },
    { id: 'BTC', name: 'Bitcoin', amount: balances.find(b => b.currency === 'BTC')?.balance || '0.00', color: '#f7931a', icon: 'bitcoin' },
    { id: 'BNB', name: 'BNB', amount: balances.find(b => b.currency === 'BNB')?.balance || '0.00', color: '#f3ba2f', icon: 'currency-btc' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AssetsHeader />
        {/* BALANCES */}
        <View style={styles.balancesSection}>
          <View style={styles.balancesHeader}>
            <ThemedText type="bold" style={styles.balancesTitle}>Balances</ThemedText>
            <Ionicons name="search-outline" size={22} color={theme.textSecondary} />
          </View>

          {mappedBalances.map((item) => (
            <View key={item.id} style={styles.balanceItem}>
              <View style={[styles.coinIconWrapper, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color="#fff" />
              </View>
              <View style={styles.coinInfo}>
                <ThemedText type="bold" style={styles.coinSymbol}>{item.id}</ThemedText>
                <ThemedText style={[styles.coinName, { color: theme.textSecondary }]}>{item.name}</ThemedText>
              </View>
              <ThemedText type="bold" style={styles.coinAmount}>{item.amount}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balancesSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  balancesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balancesTitle: {
    fontSize: 20,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  coinIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  coinInfo: {
    flex: 1,
    gap: 2,
  },
  coinSymbol: {
    fontSize: 16,
  },
  coinName: {
    fontSize: 13,
  },
  coinAmount: {
    fontSize: 16,
  },
});
