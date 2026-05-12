import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AssetsHeader } from '@/components/AssetsHeader';

const BALANCES = [
  {
    id: 'OG',
    name: 'OG',
    amount: '0.015',
    bnbEquiv: '0.00001316 BNB',
    pnl: '-$0.01(-2.29%)',
    color: '#9b59b6',
    icon: 'infinity',
  },
];

export default function FundingScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AssetsHeader />

        {/* SMALL AMOUNT EXCHANGE ROW */}
        <TouchableOpacity
          style={[styles.smallExchangeRow, { backgroundColor: theme.background, borderColor: theme.surfaceHighlight }]}
        >
          <MaterialCommunityIcons name="rotate-3d-variant" size={22} color={theme.text} style={{ marginRight: 10 }} />
          <ThemedText style={{ fontSize: 15, color: theme.text }}>Small Amount Exchange</ThemedText>
        </TouchableOpacity>

        {/* BALANCES */}
        <View style={styles.balancesSection}>
          <View style={styles.balancesHeader}>
            <ThemedText type="bold" style={styles.balancesTitle}>Balances</ThemedText>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity>
                <Ionicons name="search-outline" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="shield-outline" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {BALANCES.map((item) => (
            <View key={item.id} style={styles.balanceItem}>
              <View style={[styles.coinIconWrapper, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color="#fff" />
              </View>
              <View style={styles.balanceInfo}>
                <View style={styles.balanceRow}>
                  <ThemedText type="bold" style={styles.coinSymbol}>{item.id}</ThemedText>
                  <ThemedText type="bold" style={styles.coinAmount}>{item.amount}</ThemedText>
                </View>
                <View style={styles.balanceRow}>
                  <ThemedText style={[styles.coinName, { color: theme.textSecondary }]}>{item.name}</ThemedText>
                  <ThemedText style={[styles.bnbEquiv, { color: theme.textSecondary }]}>{item.bnbEquiv}</ThemedText>
                </View>
                <View style={styles.balanceRow}>
                  <ThemedText style={[styles.pnlLabel, { color: theme.textSecondary }]}>Today's PNL</ThemedText>
                  <ThemedText style={[styles.pnlValue, { color: theme.red }]}>{item.pnl}</ThemedText>
                </View>
              </View>
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
  smallExchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  balancesSection: {
    paddingHorizontal: 16,
    marginTop: 8,
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  coinIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  balanceInfo: {
    flex: 1,
    gap: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 16,
  },
  coinAmount: {
    fontSize: 16,
  },
  coinName: {
    fontSize: 13,
  },
  bnbEquiv: {
    fontSize: 13,
  },
  pnlLabel: {
    fontSize: 12,
  },
  pnlValue: {
    fontSize: 12,
  },
});
