import { ActionBottomSheet } from '@/components/ActionBottomSheet';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useCurrencyStore } from '@/store/currencyStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useWithdrawalStore } from '@/store/withdrawalStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Dimensions,
  Image, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Path, Rect } from 'react-native-svg';

// BinanceShieldIcon component
function BinanceShieldIcon({ size = 18, theme }: { size?: number, theme: any }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Shield outer shape */}
      <Path
        d="M50 5 L90 20 L90 55 C90 75 72 90 50 97 C28 90 10 75 10 55 L10 20 Z"
        fill={theme.surface}
        stroke={theme.textSecondary}
        strokeWidth="3"
      />
      {/* Inner shield */}
      <Path
        d="M50 15 L82 27 L82 55 C82 71 67 84 50 90 C33 84 18 71 18 55 L18 27 Z"
        fill={theme.background}
        stroke={theme.textSecondary}
        strokeWidth="1.5"
      />
      {/* Lock body */}
      <Rect x="35" y="52" width="30" height="22" rx="3" fill={theme.textSecondary} />
      {/* Lock shackle */}
      <Path
        d="M40 52 L40 44 C40 37 60 37 60 44 L60 52"
        stroke={theme.textSecondary}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Keyhole */}
      <Path
        d="M50 58 C52.8 58 55 60.2 55 63 C55 65.1 53.7 66.9 52 67.6 L53 72 L47 72 L48 67.6 C46.3 66.9 45 65.1 45 63 C45 60.2 47.2 58 50 58 Z"
        fill={theme.background}
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

function ConfirmOrderScreen({
  currency, amount, address, network, livePrice, onConfirm, onBack  // ← add livePrice
}: any) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const co = getCoStyles(theme);
  const networkObj = POPULAR_NETWORKS.find(n => n.id === network);

  // receiveAmount is in coin units (what user typed minus coin fee)
  const receiveAmountCoin = amount && networkObj
    ? (parseFloat(amount) - parseFloat(networkObj.fee))
    : parseFloat(amount || '0');

  // USD equivalent of the receive amount
  const receiveAmountUsd = (receiveAmountCoin * (livePrice ?? 1)).toFixed(2);

  // Display decimals per coin
  const getDecimals = (c: string) => {
    switch (c) {
      case 'BTC': return 8; case 'BNB': return 4;
      case 'ETH': return 6; case 'USDT': return 2; default: return 6;
    }
  };
  const receiveAmountStr = receiveAmountCoin.toFixed(getDecimals(currency));

  // Fee in USD for display
  const feeUsd = networkObj
    ? (parseFloat(networkObj.fee) * (livePrice ?? 1)).toFixed(2)
    : '0.00';

  return (
    <SafeAreaView style={[co.container, { backgroundColor: theme.background }]}>
      <View style={co.header}>
        <TouchableOpacity onPress={onBack} style={co.headerBack}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={co.headerTitle}>Confirm order</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={co.content} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View style={co.heroSection}>
          <ThemedText style={co.receiveLabel}>Receive amount</ThemedText>
          {/* Coin amount — large */}
          <ThemedText style={co.receiveAmount}>{receiveAmountStr} {currency}</ThemedText>
          {/* USD equivalent — small subtitle */}
          <ThemedText style={co.receiveUsd}>≈ ${receiveAmountUsd}</ThemedText>
        </View>

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
                    <ThemedText style={{ color: theme.yellow }}>{address.slice(0, 4)}</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{address.slice(4, -8)}</ThemedText>
                    <ThemedText style={{ color: theme.yellow }}>{address.slice(-8)}</ThemedText>
                  </>
                ) : (
                  <ThemedText style={{ color: theme.text }}>{address}</ThemedText>
                )}
              </ThemedText>
            </View>
          </View>

          <View style={co.row}>
            <ThemedText style={co.rowLabel}>Withdrawal Amount</ThemedText>
            {/* coin amount + USD equivalent */}
            <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
              <ThemedText style={co.rowValue}>{amount} {currency}</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                ≈ ${(parseFloat(amount || '0') * (livePrice ?? 1)).toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <View style={co.row}>
            <ThemedText style={co.rowLabel}>Network fee</ThemedText>
            {/* coin fee + USD equivalent */}
            <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
              <ThemedText style={co.rowValue}>{networkObj?.fee || '0.00'} {currency}</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                ≈ ${feeUsd}
              </ThemedText>
            </View>
          </View>

          <View style={[co.row, { borderBottomWidth: 0 }]}>
            <ThemedText style={co.rowLabel}>Wallet</ThemedText>
            <ThemedText style={co.rowValue}>Spot Wallet</ThemedText>
          </View>
        </View>

        <View style={co.warningBox}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.textSecondary} style={{ marginRight: 10, marginTop: 1 }} />
          <ThemedText style={co.warningText}>
            Ensure that the address is correct and on the same network.{'\n'}
            Transactions cannot be cancelled.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={co.footer}>
        <TouchableOpacity style={co.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
          <ThemedText style={co.confirmBtnText}>Confirm</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Screen 2: Passkey / Biometric Verify
function PasskeyScreen({ onSuccess, onBack }: any) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const pk = getPkStyles(theme);
  const [authState, setAuthState] = useState<'idle' | 'verifying' | 'failed' | 'unsupported'>('idle');

  const triggerBiometric = async () => {
    setAuthState('verifying');

    // Check device support
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // No biometrics — fall back to device PIN/password
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });
      if (result.success) {
        onSuccess();
      } else {
        setAuthState('unsupported');
      }
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false,
    });

    if (result.success) {
      onSuccess();
    } else {
      setAuthState('failed');
    }
  };

  useEffect(() => {
    // Trigger immediately when screen mounts
    triggerBiometric();
  }, []);

  const stateLabel = () => {
    switch (authState) {
      case 'verifying': return 'Verifying with passkey';
      case 'failed': return 'Verification failed. Try again.';
      case 'unsupported': return 'No biometrics available on this device.';
      default: return 'Waiting...';
    }
  };

  return (
    <SafeAreaView style={[pk.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={onBack} style={pk.backBtn}>
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack} style={pk.closeBtn}>
        <Ionicons name="close" size={22} color={theme.text} />
      </TouchableOpacity>

      <View style={pk.content}>
        <ThemedText style={pk.title}>Verify with passkey</ThemedText>
        <ThemedText style={pk.subtitle}>
          Your device will ask your fingerprint, face, or screen lock.
        </ThemedText>

        {/* Icon + status */}
        <View style={pk.iconWrap}>
          <Image
            source={require('@/assets/icons/passverify.png')}
            style={{ width: 120, height: 120, tintColor: colorScheme === 'light' ? theme.text : undefined }}
            resizeMode="contain" />
          <ThemedText style={[pk.verifyingText, authState === 'failed' || authState === 'unsupported' ? { color: theme.red } : { color: theme.text },]}>
            {stateLabel()}
          </ThemedText>
        </View>

        {/* Retry button shown only on failure */}
        {(authState === 'failed' || authState === 'unsupported') && (
          <TouchableOpacity style={pk.retryBtn} onPress={triggerBiometric}>
            <ThemedText style={pk.retryText}>Try Again</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 32, gap: 6 }}>
        <BinanceShieldIcon size={18} theme={theme} />
        <ThemedText style={[pk.protectedText, { paddingBottom: 0 }]}>Protected by Binance Risk</ThemedText>
      </View>
    </SafeAreaView>
  );
}

// Screen 3: Processing
function ProcessingScreen({ amount, currency, onViewHistory, onBack }: any) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const pr = getPrStyles(theme);
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
        Animated.timing(sandAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sandTranslate = sandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <SafeAreaView style={[pr.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={pr.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>

      <View style={[pr.content, { marginTop: -250 }]}>
        {/* PNG hourglass icon */}
        <Image
          source={require('@/assets/icons/withrawprocess.png')}
          style={{ width: 100, height: 100, marginBottom: 32, tintColor: colorScheme === 'light' ? theme.text : undefined }}
          resizeMode="contain"
        />

        <ThemedText style={pr.title}>Withdrawal Processing</ThemedText>
        <ThemedText style={pr.amount}>{amount} {currency}</ThemedText>
        <ThemedText style={[pr.timeText, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
          Estimated completion time: {timeStr}
        </ThemedText>
        <ThemedText style={pr.subText} numberOfLines={2} adjustsFontSizeToFit>
          You will receive an email once withdrawal is completed. View history for the latest updates.
        </ThemedText>
      </View>

      <View style={pr.footer}>
        <TouchableOpacity style={pr.viewBtn} onPress={onViewHistory}>
          <ThemedText style={pr.viewBtnText}>View History</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Screen 4: Success
function SuccessScreen({ amount, currency, onViewHistory, onBack }: any) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const su = getSuStyles(theme);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const diamondAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(diamondAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[su.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={su.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>

      <View style={su.content}>
        {/* Green checkmark */}
        <Animated.View style={[su.checkWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={su.checkOuter}>
            <View style={su.checkInner}>
              <Ionicons name="checkmark" size={36} color={theme.background} />
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

// Main Screen
export default function WithdrawCoinScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { coin } = useLocalSearchParams<{ coin: string }>();
  const rawCoin = typeof coin === 'string' ? coin.toUpperCase() : 'BTC';
  const currency = rawCoin.includes('-') ? rawCoin.split('-')[0] : rawCoin;
  const { kshRate } = useCurrencyStore((state) => state);

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [isNetworkModalVisible, setNetworkModalVisible] = useState(false);


  // Flow step: 'form' | 'confirm' | 'passkey' | 'processing' | 'success'
  const [step, setStep] = useState<'form' | 'confirm' | 'passkey' | 'processing' | 'success'>('form');
  const [withdrawalStatus, setWithdrawalStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [pollIntervalId, setPollIntervalId] = useState<any>(null);
  const [currentWithdrawalId, setCurrentWithdrawalId] = useState<string | null>(null);

  const { requestWithdrawal, fetchHistory, history } = useWithdrawalStore();

  const getDecimals = (c: string) => {
    switch (c) {
      case 'BTC': return 8; case 'BNB': return 4;
      case 'ETH': return 6; case 'USDT': return 2; default: return 6;
    }
  };

  const { globalBalance, fetchGlobalBalance } = usePortfolioStore();

  useEffect(() => {
    fetchGlobalBalance();
  }, []);

  const [livePrice, setLivePrice] = useState<number>(1);
  const [priceLoading, setPriceLoading] = useState(true);

  const availableInCurrency = priceLoading ? null : globalBalance / livePrice;
  const availableBalanceStr = availableInCurrency !== null
    ? availableInCurrency.toFixed(getDecimals(currency))
    : null;

  useEffect(() => {
    const symbolMap: Record<string, string> = {
      BTC: 'btcusdt', ETH: 'ethusdt', BNB: 'bnbusdt',
      USDT: 'usdtusdt', USDC: 'usdcusdt', SOL: 'solusdt',
      XRP: 'xrpusdt', DOGE: 'dogeusdt', LTC: 'ltcusdt',
      MATIC: 'maticusdt', TRX: 'trxusdt', TON: 'tonusdt',
    };

    const symbol = symbolMap[currency];

    if (!symbol || symbol === 'usdtusdt') {
      setLivePrice(1);
      setPriceLoading(false);
      return;
    }

    // 1. Fetch REST price immediately — no waiting for WS handshake
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`)
      .then(r => r.json())
      .then(data => {
        const price = parseFloat(data.price);
        if (price > 0) setLivePrice(price);
      })
      .catch(() => { }) // fallback to WS if REST fails
      .finally(() => setPriceLoading(false));

    // 2. WebSocket keeps it live after initial load
    let lastWsUpdate = 0;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
    ws.onmessage = (e) => {
      try {
        const now = Date.now();
        // Throttle updates to prevent screen UI from hanging due to continuous re-rendering
        if (now - lastWsUpdate > 1500) {
          const data = JSON.parse(e.data);
          const price = parseFloat(data.c);
          if (price > 0) {
            setLivePrice(price);
            lastWsUpdate = now;
          }
        }
      } catch { }
    };
    return () => ws.close();
  }, [currency]);

  // Show skeleton/placeholder while price loads

  // Resets all withdrawal flow state cleanly before navigating away
  const resetFlow = () => {
    if (pollIntervalId) clearInterval(pollIntervalId);
    setPollIntervalId(null);
    setStep('form');
    setWithdrawalStatus('PENDING');
    setCurrentWithdrawalId(null);
    setAmount('');
    setAddress('');
    setNetwork('');
  };

  const handlePasskeySuccess = async () => {
    setStep('processing');
    setWithdrawalStatus('PENDING');
    setCurrentWithdrawalId(null); // clear any stale ID before new request

    // Convert coin amount to USD before sending — backend stores and deducts in USD
    const usdAmount = parseFloat(amount) * livePrice;

    const res = await requestWithdrawal({
      amount: usdAmount,
      currency,
      destinationAddress: address,
      network
    });

    if (res.success) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: `${currency} Withdrawal Processing`,
          body: `Your withdrawal of ${amount} ${currency} is currently processing. If you do not recognize this activity, please contact us immediately.`,
        },
        trigger: null,
      });
      const newId = res.withdrawalId ?? null;
      setCurrentWithdrawalId(newId);
      setTimeout(() => {
        fetchHistory();
        const interval = setInterval(() => {
          fetchHistory();
        }, 5000);
        setPollIntervalId(interval);
      }, 8000);
    } else {
      Alert.alert('Error', res.error || 'Withdrawal failed');
      setStep('confirm');
    }
  };

  // Helper to find the correct withdrawal strictly by ID
  const getActiveWithdrawal = () => {
    if (currentWithdrawalId) {
      return history.find(w => w.id === currentWithdrawalId) || null;
    }
    return null;
  };

  // Re-check status immediately when screen regains focus (e.g. returning from history screen).
  useFocusEffect(
    useCallback(() => {
      if (step === 'processing') {
        const thisWithdrawal = getActiveWithdrawal();
        if (thisWithdrawal?.status === 'COMPLETED') {
          if (withdrawalStatus !== 'COMPLETED') {
            const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' (UTC)';
            Notifications.scheduleNotificationAsync({
              content: {
                title: `${currency} Withdrawal Successful`,
                body: `You have successfully withdrawn ${amount} ${currency} at ${timeStr}. If you do not recognize this activity please contact us immediately.`,
              },
              trigger: null,
            });
          }
          setWithdrawalStatus('COMPLETED');
          if (pollIntervalId) clearInterval(pollIntervalId);
        }
        fetchHistory();
      }
    }, [step, currentWithdrawalId, history, pollIntervalId, withdrawalStatus, amount, currency])
  );

  useEffect(() => {
    if (step === 'processing' && history.length > 0) {
      const thisWithdrawal = getActiveWithdrawal();
      if (thisWithdrawal && thisWithdrawal.status === 'COMPLETED') {
        if (withdrawalStatus !== 'COMPLETED') {
          const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' (UTC)';
          Notifications.scheduleNotificationAsync({
            content: {
              title: `${currency} Withdrawal Successful`,
              body: `You have successfully withdrawn ${amount} ${currency} at ${timeStr}. If you do not recognize this activity please contact us immediately.`,
            },
            trigger: null,
          });
        }
        setWithdrawalStatus('COMPLETED');
        if (pollIntervalId) clearInterval(pollIntervalId);
      }
    }
  }, [history, step, currentWithdrawalId, pollIntervalId, withdrawalStatus, amount, currency]);

  useEffect(() => {
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [pollIntervalId]);

  const handleWithdraw = () => {
    if (!address || !network || !amount) {
      Alert.alert('Error', 'Please fill in all fields (Address, Network, Amount)');
      return;
    }
    setStep('confirm');
  };

  // Flow rendering
  if (step === 'confirm') {
    return (
      <ConfirmOrderScreen
        currency={currency} amount={amount} address={address} network={network}
        livePrice={livePrice}
        onConfirm={() => setStep('passkey')}
        onBack={() => setStep('form')}
      />
    );
  }
  if (step === 'passkey') {
    return <PasskeyScreen onSuccess={handlePasskeySuccess} onBack={() => setStep('confirm')} />;
  }
  if (step === 'processing' || step === 'success') {
    const handleBack = () => { resetFlow(); router.back(); };
    if (withdrawalStatus === 'COMPLETED') {
      return <SuccessScreen amount={amount} currency={currency} onViewHistory={() => router.push('/history')} onBack={handleBack} />;
    }
    return <ProcessingScreen amount={amount} currency={currency} onViewHistory={() => router.push('/history')} onBack={handleBack} />;
  }

  // Step: form (original screen)
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
              style={[styles.input, { paddingTop: 14, paddingBottom: 14 }]}
              placeholder="Long press to paste"
              placeholderTextColor={theme.textSecondary}
              onChangeText={setAddress}
              multiline autoCapitalize="none" autoCorrect={false}
            >
              {address ? (
                address.length > 20 ? (
                  <Text>
                    <Text style={{ color: theme.yellow }}>{address.slice(0, 8)}</Text>
                    <Text style={{ color: theme.text }}>{address.slice(8, -8)}</Text>
                    <Text style={{ color: theme.yellow }}>{address.slice(-8)}</Text>
                  </Text>
                ) : (
                  <Text style={{ color: theme.text }}>{address}</Text>
                )
              ) : null}
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
              <TouchableOpacity
                onPress={() => availableBalanceStr && setAmount(availableBalanceStr)}
                disabled={priceLoading}
              >
                <ThemedText style={[styles.maxText, { color: priceLoading ? theme.textSecondary : theme.yellow }]}>
                  Max
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.availableRow}>
            <ThemedText style={[styles.availableLabel, { color: theme.textSecondary }]}>
              Available
            </ThemedText>
            <ThemedText style={[styles.availableValue, { color: theme.text }]}>
              {availableBalanceStr ?? '...'} {!priceLoading && currency}
            </ThemedText>
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
          <ThemedText style={[styles.summaryValueMain, { color: theme.text }]}>{amount && networkObj
            ? (parseFloat(amount) - parseFloat(networkObj.fee)).toFixed(getDecimals(currency))
            : (amount || '0.00')} {currency}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Network fee</ThemedText>
          <ThemedText style={[styles.summaryValueSub, { color: theme.text }]}>
            {network ? POPULAR_NETWORKS.find(n => n.id === network)?.fee : '0.00'} {currency}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.yellow }]}
          onPress={handleWithdraw}
        >
          <ThemedText style={styles.primaryButtonText}>Withdraw</ThemedText>
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
                    Fee {net.fee} {currency} ( ≈ KSh {(Number(net.fee) * livePrice * kshRate).toFixed(2)} )
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

// Styles: Confirm Order
const getCoStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerBack: { width: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 'bold', color: theme.text },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heroSection: { alignItems: 'center', paddingVertical: 32 },
  receiveLabel: { fontSize: 14, color: theme.textSecondary, marginBottom: 10 },
  receiveAmount: { fontSize: 28, fontWeight: 'bold', color: theme.text, marginBottom: 6, lineHeight: 42 },
  receiveUsd: { fontSize: 14, color: theme.textSecondary },
  detailsSection: { marginTop: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.surfaceHighlight,
  },
  rowLabel: { fontSize: 14, color: theme.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: theme.text, textAlign: 'right', flex: 1.5 },
  warningBox: {
    flexDirection: 'row', backgroundColor: theme.surface, borderRadius: 12,
    padding: 16, marginTop: 24,
  },
  warningText: { fontSize: 13, color: theme.textSecondary, flex: 1, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 },
  confirmBtn: {
    height: 52, borderRadius: 8, backgroundColor: theme.yellow,
    justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

// Styles: Passkey
const getPkStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { position: 'absolute', top: 54, left: 8, zIndex: 10, padding: 8 },
  closeBtn: { position: 'absolute', top: 54, right: 20, zIndex: 10, padding: 8 },
  content: { flex: 1, paddingTop: 70, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.text, marginBottom: 12, lineHeight: 30, textAlign: 'center' },
  subtitle: { fontSize: 15, color: theme.textSecondary, lineHeight: 22, marginBottom: 60, textAlign: 'center' },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  iconCircleOuter: {
    width: 100, height: 90, borderWidth: 2, borderColor: theme.text,
    borderRadius: 50, justifyContent: 'center', alignItems: 'center',
    position: 'relative', marginBottom: 8,
  },
  iconCircleInner: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: theme.text,
    position: 'absolute', top: 14,
  },
  shoulders: {
    position: 'absolute', bottom: 0, width: 70, height: 30,
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    borderTopWidth: 2, borderColor: theme.text,
  },
  keyBadge: {
    position: 'absolute', right: -14, top: 8,
    backgroundColor: theme.background, borderRadius: 12, padding: 2,
  },
  keyEmoji: { fontSize: 18 },
  dotsBar: {
    flexDirection: 'row', gap: 8, backgroundColor: theme.surface,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 4,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.text },
  verifyingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bar: { width: 4, height: 20, borderRadius: 2 },
  verifyingText: { fontSize: 15, color: theme.text, textAlign: 'center', marginTop: 8 },
  protectedText: { textAlign: 'center', color: theme.textSecondary, fontSize: 13, paddingBottom: 32 },
  retryBtn: {
    marginTop: 24, paddingVertical: 12, paddingHorizontal: 40,
    borderRadius: 8, borderWidth: 1, borderColor: theme.yellow,
  },
  retryText: { color: theme.yellow, fontSize: 15, fontWeight: '600' },
});

// Styles: Processing
const getPrStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 54, left: 8, zIndex: 10, padding: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  hourglassWrap: { width: 80, height: 120, alignItems: 'center', marginBottom: 32, position: 'relative' },
  hourglassTop: {
    width: 0, height: 0,
    borderLeftWidth: 36, borderRightWidth: 36, borderTopWidth: 44,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: theme.text,
    opacity: 0.9,
  },
  sand: {
    position: 'absolute', top: 10, width: 20, height: 20,
    backgroundColor: theme.yellow, borderRadius: 2, opacity: 0.85,
  },
  hourglassNeck: { width: 4, height: 12, backgroundColor: theme.text, opacity: 0.6 },
  hourglassBottom: {
    width: 0, height: 0,
    borderLeftWidth: 36, borderRightWidth: 36, borderBottomWidth: 44,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: theme.text,
    opacity: 0.9,
  },
  hourglassFrame: {
    position: 'absolute', top: 0, width: 80, height: 4,
    backgroundColor: theme.text, borderRadius: 2,
  },
  hourglassFrameBottom: { top: undefined, bottom: 0 },
  title: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 16 },
  amount: { fontSize: 32, fontWeight: 'bold', color: theme.text, marginBottom: 16 },
  timeText: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 12, lineHeight: 20 },
  subText: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  viewBtn: {
    height: 52, borderRadius: 8, backgroundColor: theme.yellow,
    justifyContent: 'center', alignItems: 'center',
  },
  viewBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

// Styles: Success
const getSuStyles = (theme: any) => StyleSheet.create({
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
    width: 20, height: 20, backgroundColor: theme.yellow,
    transform: [{ rotate: '45deg' }], marginBottom: 32,
  },
  checkWrap: { marginBottom: 28 },
  checkOuter: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 2.5,
    borderColor: theme.green, justifyContent: 'center', alignItems: 'center',
  },
  checkInner: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: theme.green, justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 14 },
  amount: { fontSize: 32, fontWeight: 'bold', color: theme.text, marginBottom: 20 },
  subText: { fontSize: 11, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
});

// Original form styles (unchanged)
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
  summaryValueMain: { fontSize: 14, fontWeight: 'bold' },
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