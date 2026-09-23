import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWithdrawalStore } from '@/store/withdrawalStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryDetailsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history } = useWithdrawalStore();

  const item = history.find((h) => h.id === id);

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={{ color: theme.text }}>Transaction not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatAmount = (amount: number) => {
    if (!amount && amount !== 0) return '0';
    return Number.isInteger(amount) ? amount.toString() : amount.toFixed(4);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { label: 'Completed', color: theme.green, icon: 'checkmark-circle-outline' };
      case 'PENDING':
      case 'APPROVED': return { label: 'Processing', color: theme.textSecondary, icon: 'time-outline' };
      case 'REJECTED': return { label: 'Failed', color: theme.red, icon: 'close-circle-outline' };
      default: return { label: status, color: theme.textSecondary, icon: 'information-circle-outline' };
    }
  };

  const statusInfo = getStatusInfo(item.status);

  const networkFee = item.currency === 'USDT' ? '1 USDT' : '0.0005 BTC';

  const generateFakeTxHash = (id: string, currency: string) => {
    let seed = 0;
    const str = id + currency;
    for (let i = 0; i < str.length; i++) {
      seed = ((seed << 5) - seed) + str.charCodeAt(i);
      seed |= 0;
    }

    let currentSeed = Math.abs(seed);
    const nextRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    let fakeTx = '';
    const isEthFamily = ['ETH', 'BNB', 'ERC20', 'BEP20'].some(c => currency.includes(c));
    for (let i = 0; i < 64; i++) {
      fakeTx += Math.floor(nextRandom() * 16).toString(16);
    }
    return isEthFamily ? '0x' + fakeTx : fakeTx;
  };

  const displayTxHash = item.txHash || generateFakeTxHash(item.id, item.currency);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Withdrawal Details</Text>
        <TouchableOpacity style={styles.supportBtn}>
          <Ionicons name="headset-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Amount */}
        <View style={styles.amountContainer}>
          <Text style={[styles.mainAmount, { color: theme.text }]}>-{formatAmount(item.amount)} {item.currency}</Text>
          <View style={styles.statusRow}>
            <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.
          </Text>
          <Text style={[styles.helpText, { color: theme.yellow }]}>
            Why hasn't my withdrawal arrived?
          </Text>
        </View>

        {/* Details List */}
        <View style={styles.detailsList}>
          <DetailRow label="Network" value={item.network} theme={theme} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Address</Text>
            <View style={styles.detailValueContainer}>
              <View style={styles.copyableRow}>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1} ellipsizeMode="middle">
                  {item.destinationAddress}
                </Text>
                <TouchableOpacity style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.saveAddressText, { color: theme.yellow }]}>Save Address</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Txid</Text>
            <View style={styles.detailValueContainer}>
              <View style={styles.copyableRow}>
                <Text style={[styles.detailValue, styles.txidText, { color: theme.text }]}>
                  {displayTxHash}
                </Text>
                <TouchableOpacity style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <DetailRow label="Amount" value={`${formatAmount(item.amount)} ${item.currency}`} theme={theme} />
          <DetailRow label="Network fee" value={networkFee} theme={theme} />
          <DetailRow label="Withdrawal Wallet" value="Spot Wallet" theme={theme} />
          <DetailRow label="Date" value={item.createdAt.replace('T', ' ').substring(0, 19)} theme={theme} />

        </View>

        <TouchableOpacity style={styles.scamReportBtn}>
          <Ionicons name="shield-checkmark-outline" size={16} color={theme.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.scamReportText, { color: theme.textSecondary }]}>Scam Report</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { borderTopColor: theme.surfaceHighlight }]}>
        <TouchableOpacity
          style={[styles.withdrawAgainBtn, { backgroundColor: theme.yellow }]}
          onPress={() => {
            router.navigate('/(tabs)/assets');
            setTimeout(() => {
              router.push({ pathname: '/select-coin', params: { action: 'withdraw' } } as any);
            }, 50);
          }}
        >
          <Text style={[styles.withdrawAgainText, { color: '#000' }]}>Withdraw Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, theme }: { label: string, value: string, theme: any }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  supportBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 40 },
  amountContainer: { alignItems: 'center', marginBottom: 32 },
  mainAmount: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusText: { fontSize: 16, fontWeight: '500', marginLeft: 6, marginTop: -2 },
  infoText: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  helpText: { fontSize: 13, fontWeight: '600' },
  detailsList: { gap: 24, marginBottom: 32 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailLabel: { fontSize: 14, flex: 1 },
  detailValueContainer: { flex: 2, alignItems: 'flex-end' },
  detailValue: { fontSize: 14, fontWeight: '500', textAlign: 'right' },
  copyableRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end' },
  txidText: { textDecorationLine: 'underline', flexShrink: 1 },
  copyBtn: { marginLeft: 8 },
  saveAddressText: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  confirmationsText: { fontSize: 14, marginTop: 4 },
  scamReportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  scamReportText: { fontSize: 14 },
  bottomContainer: { padding: 16, paddingTop: 12, paddingBottom: 32, borderTopWidth: 1 },
  withdrawAgainBtn: { paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  withdrawAgainText: { fontSize: 16, fontWeight: 'bold' },
});
