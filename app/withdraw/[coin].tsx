import { ActionBottomSheet } from '@/components/ActionBottomSheet';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POPULAR_NETWORKS = [
  { id: 'BTC', name: 'Bitcoin', fee: '0.0001', time: '≈ 30 mins' },
  { id: 'BEP20', name: 'BNB Smart Chain (BEP20)', fee: '0.19', time: '≈ 3 mins' },
  { id: 'TRC20', name: 'Tron (TRC20)', fee: '1.00', time: '≈ 3 mins' },
  { id: 'ERC20', name: 'Ethereum (ERC20)', fee: '4.50', time: '≈ 5 mins' },
  { id: 'Polygon', name: 'Polygon', fee: '0.50', time: '≈ 5 mins' },
  { id: 'Solana', name: 'Solana', fee: '0.80', time: '≈ 2 mins' },
  { id: 'Arbitrum', name: 'Arbitrum One', fee: '0.90', time: '≈ 3 mins' },
];

export default function WithdrawCoinScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { coin } = useLocalSearchParams<{ coin: string }>();
  const currency = typeof coin === 'string' ? coin.toUpperCase() : 'BTC';

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [isNetworkModalVisible, setNetworkModalVisible] = useState(false);

  const { balances } = usePortfolioStore();
  const currentBalance = balances.find(b => b.currency === currency)?.balance || 0;
  
  const getDecimals = (c: string) => {
    switch(c) {
      case 'BTC': return 8;
      case 'BNB': return 4;
      case 'ETH': return 6;
      case 'USDT': return 2;
      default: return 6;
    }
  };
  
  const availableBalanceStr = Number(currentBalance).toFixed(getDecimals(currency));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<{ txId: string; message: string } | null>(null);
  const [skipVerification, setSkipVerification] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleWithdraw = async () => {
    if (!address || !network || !amount) {
      Alert.alert('Error', 'Please fill in all fields (Address, Network, Amount)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<any>('/users/special-deposit', {
        amount: Number(amount),
        address
      }) as any;

      if (response.success && response.txId) {
        setWithdrawResult({ txId: response.txId, message: response.message || '' });
        setConfirmModalVisible(true);
      } else {
        Alert.alert('Error', response.message || response.error || 'Failed to initiate withdrawal');
      }
    } catch (e) {
      Alert.alert('Error', 'An error occurred during withdrawal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Send {currency}</ThemedText>
          <TouchableOpacity style={styles.headerSubtitleRow}>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>One Time</ThemedText>
            <MaterialCommunityIcons name="menu-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="help-box-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="clock-time-four-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Address */}
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Address</ThemedText>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.text, paddingTop: 14, paddingBottom: 14 }]}
              placeholder="Long press to paste"
              placeholderTextColor={theme.textSecondary}
              onChangeText={setAddress}
              multiline={true}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            >
              {address.length > 12 ? (
                <ThemedText style={{ fontSize: 15 }}>
                  <ThemedText style={{ color: theme.yellow, fontSize: 15, fontWeight: 'bold' }}>{address.slice(0, 6)}</ThemedText>
                  <ThemedText style={{ color: theme.text, fontSize: 15 }}>{address.slice(6, -6)}</ThemedText>
                  <ThemedText style={{ color: theme.yellow, fontSize: 15, fontWeight: 'bold' }}>{address.slice(-6)}</ThemedText>
                </ThemedText>
              ) : (
                <ThemedText style={{ color: theme.text, fontSize: 15 }}>{address}</ThemedText>
              )}
            </TextInput>
            <View style={styles.inputRightIcons}>
              <TouchableOpacity style={styles.inputIconButton}>
                <Ionicons name="person-circle-outline" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputIconButton}>
                <Ionicons name="scan-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Network */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Network</ThemedText>
            <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} style={styles.infoIcon} />
          </View>
          <TouchableOpacity
            style={[styles.inputContainer, { backgroundColor: theme.surface }]}
            onPress={() => setNetworkModalVisible(true)}
          >
            <ThemedText style={[styles.placeholderText, { color: network ? theme.text : theme.textSecondary }]}>
              {network ? POPULAR_NETWORKS.find(n => n.id === network)?.name : 'Automatically match the network'}
            </ThemedText>
            <MaterialCommunityIcons name="menu-down" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Withdrawal Amount */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Withdrawal Amount</ThemedText>
            <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} style={styles.infoIcon} />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Minimum 0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.amountRightText}>
              <ThemedText style={[styles.currencyText, { color: theme.text }]}>{currency}</ThemedText>
              <TouchableOpacity onPress={() => setAmount(availableBalanceStr)}>
                <ThemedText style={[styles.maxText, { color: theme.yellow }]}>Max</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.availableRow}>
            <ThemedText style={[styles.availableLabel, { color: theme.textSecondary }]}>Available</ThemedText>
            <ThemedText style={[styles.availableValue, { color: theme.text }]}>{availableBalanceStr} {currency}</ThemedText>
          </View>
        </View>

        {/* Info Text */}
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerRow}>
            <ThemedText style={[styles.bulletPoint, { color: theme.textSecondary }]}>•</ThemedText>
            <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
              Do not withdraw directly to a crowdfund or ICO. We will not credit your account with tokens from that sale.
            </ThemedText>
          </View>
          <View style={styles.disclaimerRow}>
            <ThemedText style={[styles.bulletPoint, { color: theme.textSecondary }]}>•</ThemedText>
            <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
              Do not transact with Sanctioned Entities. <ThemedText style={{ color: theme.yellow, fontSize: 13 }}>Learn more</ThemedText>
            </ThemedText>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Footer */}
      <View style={[styles.footer, { borderTopColor: 'rgba(150,150,150,0.1)' }]}>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Receive amount</ThemedText>
          <ThemedText style={[styles.summaryValueMain, { color: theme.text }]}>
            {amount ? amount : '0.00'} {currency}
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Network fee</ThemedText>
          <ThemedText style={[styles.summaryValueSub, { color: theme.text }]}>
            {network ? POPULAR_NETWORKS.find(n => n.id === network)?.fee : '0.00'} {currency}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.yellow, opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleWithdraw}
          disabled={isSubmitting}
        >
          <ThemedText style={styles.primaryButtonText}>
            {isSubmitting ? 'Processing...' : 'Withdraw'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Network Modal */}
      <ActionBottomSheet isVisible={isNetworkModalVisible} onClose={() => setNetworkModalVisible(false)}>
        <View style={styles.modalContent}>
          <ThemedText type="bold" style={styles.modalTitle}>Choose Network</ThemedText>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            {POPULAR_NETWORKS.map((net) => (
              <TouchableOpacity
                key={net.id}
                style={[styles.networkCard, { borderColor: theme.surfaceHighlight }]}
                onPress={() => {
                  setNetwork(net.id);
                  setNetworkModalVisible(false);
                }}
              >
                <View style={styles.networkCardHeader}>
                  <ThemedText type="bold" style={styles.networkCardId}>{net.id}</ThemedText>
                  <ThemedText style={[styles.networkCardName, { color: theme.textSecondary }]}>{net.name}</ThemedText>
                </View>
                <View style={[styles.networkCardDivider, { backgroundColor: theme.surfaceHighlight }]} />
                <View style={styles.networkCardBody}>
                  <ThemedText style={[styles.networkCardText, { color: theme.textSecondary }]}>
                    Fee {net.fee} {currency} ( ≈ KSh {(Number(net.fee) * 145).toFixed(2)} )
                  </ThemedText>
                  <ThemedText style={[styles.networkCardText, { color: theme.textSecondary }]}>
                    Minimum withdrawal 0.1 {currency}
                  </ThemedText>
                  {net.time && (
                    <ThemedText style={[styles.networkCardText, { color: theme.textSecondary, marginBottom: 0 }]}>
                      Arrival time {net.time}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <View style={[styles.warningBox, { backgroundColor: theme.surface }]}>
              <Ionicons name="alert-circle-outline" size={18} color={theme.textSecondary} style={styles.warningIcon} />
              <ThemedText style={[styles.warningText, { color: theme.textSecondary }]}>
                Ensure the network matches the withdrawal address and the deposit platform support it , or assets may be lost
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </ActionBottomSheet>

      {/* Security Verification Modal */}
      <ActionBottomSheet isVisible={isConfirmModalVisible} onClose={() => setConfirmModalVisible(false)}>
        <View style={svStyles.container}>
          {/* Header */}
          <View style={svStyles.header}>
            <ThemedText type="bold" style={svStyles.title}>Security Verification</ThemedText>
            <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={svStyles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={svStyles.detailsCard}>
            <View style={svStyles.detailRow}>
              <ThemedText style={[svStyles.detailLabel, { color: theme.textSecondary }]}>On-Chain Withdrawal</ThemedText>
              <View style={svStyles.detailValueRow}>
                <ThemedText type="bold" style={[svStyles.detailValue, { color: theme.text }]}>{currency}</ThemedText>
                <View style={[svStyles.networkBadge, { backgroundColor: theme.surfaceHighlight }]}>
                  <ThemedText style={[svStyles.networkBadgeText, { color: theme.textSecondary }]}>
                    {network ? POPULAR_NETWORKS.find(n => n.id === network)?.name?.replace(/.*\((.+)\)/, '$1') || network : network}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={[svStyles.separator, { backgroundColor: theme.surfaceHighlight }]} />

            <View style={svStyles.detailRow}>
              <ThemedText style={[svStyles.detailLabel, { color: theme.textSecondary }]}>Withdraw to</ThemedText>
              <ThemedText style={[svStyles.addressText, { color: theme.text }]} numberOfLines={2}>
                {address}
              </ThemedText>
            </View>

            <View style={[svStyles.separator, { backgroundColor: theme.surfaceHighlight }]} />

            <View style={svStyles.detailRow}>
              <ThemedText style={[svStyles.detailLabel, { color: theme.textSecondary }]}>Amount Received</ThemedText>
              <ThemedText type="bold" style={[svStyles.detailValue, { color: theme.text }]}>
                {amount} {currency}
              </ThemedText>
            </View>

            <View style={[svStyles.separator, { backgroundColor: theme.surfaceHighlight }]} />

            <View style={svStyles.detailRow}>
              <ThemedText style={[svStyles.detailLabel, { color: theme.textSecondary }]}>Withdrawal Fees</ThemedText>
              <ThemedText style={[svStyles.detailValue, { color: theme.text }]}>
                {network ? POPULAR_NETWORKS.find(n => n.id === network)?.fee : '0.00'} {currency}
              </ThemedText>
            </View>
          </View>

          {/* Skip Verification Toggle */}
          <View style={svStyles.toggleRow}>
            <ThemedText style={[svStyles.toggleLabel, { color: theme.textSecondary }]}>
              No verification needed for this address{"\n"}next time
            </ThemedText>
            <View style={svStyles.toggleRight}>
              <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
              <Switch
                value={skipVerification}
                onValueChange={setSkipVerification}
                trackColor={{ false: theme.surfaceHighlight, true: 'rgba(245,197,24,0.35)' }}
                thumbColor={skipVerification ? '#F5C518' : '#888'}
              />
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={svStyles.confirmBtn}
            onPress={async () => {
              if (withdrawResult?.txId) {
                await Clipboard.setStringAsync(withdrawResult.txId);
              }
              setConfirmModalVisible(false);
              setShowSuccessAlert(true);
              setTimeout(() => {
                setShowSuccessAlert(false);
                router.push('/assets');
              }, 2000);
            }}
          >
            <ThemedText style={svStyles.confirmBtnText}>Confirm</ThemedText>
          </TouchableOpacity>
        </View>
      </ActionBottomSheet>

      {/* Success Alert Overlay */}
      {showSuccessAlert && (
        <View style={[styles.successOverlay, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]}>
          <View style={[styles.successCard, { backgroundColor: theme.surface }]}>
            <View style={styles.successCircleWrapper}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={36} color="#FFF" />
              </View>
            </View>
            <ThemedText type="bold" style={[styles.successTitle, { color: theme.text }]}>Order Submitted</ThemedText>
            <ThemedText style={[styles.successSubText, { color: theme.textSecondary }]}>Your withdrawal request has been submitted</ThemedText>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerRightIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconButton: {
    padding: 2,
  },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  infoIcon: { marginLeft: 4, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48
  },
  input: { flex: 1, fontSize: 15, minHeight: 48 },
  placeholderText: { flex: 1, fontSize: 15 },
  inputRightIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputIconButton: { padding: 4 },
  amountRightText: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencyText: { fontSize: 15, fontWeight: 'bold' },
  maxText: { fontSize: 15, fontWeight: 'bold' },
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  availableLabel: { fontSize: 12 },
  availableValue: { fontSize: 12, fontWeight: '500' },
  disclaimerContainer: { marginTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)', paddingTop: 20 },
  disclaimerRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
  bulletPoint: { fontSize: 14, marginRight: 6, marginTop: -2 },
  disclaimerText: { fontSize: 12, lineHeight: 18, flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValueMain: { fontSize: 18, fontWeight: 'bold' },
  summaryValueSub: { fontSize: 14 },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  primaryButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

  /* Modal Styles */
  modalContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: 600,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalScroll: {
    marginBottom: 10,
  },
  networkCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  networkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 14,
    gap: 6,
  },
  networkCardId: {
    fontSize: 16,
  },
  networkCardName: {
    fontSize: 14,
  },
  networkCardDivider: {
    height: 1,
    width: '100%',
    opacity: 0.6,
  },
  networkCardBody: {
    padding: 14,
    paddingTop: 6,
  },
  networkCardText: {
    fontSize: 14,
    marginBottom: 8,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  warningIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  successCard: {
    paddingHorizontal: 40,
    paddingVertical: 40,
    borderRadius: 24,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  successCircleWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#0FC97B',
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0FC97B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  successSubText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

const svStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  detailsCard: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
    paddingRight: 12,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 14,
    textAlign: 'right',
  },
  networkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  networkBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    width: '100%',
    opacity: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
    paddingRight: 12,
  },
  toggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5C518',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
