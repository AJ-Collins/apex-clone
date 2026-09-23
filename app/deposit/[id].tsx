import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateAddress } from '@/utils/addressGenerator';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Network definitions per coin
// Each entry has:
//   name      — short label shown in the chip/header (e.g. "BSC")
//   fullName  — full protocol name shown as subtitle
//   value     — the string passed to generateAddress / AddressValidator
//   confirm   — confirmation info shown in the modal card
//   minDeposit / arrival — modal card metadata
// ---------------------------------------------------------------------------
interface NetworkOption {
  name: string;
  fullName: string;
  value: string;
  confirm: string;
  minDeposit: string;
  arrival: string;
}

const NETWORKS_BY_COIN: Record<string, NetworkOption[]> = {
  BTC: [
    { name: 'BTC', fullName: 'Bitcoin (Native SegWit)', value: 'bitcoin_segwit', confirm: '1 block confirmation/s', minDeposit: '>0.000006 BTC', arrival: 'Est. arrival 1 mins' },
    { name: 'BTC Legacy', fullName: 'Bitcoin (Legacy P2PKH)', value: 'bitcoin', confirm: '1 block confirmation/s', minDeposit: '>0.00001 BTC', arrival: 'Est. arrival 1 mins' },
  ],
  ETH: [
    { name: 'ETH', fullName: 'Ethereum (ERC20)', value: 'erc20', confirm: '12 block confirmation/s', minDeposit: '>0.00002 ETH', arrival: 'Est. arrival 3 mins' },
    { name: 'ARB', fullName: 'Arbitrum One', value: 'arbitrum', confirm: '1 block confirmation/s', minDeposit: '>0.00001 ETH', arrival: 'Est. arrival 1 mins' },
    { name: 'BSC', fullName: 'BNB Smart Chain (BEP20)', value: 'bsc', confirm: '1 block confirmation/s', minDeposit: '>0.00000002 ETH', arrival: 'Est. arrival 1 mins' },
  ],
  USDT: [
    { name: 'ETH', fullName: 'Ethereum (ERC20)', value: 'erc20', confirm: '12 block confirmation/s', minDeposit: '>1 USDT', arrival: 'Est. arrival 3 mins' },
    { name: 'BSC', fullName: 'BNB Smart Chain (BEP20)', value: 'bsc', confirm: '1 block confirmation/s', minDeposit: '>1 USDT', arrival: 'Est. arrival 1 mins' },
    { name: 'TRX', fullName: 'Tron (TRC20)', value: 'tron', confirm: '1 block confirmation/s', minDeposit: '>1 USDT', arrival: 'Est. arrival 1 mins' },
    { name: 'POL', fullName: 'Polygon', value: 'polygon', confirm: '1 block confirmation/s', minDeposit: '>1 USDT', arrival: 'Est. arrival 1 mins' },
    { name: 'ARB', fullName: 'Arbitrum One', value: 'arbitrum', confirm: '1 block confirmation/s', minDeposit: '>1 USDT', arrival: 'Est. arrival 1 mins' },
    { name: 'SOL', fullName: 'Solana (SPL)', value: 'solana', confirm: '1 block confirmation/s', minDeposit: '>1 USDT', arrival: 'Est. arrival 1 mins' },
  ],
  USDC: [
    { name: 'ETH', fullName: 'Ethereum (ERC20)', value: 'erc20', confirm: '12 block confirmation/s', minDeposit: '>1 USDC', arrival: 'Est. arrival 3 mins' },
    { name: 'BSC', fullName: 'BNB Smart Chain (BEP20)', value: 'bsc', confirm: '1 block confirmation/s', minDeposit: '>1 USDC', arrival: 'Est. arrival 1 mins' },
    { name: 'TRX', fullName: 'Tron (TRC20)', value: 'tron', confirm: '1 block confirmation/s', minDeposit: '>1 USDC', arrival: 'Est. arrival 1 mins' },
    { name: 'POL', fullName: 'Polygon', value: 'polygon', confirm: '1 block confirmation/s', minDeposit: '>1 USDC', arrival: 'Est. arrival 1 mins' },
    { name: 'ARB', fullName: 'Arbitrum One', value: 'arbitrum', confirm: '1 block confirmation/s', minDeposit: '>1 USDC', arrival: 'Est. arrival 1 mins' },
    { name: 'SOL', fullName: 'Solana (SPL)', value: 'solana', confirm: '1 block confirmation/s', minDeposit: '>1 USDC', arrival: 'Est. arrival 1 mins' },
  ],
  BNB: [
    { name: 'BSC', fullName: 'BNB Smart Chain (BEP20)', value: 'bsc', confirm: '1 block confirmation/s', minDeposit: '>0.001 BNB', arrival: 'Est. arrival 1 mins' },
    { name: 'ETH', fullName: 'Ethereum (BEP2)', value: 'erc20', confirm: '12 block confirmation/s', minDeposit: '>0.001 BNB', arrival: 'Est. arrival 3 mins' },
  ],
  SOL: [
    { name: 'SOL', fullName: 'Solana', value: 'solana', confirm: '1 block confirmation/s', minDeposit: '>0.01 SOL', arrival: 'Est. arrival 1 mins' },
  ],
  TRX: [
    { name: 'TRX', fullName: 'Tron', value: 'tron', confirm: '1 block confirmation/s', minDeposit: '>1 TRX', arrival: 'Est. arrival 1 mins' },
  ],
  XRP: [
    { name: 'XRP', fullName: 'XRP Ledger', value: 'xrp', confirm: '1 block confirmation/s', minDeposit: '>0.1 XRP', arrival: 'Est. arrival 1 mins' },
  ],
  LTC: [
    { name: 'LTC', fullName: 'Litecoin', value: 'litecoin', confirm: '1 block confirmation/s', minDeposit: '>0.001 LTC', arrival: 'Est. arrival 1 mins' },
  ],
  DOGE: [
    { name: 'DOGE', fullName: 'Dogecoin', value: 'dogecoin', confirm: '1 block confirmation/s', minDeposit: '>1 DOGE', arrival: 'Est. arrival 1 mins' },
  ],
  MATIC: [
    { name: 'POL', fullName: 'Polygon', value: 'polygon', confirm: '1 block confirmation/s', minDeposit: '>0.1 MATIC', arrival: 'Est. arrival 1 mins' },
    { name: 'ETH', fullName: 'Ethereum (ERC20)', value: 'erc20', confirm: '12 block confirmation/s', minDeposit: '>0.1 MATIC', arrival: 'Est. arrival 3 mins' },
  ],
};

/** Fallback for coins not in the map above (most EVM-based altcoins). */
const DEFAULT_NETWORKS: NetworkOption[] = [
  { name: 'ETH', fullName: 'Ethereum (ERC20)', value: 'erc20', confirm: '12 block confirmation/s', minDeposit: '>0.00002', arrival: 'Est. arrival 3 mins' },
  { name: 'BSC', fullName: 'BNB Smart Chain (BEP20)', value: 'bsc', confirm: '1 block confirmation/s', minDeposit: '>0.00000002', arrival: 'Est. arrival 1 mins' },
  { name: 'ARB', fullName: 'Arbitrum One', value: 'arbitrum', confirm: '1 block confirmation/s', minDeposit: '>0.00001', arrival: 'Est. arrival 1 mins' },
];

// ---------------------------------------------------------------------------
// Coin icons (unchanged from original)
// ---------------------------------------------------------------------------
const COIN_ICONS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'currency-usd',
  USDC: 'currency-usd',
  BNB: 'currency-btc',
  MATIC: 'polygon',
  SOL: 'weather-sunny',
  TON: 'diamond',
  TRX: 'chart-line',
  XRP: 'alpha-x-circle',
  LTC: 'litecoin',
  DOGE: 'dog',
  OG: 'infinity',
  '1000CAT': 'cat',
  '1000CHEEMS': 'dog',
  '1000PEPPER': 'leaf',
  '1000SATS': 'stairs',
  '1INCH': 'unicorn-variant',
  ERN: 'infinity',
  ETC: 'ethereum',
  ETHFI: 'transit-connection-variant',
  ETHW: 'ethereum',
  KATETH: 'circle',
  NEIRO: 'dog',
  USDE: 'currency-usd',
  VTHO: 'flash',
  WBETH: 'ethereum',
  WETH: 'ethereum',
  XAUT: 'gold',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DepositCoinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coin = (id ?? '').toUpperCase();

  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const availableNetworks: NetworkOption[] = NETWORKS_BY_COIN[coin] ?? DEFAULT_NETWORKS;

  const [isNetworkModalVisible, setNetworkModalVisible] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // ── Key change: use generateAddress instead of the hardcoded map ──────────
  const address = useMemo(() => {
    if (!selectedNetwork) return '';
    return generateAddress(coin, selectedNetwork.value);
  }, [coin, selectedNetwork]);

  const copyAddress = async () => {
    if (!address) return;
    await Clipboard.setStringAsync(address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="bold" style={styles.headerTitle}>Deposit {coin}</ThemedText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="help-circle-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialCommunityIcons name="history" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* QR CODE or illustration */}
        {!selectedNetwork ? (
          <View style={styles.illustrationContainer}>
            <View style={styles.bgShape1} />
            <View style={styles.bgShape2} />
            <View style={styles.pinContainer}>
              <View style={styles.pinBox}>
                <Ionicons name="location-sharp" size={40} color="#f3ba2f" />
                <View style={styles.pinLine} />
              </View>
            </View>
            <View style={styles.networkContainer}>
              <MaterialCommunityIcons name="graph" size={50} color="#f3ba2f" />
            </View>
          </View>
        ) : (
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode value={address} size={180} backgroundColor="white" color="black" />
              <View style={styles.qrIconOverlay}>
                <MaterialCommunityIcons
                  name={(COIN_ICONS[coin] || 'currency-usd') as any}
                  size={32}
                  color="#f3ba2f"
                />
              </View>
            </View>
          </View>
        )}

        {/* NETWORK SELECTION */}
        <View style={styles.content}>
          <ThemedText style={[styles.networkLabel, { color: theme.textSecondary }]}>Network</ThemedText>

          {!selectedNetwork ? (
            <View style={styles.networkSelectorContainer}>
              <ThemedText
                style={[styles.networkPlaceholder, { color: theme.textSecondary }]}
                onPress={() => setNetworkModalVisible(true)}
              >
                Please choose network first
              </ThemedText>
              <TouchableOpacity
                style={[styles.swapButton, { backgroundColor: theme.surface }]}
                onPress={() => setNetworkModalVisible(true)}
              >
                <MaterialCommunityIcons name="swap-horizontal" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.networkSelectedContainer}>
              <View>
                <ThemedText type="bold" style={styles.selectedNetworkName}>
                  {selectedNetwork.name}
                </ThemedText>
                <ThemedText style={[styles.selectedNetworkFullName, { color: theme.textSecondary }]}>
                  {selectedNetwork.fullName}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.swapButton, { backgroundColor: theme.surface }]}
                onPress={() => setNetworkModalVisible(true)}
              >
                <MaterialCommunityIcons name="swap-horizontal" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.separator, { backgroundColor: theme.surfaceHighlight }]} />

          {/* DEPOSIT ADDRESS */}
          {selectedNetwork && address ? (
            <View style={styles.addressSection}>
              <ThemedText style={[styles.networkLabel, { color: theme.textSecondary, marginTop: 16 }]}>
                Deposit Address
              </ThemedText>

              <View style={styles.addressContainer}>
                <ThemedText style={[styles.addressText, { color: theme.text }]}>
                  <ThemedText style={[styles.addressText, { color: '#f3ba2f', fontWeight: 'bold' }]}>
                    {address.substring(0, 6)}
                  </ThemedText>
                  <ThemedText style={styles.addressText}>
                    {address.substring(6, address.length - 6)}
                  </ThemedText>
                  <ThemedText style={[styles.addressText, { color: '#f3ba2f', fontWeight: 'bold' }]}>
                    {address.substring(address.length - 6)}
                  </ThemedText>
                </ThemedText>
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: isCopied ? '#0FC97B' : theme.surface }]}
                  onPress={copyAddress}
                >
                  {isCopied ? (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  ) : (
                    <Ionicons name="copy-outline" size={20} color={theme.text} />
                  )}
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.addressWarning}>
                Only send {coin} on the {selectedNetwork.fullName} network to this address.
                Sending other assets or using a different network will result in permanent loss.
              </ThemedText>

              <TouchableOpacity style={styles.moreDetailsButton}>
                <ThemedText style={[styles.moreDetailsText, { color: theme.textSecondary }]}>
                  More Details
                </ThemedText>
                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* BOTTOM BUTTON */}
      {selectedNetwork && (
        <View style={[styles.bottomButtonContainer, { borderTopColor: theme.surfaceHighlight }]}>
          <TouchableOpacity style={styles.saveButton} onPress={copyAddress}>
            <ThemedText style={styles.saveButtonText}>Copy Address</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* NETWORK MODAL */}
      <Modal
        visible={isNetworkModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => selectedNetwork && setNetworkModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => selectedNetwork && setNetworkModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <View style={styles.modalHandle} />
              <ThemedText type="bold" style={styles.modalTitle}>Choose Network</ThemedText>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.networkList}>
                {availableNetworks.map((net, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.networkCard,
                      {
                        borderColor:
                          selectedNetwork?.value === net.value
                            ? '#f3ba2f'
                            : theme.surfaceHighlight,
                        backgroundColor: theme.background,
                      },
                    ]}
                    onPress={() => {
                      setSelectedNetwork(net);
                      setNetworkModalVisible(false);
                    }}
                  >
                    <View style={styles.networkCardHeader}>
                      <ThemedText type="bold" style={styles.networkName}>{net.name}</ThemedText>
                      <ThemedText style={[styles.networkFullName, { color: theme.textSecondary }]}>
                        {net.fullName}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.networkInfoText, { color: theme.textSecondary }]}>
                      {net.confirm}
                    </ThemedText>
                    <ThemedText style={[styles.networkInfoText, { color: theme.textSecondary }]}>
                      Min. deposit {net.minDeposit}
                    </ThemedText>
                    <ThemedText style={[styles.networkInfoText, { color: theme.textSecondary }]}>
                      {net.arrival}
                    </ThemedText>
                  </TouchableOpacity>
                ))}

                <View style={[styles.warningBox, { backgroundColor: theme.surface }]}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={theme.text}
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <ThemedText style={[styles.warningText, { color: theme.textSecondary }]}>
                    Only supported networks are shown. Depositing via an unsupported network
                    will result in permanent loss of funds.
                  </ThemedText>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* COPY NOTIFICATION */}
      {isCopied && (
        <View style={styles.copyNotificationContainer} pointerEvents="none">
          <View style={styles.copyNotification}>
            <ThemedText type="bold" style={styles.copyNotificationTitle}>
              Copied to clipboard
            </ThemedText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles (unchanged from original)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
  },
  headerButton: { padding: 8, width: 48, alignItems: 'center' },
  headerTitle: { fontSize: 18, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: { padding: 8, marginLeft: 4 },
  illustrationContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  qrContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconOverlay: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgShape1: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
    left: 40,
    top: 40,
  },
  bgShape2: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    left: '50%',
    top: 80,
  },
  pinContainer: {
    position: 'absolute',
    top: 60,
    left: '35%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
  },
  pinBox: { alignItems: 'center' },
  pinLine: { width: 30, height: 3, backgroundColor: '#888', marginTop: 4, borderRadius: 2 },
  networkContainer: {
    position: 'absolute',
    bottom: 50,
    right: '30%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  content: { paddingHorizontal: 24, marginTop: 20 },
  networkLabel: { fontSize: 14, marginBottom: 12 },
  networkSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  networkSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedNetworkName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  selectedNetworkFullName: { fontSize: 14 },
  networkPlaceholder: { fontSize: 18, fontWeight: '500' },
  swapButton: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, width: '100%', opacity: 0.5 },
  addressSection: { marginTop: 8 },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 16,
  },
  addressText: { fontSize: 18, flex: 1, lineHeight: 30, fontWeight: '500', flexWrap: 'wrap' },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: -4,
  },
  addressWarning: { fontSize: 12, color: '#e74c3c', lineHeight: 18, marginBottom: 24 },
  moreDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  moreDetailsText: { fontSize: 14, marginRight: 4 },
  bottomButtonContainer: { padding: 16, borderTopWidth: 1 },
  saveButton: {
    backgroundColor: '#f3ba2f',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, marginBottom: 16 },
  networkList: { paddingBottom: 20 },
  networkCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  networkCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  networkName: { fontSize: 16, marginRight: 8 },
  networkFullName: { fontSize: 14 },
  networkInfoText: { fontSize: 12, marginBottom: 4 },
  warningBox: { flexDirection: 'row', padding: 12, borderRadius: 8, marginTop: 8 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18 },
  copyNotificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  copyNotification: {
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  copyNotificationTitle: { color: '#FFFFFF', fontSize: 16, marginBottom: 6, textAlign: 'center' },
  copyNotificationMessage: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, lineHeight: 18 },
});