import { AssetsHeader } from '@/components/AssetsHeader';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CryptoCurrency, useCurrencyStore } from '@/store/currencyStore';
import { useLivePriceConnection, useLivePricesStore } from '@/store/livePricesStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Image, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CURRENCIES: { label: CryptoCurrency; icon: string }[] = [
  { label: 'BTC', icon: 'bitcoin' },
  { label: 'ETH', icon: 'ethereum' },
  { label: 'BNB', icon: 'currency-btc' },
  { label: 'USDT', icon: 'currency-usd' },
];

export default function AssetsOverviewScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('Crypto');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 16 });
  const selectorRef = useRef<View>(null);

  // Selector syntax guarantees re-render on every store change
  const { selectedCurrency, setSelectedCurrency, kshRate } = useCurrencyStore((state) => state);
  const { fetchGlobalBalance, fetchPortfolio, balances } = usePortfolioStore();
  const insets = useSafeAreaInsets();

  useLivePriceConnection();
  const prices = useLivePricesStore((s) => s.prices);

  const getBal = (sym: string) => {
    const found = balances?.find((b: any) => b.currency === sym || b.symbol === sym || b.coin === sym);
    return found ? Number(found.balance || found.amount || found.available || 0) : 0;
  };

  const btcAmount = getBal('BTC') || 0.428512;
  const btcLive = prices['btcusdt'];
  const btcPriceLive = btcLive?.price ?? 0;
  const btcChangePercent = btcLive?.changePercent ?? 0;
  const btcUsdValue = btcAmount * btcPriceLive;
  const btcPnlUsd = btcUsdValue * (btcChangePercent / 100);

  const trxAmount = getBal('TRX') || 14502.5;
  const trxLive = prices['trxusdt'];
  const trxPriceLive = trxLive?.price ?? 0;
  const trxChangePercent = trxLive?.changePercent ?? 0;
  const trxUsdValue = trxAmount * trxPriceLive;
  const trxPnlUsd = trxUsdValue * (trxChangePercent / 100);

  const formatNumber = (num: number, decimals: number = 2) => {
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const getSelectedCurrencyValue = (usdVal: number) => {
    if (selectedCurrency === 'USDT') return formatNumber(usdVal, 2);
    if (selectedCurrency === 'KES') return `KSh ${formatNumber(usdVal * kshRate, 2)}`;
    const targetSymbol = selectedCurrency.toLowerCase() + 'usdt';
    const targetPrice = prices[targetSymbol]?.price || 1;
    let decimals = 2;
    if (selectedCurrency === 'BTC') decimals = 8;
    if (selectedCurrency === 'ETH') decimals = 6;
    if (selectedCurrency === 'BNB') decimals = 4;
    return formatNumber(usdVal / targetPrice, decimals);
  };

  const renderCryptoTab = () => (
    <View style={styles.cryptoTabContent}>

      {/* Currency Selector Row */}
      <View style={styles.currencyRow}>
        <ThemedText style={[styles.currencyLabel, { color: theme.textSecondary }]}>
          Total Assets Value
        </ThemedText>
        <TouchableOpacity
          ref={selectorRef as any}
          style={[styles.currencySelector, { backgroundColor: theme.surfaceHighlight }]}
          onPress={() => {
            selectorRef.current?.measure((x, y, width, height, pageX, pageY) => {
              const screenWidth = Dimensions.get('window').width;
              setDropdownPos({
                top: pageY + height + 8,
                right: screenWidth - (pageX + width),
              });
              setDropdownVisible(true);
            });
          }}
        >
          <ThemedText style={[styles.currencySelectorText, { color: theme.text }]}>
            {selectedCurrency}
          </ThemedText>
          <Ionicons name="chevron-down" size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* BTC Asset */}
      <View style={styles.assetItem}>
        <View style={styles.assetHeader}>
          <Image
            source={{ uri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' }}
            style={styles.coinIcon}
          />
          <View style={styles.coinNames}>
            <ThemedText type="bold" style={styles.coinTitle}>BTC</ThemedText>
            <ThemedText style={[styles.coinSubtitle, { color: theme.textSecondary }]}>Bitcoin</ThemedText>
          </View>
          <View style={styles.coinBalance}>
            <ThemedText type="bold" style={styles.coinAmount}>{formatNumber(btcAmount, 8)}</ThemedText>
            <ThemedText style={[styles.coinBtcValue, { color: theme.textSecondary }]}>{getSelectedCurrencyValue(btcUsdValue)} {selectedCurrency}</ThemedText>
          </View>
        </View>
        <View style={styles.assetDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Today's PNL</ThemedText>
            <ThemedText style={[styles.detailValue, { color: btcChangePercent >= 0 ? '#0FC97B' : '#F04B5A' }]}>
              {btcPnlUsd >= 0 ? '+' : '-'}${formatNumber(Math.abs(btcPnlUsd), 2)} ({btcChangePercent >= 0 ? '+' : ''}{btcChangePercent.toFixed(2)}%)
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Average Price</ThemedText>
            <ThemedText style={[styles.detailValue, { color: theme.text }]}>${formatNumber(btcPriceLive, 2)}</ThemedText>
          </View>
        </View>
        <View style={styles.assetActions}>
          <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.surfaceHighlight }]}>
            <ThemedText style={styles.smallButtonText}>Earn</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.surfaceHighlight }]}>
            <ThemedText style={styles.smallButtonText}>Trade</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      {/* TRX Asset */}
      <View style={styles.assetItem}>
        <View style={styles.assetHeader}>
          <Image
            source={{ uri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png' }}
            style={styles.coinIcon}
          />
          <View style={styles.coinNames}>
            <ThemedText type="bold" style={styles.coinTitle}>TRX</ThemedText>
            <ThemedText style={[styles.coinSubtitle, { color: theme.textSecondary }]}>Tron</ThemedText>
          </View>
          <View style={styles.coinBalance}>
            <ThemedText type="bold" style={styles.coinAmount}>{formatNumber(trxAmount, 3)}</ThemedText>
            <ThemedText style={[styles.coinBtcValue, { color: theme.textSecondary }]}>{getSelectedCurrencyValue(trxUsdValue)} {selectedCurrency}</ThemedText>
          </View>
        </View>
        <View style={styles.assetDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Today's PNL</ThemedText>
            <ThemedText style={[styles.detailValue, { color: trxChangePercent >= 0 ? '#0FC97B' : '#F04B5A' }]}>
              {trxPnlUsd >= 0 ? '+' : '-'}${formatNumber(Math.abs(trxPnlUsd), 2)} ({trxChangePercent >= 0 ? '+' : ''}{trxChangePercent.toFixed(2)}%)
            </ThemedText>
          </View>
        </View>
        <View style={styles.assetActions}>
          <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.surfaceHighlight }]}>
            <ThemedText style={styles.smallButtonText}>Earn</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.surfaceHighlight }]}>
            <ThemedText style={styles.smallButtonText}>Trade</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.accountTabContent}>

      {[
        { name: 'Earn', amount: `${formatNumber(0.00000014, 8)} ${selectedCurrency}`, fiat: `≈$${formatNumber(0.01, 2)}` },
        { name: 'Funding', amount: `${formatNumber(0.00000011, 8)} ${selectedCurrency}`, fiat: `≈$${formatNumber(0.01, 2)}` },
        { name: 'Spot', amount: `${formatNumber(0.00, 2)} ${selectedCurrency}`, fiat: '' },
        { name: 'Futures', amount: `${formatNumber(0.00, 2)} ${selectedCurrency}`, fiat: '' },
      ].map((item) => (
        <View key={item.name} style={styles.accountItem}>
          <ThemedText style={styles.accountName}>{item.name}</ThemedText>
          <View style={styles.accountBalance}>
            <ThemedText type="bold" style={styles.accountAmount}>{item.amount}</ThemedText>
            {item.fiat ? <ThemedText style={[styles.accountFiat, { color: theme.textSecondary }]}>{item.fiat}</ThemedText> : null}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await Promise.all([
                  fetchGlobalBalance(),
                  fetchPortfolio(),
                  new Promise(resolve => setTimeout(resolve, 400)),
                ]);
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor="#F5C518"
            colors={['#F5C518']}
          />
        }
      >
        <AssetsHeader />
        <View style={[styles.tabContainer, { justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Crypto')}>
              <ThemedText
                type={activeTab === 'Crypto' ? 'bold' : 'default'}
                style={[styles.tabText, { color: activeTab === 'Crypto' ? theme.text : theme.textSecondary }]}
              >
                Crypto
              </ThemedText>
              {activeTab === 'Crypto' && <View style={[styles.activeIndicator, { backgroundColor: theme.yellow }]} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Account')}>
              <ThemedText
                type={activeTab === 'Account' ? 'bold' : 'default'}
                style={[styles.tabText, { color: activeTab === 'Account' ? theme.text : theme.textSecondary }]}
              >
                Account
              </ThemedText>
              {activeTab === 'Account' && <View style={[styles.activeIndicator, { backgroundColor: theme.yellow }]} />}
            </TouchableOpacity>
          </View>

          {activeTab === 'Crypto' ? (
            <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
              <TouchableOpacity style={styles.actionIcon}>
                <Ionicons name="search" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}>
                <MaterialCommunityIcons name="hexagon-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
              <TouchableOpacity style={styles.actionIcon}>
                <MaterialCommunityIcons name="cog-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {activeTab === 'Crypto' ? renderCryptoTab() : renderAccountTab()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Currency Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={[
                  styles.dropdownSheet, 
                  { 
                    backgroundColor: theme.surface,
                    position: 'absolute',
                    top: dropdownPos.top,
                    right: dropdownPos.right
                  }
                ]}
              >
                <ThemedText style={[styles.dropdownTitle, { color: theme.text }]}>
                  Select Currency
                </ThemedText>
                <View>
                  {CURRENCIES.map((c) => {
                    const isSelected = selectedCurrency === c.label;
                    return (
                      <TouchableOpacity
                        key={c.label}
                        style={[
                          styles.dropdownItem,
                          isSelected && { backgroundColor: theme.surfaceHighlight },
                        ]}
                        onPress={() => {
                          setSelectedCurrency(c.label);
                          setDropdownVisible(false);
                        }}
                      >
                        <View style={[styles.currencyIconWrap, { backgroundColor: theme.surfaceHighlight }]}>
                          <MaterialCommunityIcons
                            name={c.icon as any}
                            size={18}
                            color={isSelected ? theme.yellow : theme.textSecondary}
                          />
                        </View>
                        <ThemedText
                          style={[
                            styles.dropdownItemText,
                            { color: isSelected ? theme.text : theme.textSecondary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {c.label}
                        </ThemedText>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color={theme.yellow} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 4,
  },
  tabItem: {
    marginRight: 28,
    paddingBottom: 6,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center'
  },
  cryptoTabContent: {
    paddingHorizontal: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  currencyLabel: {
    fontSize: 13,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  currencySelectorText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  actionIcon: {
    marginLeft: 20,
  },
  assetItem: {
    marginBottom: 0,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  coinNames: {
    flex: 1,
  },
  coinTitle: {
    fontSize: 15,
  },
  coinSubtitle: {
    fontSize: 12,
  },
  coinBalance: {
    alignItems: 'flex-end',
  },
  coinAmount: {
    fontSize: 15,
  },
  coinBtcValue: {
    fontSize: 11.5,
  },
  assetDetails: {
    marginBottom: 8,
    paddingLeft: 42,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
  },
  assetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: -4,
  },
  assetContent: {
    paddingLeft: 42,
  },
  smallButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  smallButtonText: {
    fontSize: 13,
    fontStyle: 'normal',
    fontWeight: '600',
  },
  accountTabContent: {
    paddingHorizontal: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  accountName: {
    fontSize: 17,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  accountAmount: {
    fontSize: 17,
  },
  accountFiat: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(205, 205, 205, 0.08)',
    marginVertical: 12,
  },
  // Modal / Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dropdownSheet: {
    width: 190,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  currencyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dropdownItemText: {
    fontSize: 15,
  },
});
