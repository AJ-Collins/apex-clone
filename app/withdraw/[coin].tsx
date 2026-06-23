import { ActionBottomSheet } from '@/components/ActionBottomSheet';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Dimensions, Easing, Image, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Path, Rect } from 'react-native-svg';

// ─── BinanceShieldIcon component ───
function BinanceShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Shield outer shape */}
      <Path
        d="M50 5 L90 20 L90 55 C90 75 72 90 50 97 C28 90 10 75 10 55 L10 20 Z"
        fill="#2B3139"
        stroke="#9a9fa8"
        strokeWidth="3"
      />
      {/* Inner shield */}
      <Path
        d="M50 15 L82 27 L82 55 C82 71 67 84 50 90 C33 84 18 71 18 55 L18 27 Z"
        fill="#1a1d26"
        stroke="#9a9fa8"
        strokeWidth="1.5"
      />
      {/* Lock body */}
      <Rect x="35" y="52" width="30" height="22" rx="3" fill="#9a9fa8" />
      {/* Lock shackle */}
      <Path
        d="M40 52 L40 44 C40 37 60 37 60 44 L60 52"
        stroke="#9a9fa8"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Keyhole */}
      <Path
        d="M50 58 C52.8 58 55 60.2 55 63 C55 65.1 53.7 66.9 52 67.6 L53 72 L47 72 L48 67.6 C46.3 66.9 45 65.1 45 63 C45 60.2 47.2 58 50 58 Z"
        fill="#1a1d26"
      />
    </Svg>
  );
}

const { width } = Dimensions.get('window');

const POPULAR_NETWORKS = [
  { id: 'BTC', name: 'Bitcoin', fee: '0.0001', time: '≈ 30 mins' },
  { id: 'BEP20', name: 'BNB Smart Chain (BEP20)', fee: '0.19', time: '≈ 3 mins' },
  { id: 'TRC20', name: 'Tron (TRC20)', fee: '1.00', time: '≈ 3 mins' },
  { id: 'ERC20', name: 'Ethereum (ERC20)', fee: '4.50', time: '≈ 5 mins' },
  { id: 'Polygon', name: 'Polygon', fee: '0.50', time: '≈ 5 mins' },
  { id: 'Solana', name: 'Solana', fee: '0.80', time: '≈ 2 mins' },
  { id: 'Arbitrum', name: 'Arbitrum One', fee: '0.90', time: '≈ 3 mins' },
];

// ─── Screen 1: Confirm Order ───────────────────────────────────────────────
function ConfirmOrderScreen({
  currency, amount, address, network, onConfirm, onBack
}: any) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const networkObj = POPULAR_NETWORKS.find(n => n.id === network);
  const receiveAmount = amount && networkObj
    ? (parseFloat(amount) - parseFloat(networkObj.fee)).toFixed(2)
    : amount;

  const shortAddress = address.length > 16
    ? address.slice(0, 8) + '...' + address.slice(-8)
    : address;

  return (
    <SafeAreaView style={[co.container, { backgroundColor: '#1a1d26' }]}>
      {/* Header */}
      <View style={co.header}>
        <TouchableOpacity onPress={onBack} style={co.headerBack}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={co.headerTitle}>Confirm order</ThemedText>
      </View>

      <ScrollView contentContainerStyle={co.content} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View style={co.heroSection}>
          <ThemedText style={co.receiveLabel}>Receive amount</ThemedText>
          <ThemedText style={co.receiveAmount}>{receiveAmount} {currency}</ThemedText>
          <ThemedText style={co.receiveUsd}>≈ ${receiveAmount}</ThemedText>
        </View>

        {/* Details */}
        <View style={co.detailsSection}>
          <View style={co.row}>
            <ThemedText style={co.rowLabel}>Network</ThemedText>
            <ThemedText style={co.rowValue}>{networkObj?.name || network}</ThemedText>
          </View>

          <View style={co.row}>
            <ThemedText style={co.rowLabel}>Address</ThemedText>
            <View style={{ flex: 2, alignItems: 'flex-end' }}>
              <ThemedText style={[co.rowValue, { flexWrap: 'wrap', textAlign: 'right' }]} numberOfLines={0}>
                {address.length > 20 ? (
                  <>
                    <ThemedText style={{ color: '#F5C518' }}>{address.slice(0, 4)}</ThemedText>
                    <ThemedText style={{ color: '#fff' }}>{address.slice(4, -8)}</ThemedText>
                    <ThemedText style={{ color: '#F5C518' }}>{address.slice(-8)}</ThemedText>
                  </>
                ) : (
                  <ThemedText style={{ color: '#fff' }}>{address}</ThemedText>
                )}
              </ThemedText>
            </View>
          </View>

          <View style={co.row}>
            <ThemedText style={co.rowLabel}>Withdrawal Amount</ThemedText>
            <ThemedText style={co.rowValue}>{amount} {currency}</ThemedText>
          </View>

          <View style={co.row}>
            <ThemedText style={co.rowLabel}>Network fee</ThemedText>
            <ThemedText style={co.rowValue}>{networkObj?.fee || '0.00'} {currency}</ThemedText>
          </View>

          <View style={[co.row, { borderBottomWidth: 0 }]}>
            <ThemedText style={co.rowLabel}>Wallet</ThemedText>
            <ThemedText style={co.rowValue}>Spot Wallet</ThemedText>
          </View>
        </View>

        {/* Warning Box */}
        <View style={co.warningBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#9a9fa8" style={{ marginRight: 10, marginTop: 1 }} />
          <ThemedText style={co.warningText}>
            Ensure that the address is correct and on the same network.{'\n'}
            Transactions cannot be cancelled.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={co.footer}>
        <TouchableOpacity style={co.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
          <ThemedText style={co.confirmBtnText}>Confirm</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Screen 2: Passkey Verify ──────────────────────────────────────────────
function PasskeyScreen({ onSuccess, onBack }: any) {
  const colorScheme = useColorScheme() ?? 'dark';

  // Animated bars for the "Verifying with passkey" loader
  const bars = [0, 1, 2, 3].map(() => useRef(new Animated.Value(0.4)).current);

  useEffect(() => {
    bars.forEach((bar, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(bar, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.4, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });

    // Auto-advance after 2.5s simulating passkey verification
    const timer = setTimeout(onSuccess, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[pk.container, { backgroundColor: '#1a1d26' }]}>
      <TouchableOpacity onPress={onBack} style={pk.backBtn}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={pk.closeBtn}>
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={pk.content}>
        <ThemedText style={pk.title}>Verify with passkey</ThemedText>
        <ThemedText style={pk.subtitle}>
          Your device will ask your fingerprint, face, or screen lock.
        </ThemedText>

        {/* Person + Key Icon */}
        <View style={pk.iconWrap}>
          <Image
            source={require('@/assets/icons/passverify.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <ThemedText style={pk.verifyingText}>Verifying with passkey</ThemedText>
        </View>          
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 32, gap: 6 }}>
        <BinanceShieldIcon size={18} />
        <ThemedText style={[pk.protectedText, { paddingBottom: 0 }]}>Protected by Binance Risk</ThemedText>
      </View>
    </SafeAreaView>
  );
}

// ─── Screen 3: Processing ──────────────────────────────────────────────────
function ProcessingScreen({ amount, currency, onDone }: any) {
  const estimatedTime = new Date(Date.now() + 8000);
  const timeStr = estimatedTime.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const sandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sandAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(sandAnim, { toValue: 0, duration: 0, useNativeDriver: true }), // ← both must match
      ])
    ).start();

    const timer = setTimeout(onDone, 8000);
    return () => clearTimeout(timer);
  }, []);

  const sandTranslate = sandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <SafeAreaView style={[pr.container, { backgroundColor: '#1a1d26' }]}>
      <TouchableOpacity style={pr.backBtn}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={[pr.content, { marginTop: -250 }]}>
        {/* PNG hourglass icon */}
        <Image
          source={require('@/assets/icons/withrawprocess.png')}
          style={{ width: 100, height: 100, marginBottom: 32 }}
          resizeMode="contain"
        />

        <ThemedText style={pr.title}>Withdrawal Processing</ThemedText>
        <ThemedText style={pr.amount}>{amount} {currency}</ThemedText>
        <ThemedText style={[pr.timeText, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>
          Estimated completion time: {timeStr}
        </ThemedText>
        <ThemedText style={pr.subText} numberOfLines={2} adjustsFontSizeToFit>
          You will receive an email once withdrawal is completed. View history for the latest updates.
        </ThemedText>
      </View>

      <View style={pr.footer}>
        <TouchableOpacity style={pr.viewBtn} disabled>
          <ThemedText style={pr.viewBtnText}>View History</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Screen 4: Success ────────────────────────────────────────────────────
function SuccessScreen({ amount, currency, onViewHistory }: any) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const diamondAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(diamondAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[su.container, { backgroundColor: '#1a1d26' }]}>
      <TouchableOpacity style={su.backBtn} onPress={onViewHistory}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={su.content}>
        {/* Green checkmark */}
        <Animated.View style={[su.checkWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={su.checkOuter}>
            <View style={su.checkInner}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <ThemedText style={su.title}>Withdrawal Successful</ThemedText>
        <ThemedText style={su.amount}>{amount} {currency}</ThemedText>
        <ThemedText style={su.subText}>
          Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flow step: 'form' | 'confirm' | 'passkey' | 'processing' | 'success'
  const [step, setStep] = useState<'form' | 'confirm' | 'passkey' | 'processing' | 'success'>('form');

  const { user } = useAuthStore();
  const realAccount = user?.accounts?.find((a: any) => a.type === 'REAL');
  const currentBalance = parseFloat(realAccount?.balance || '0');

  const getDecimals = (c: string) => {
    switch (c) {
      case 'BTC': return 8; case 'BNB': return 4;
      case 'ETH': return 6; case 'USDT': return 2; default: return 6;
    }
  };
  const availableBalanceStr = Number(currentBalance).toFixed(getDecimals(currency));

  const handleWithdraw = async () => {
    if (!address || !network || !amount) {
      Alert.alert('Error', 'Please fill in all fields (Address, Network, Amount)');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post<any>('/users/special-deposit', { amount: Number(amount), address });
    } catch (_) { }
    setIsSubmitting(false);
    setStep('confirm');
  };

  // ── Flow rendering ──
  if (step === 'confirm') {
    return (
      <ConfirmOrderScreen
        currency={currency} amount={amount} address={address} network={network}
        onConfirm={() => setStep('passkey')}
        onBack={() => setStep('form')}
      />
    );
  }
  if (step === 'passkey') {
    return <PasskeyScreen onSuccess={() => setStep('processing')} onBack={() => setStep('confirm')} />;
  }
  if (step === 'processing') {
    return <ProcessingScreen amount={amount} currency={currency} onDone={() => setStep('success')} />;
  }
  if (step === 'success') {
    return <SuccessScreen amount={amount} currency={currency} onViewHistory={() => router.push('/assets')} />;
  }

  // ── Step: form (original screen) ──
  const networkObj = POPULAR_NETWORKS.find(n => n.id === network);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
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
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Address</ThemedText>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.text, paddingTop: 14, paddingBottom: 14 }]}
              placeholder="Long press to paste"
              placeholderTextColor={theme.textSecondary}
              onChangeText={setAddress}
              value={address}
              multiline autoCapitalize="none" autoCorrect={false}
            />
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

      <View style={[styles.footer, { borderTopColor: 'rgba(150,150,150,0.1)' }]}>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Receive amount</ThemedText>
          <ThemedText style={[styles.summaryValueMain, { color: theme.text }]}>{amount ? amount : '0.00'} {currency}</ThemedText>
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
                onPress={() => { setNetwork(net.id); setNetworkModalVisible(false); }}
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
                Ensure the network matches the withdrawal address and the deposit platform supports it, or assets may be lost
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </ActionBottomSheet>
    </SafeAreaView>
  );
}

// ─── Styles: Confirm Order ─────────────────────────────────────────────────
const co = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerBack: { width: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 'bold', color: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heroSection: { alignItems: 'center', paddingVertical: 32 },
  receiveLabel: { fontSize: 14, color: '#9a9fa8', marginBottom: 10 },
  receiveAmount: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 6, lineHeight: 42 },
  receiveUsd: { fontSize: 14, color: '#9a9fa8' },
  detailsSection: { marginTop: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  rowLabel: { fontSize: 14, color: '#9a9fa8', flex: 1 },
  rowValue: { fontSize: 14, color: '#fff', textAlign: 'right', flex: 1.5 },
  warningBox: {
    flexDirection: 'row', backgroundColor: '#252830', borderRadius: 12,
    padding: 16, marginTop: 24,
  },
  warningText: { fontSize: 13, color: '#9a9fa8', flex: 1, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 },
  confirmBtn: {
    height: 52, borderRadius: 8, backgroundColor: '#F5C518',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

// ─── Styles: Passkey ───────────────────────────────────────────────────────
const pk = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { position: 'absolute', top: 54, left: 8, zIndex: 10, padding: 8 },
  closeBtn: { position: 'absolute', top: 54, right: 20, zIndex: 10, padding: 8 },
  content: { flex: 1, paddingTop: 70, left: 5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12, lineHeight: 30 },
  subtitle: { fontSize: 15, color: '#9a9fa8', lineHeight: 22, marginBottom: 60 },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  iconCircleOuter: {
    width: 100, height: 90, borderWidth: 2, borderColor: '#fff',
    borderRadius: 50, justifyContent: 'center', alignItems: 'center',
    position: 'relative', marginBottom: 8,
  },
  iconCircleInner: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#fff',
    position: 'absolute', top: 14,
  },
  shoulders: {
    position: 'absolute', bottom: 0, width: 70, height: 30,
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    borderTopWidth: 2, borderColor: '#fff',
  },
  keyBadge: {
    position: 'absolute', right: -14, top: 8,
    backgroundColor: '#1a1d26', borderRadius: 12, padding: 2,
  },
  keyEmoji: { fontSize: 18 },
  dotsBar: {
    flexDirection: 'row', gap: 8, backgroundColor: '#252830',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 4,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  verifyingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bar: { width: 4, height: 20, borderRadius: 2 },
  verifyingText: { fontSize: 15, color: '#fff', textAlign: 'center', marginTop: 8 },
  protectedText: { textAlign: 'center', color: '#9a9fa8', fontSize: 13, paddingBottom: 32 },
});

// ─── Styles: Processing ────────────────────────────────────────────────────
const pr = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 54, left: 8, zIndex: 10, padding: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  hourglassWrap: { width: 80, height: 120, alignItems: 'center', marginBottom: 32, position: 'relative' },
  hourglassTop: {
    width: 0, height: 0,
    borderLeftWidth: 36, borderRightWidth: 36, borderTopWidth: 44,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#fff',
    opacity: 0.9,
  },
  sand: {
    position: 'absolute', top: 10, width: 20, height: 20,
    backgroundColor: '#F5C518', borderRadius: 2, opacity: 0.85,
  },
  hourglassNeck: { width: 4, height: 12, backgroundColor: '#fff', opacity: 0.6 },
  hourglassBottom: {
    width: 0, height: 0,
    borderLeftWidth: 36, borderRightWidth: 36, borderBottomWidth: 44,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#fff',
    opacity: 0.9,
  },
  hourglassFrame: {
    position: 'absolute', top: 0, width: 80, height: 4,
    backgroundColor: '#fff', borderRadius: 2,
  },
  hourglassFrameBottom: { top: undefined, bottom: 0 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  amount: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  timeText: { fontSize: 13, color: '#9a9fa8', textAlign: 'center', marginBottom: 12, lineHeight: 20 },
  subText: { fontSize: 13, color: '#9a9fa8', textAlign: 'center', lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  viewBtn: {
    height: 52, borderRadius: 8, backgroundColor: '#F5C518',
    justifyContent: 'center', alignItems: 'center',
  },
  viewBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

// ─── Styles: Success ───────────────────────────────────────────────────────
const su = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 54, left: 20, zIndex: 10, padding: 8 },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 26,
    marginTop: -250,
  },
  diamond: {
    width: 20, height: 20, backgroundColor: '#F5C518',
    transform: [{ rotate: '45deg' }], marginBottom: 32,
  },
  checkWrap: { marginBottom: 28 },
  checkOuter: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 2.5,
    borderColor: '#0FC97B', justifyContent: 'center', alignItems: 'center',
  },
  checkInner: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#0FC97B', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 14 },
  amount: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  subText: { fontSize: 11, color: '#9a9fa8', textAlign: 'center', lineHeight: 20 },
});

// ─── Original form styles (unchanged) ─────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSubtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  headerSubtitle: { fontSize: 12, fontWeight: '600' },
  headerRightIcons: { flexDirection: 'row', width: 60, justifyContent: 'flex-end', gap: 12 },
  iconButton: { padding: 2 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  infoIcon: { marginLeft: 4, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 12, minHeight: 48 },
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
  footer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, borderTopWidth: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValueMain: { fontSize: 18, fontWeight: 'bold' },
  summaryValueSub: { fontSize: 14 },
  primaryButton: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  primaryButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  modalContent: { paddingHorizontal: 16, paddingBottom: 24, maxHeight: 600 },
  modalTitle: { fontSize: 20, marginBottom: 20 },
  modalScroll: { marginBottom: 10 },
  networkCard: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  networkCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 14, gap: 6 },
  networkCardId: { fontSize: 16 },
  networkCardName: { fontSize: 14 },
  networkCardDivider: { height: 1, width: '100%', opacity: 0.6 },
  networkCardBody: { padding: 14, paddingTop: 6 },
  networkCardText: { fontSize: 14, marginBottom: 8 },
  warningBox: { flexDirection: 'row', padding: 16, borderRadius: 12, marginTop: 8, marginBottom: 24 },
  warningIcon: { marginTop: 2, marginRight: 8 },
  warningText: { fontSize: 13, flex: 1, lineHeight: 18 },
});