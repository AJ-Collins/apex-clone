import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CryptoCurrency, useCurrencyStore } from '@/store/currencyStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActionBottomSheet } from './ActionBottomSheet';

const CURRENCIES: { id: CryptoCurrency; name: string }[] = [
  { id: 'BTC', name: 'BTC' },
  { id: 'ETH', name: 'ETH' },
  { id: 'BNB', name: 'BNB' },
  { id: 'USDT', name: 'USDT' },
  { id: 'KSH', name: 'KSH' },
];

const CATEGORIES = [
  { name: 'Overview', path: '/assets' },
  { name: 'Earn', path: '/assets/earn' },
  { name: 'Funding', path: '/assets/funding' },
  { name: 'Spot', path: '/assets/spot' },
  { name: 'Futures', path: '/assets/futures' },
];

export function AssetsHeader() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const pathname = usePathname();

  const { globalBalance } = usePortfolioStore();

  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const setSelectedCurrency = useCurrencyStore((state) => state.setSelectedCurrency);
  const [btcPrice, setBtcPrice] = useState(60000);
  const [bnbPrice, setBnbPrice] = useState(616.39);
  const [ethPrice, setEthPrice] = useState(3200);
  const [pnl, setPnl] = useState({ usd: '$0.00', percent: '0.00%', isPositive: true });

  const formatNumber = (num: number, decimals: number = 2) => {
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const SPOT_SUB_TABS = ['Spot', 'Cross Margin', 'Isolated Margin'];
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isBalanceVisible, setBalanceVisible] = useState(true);
  const [isDepositVisible, setDepositVisible] = useState(false);
  const [isWithdrawVisible, setWithdrawVisible] = useState(false);
  const [activeSpotTab, setActiveSpotTab] = useState('Spot');

  useState(() => {
    // Initial fetch handled by parent/store usually
  });

  useState(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/bnbusdt@ticker/ethusdt@ticker');
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const price = parseFloat(data.c);
        if (data.s === 'BTCUSDT') setBtcPrice(price);
        if (data.s === 'ETHUSDT') setEthPrice(price);
        if (data.s === 'BNBUSDT') {
          setBnbPrice(price);
          const priceChange = parseFloat(data.P);
          const pnlUsd = (globalBalance * (priceChange / 100));
          setPnl({
            usd: `${pnlUsd >= 0 ? '+' : '-'}$${formatNumber(Math.abs(pnlUsd), 2)}`,
            percent: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            isPositive: priceChange >= 0
          });
        }
      } catch (err) {}
    };
    return () => ws.close();
  });

  const activeCategory =
    CATEGORIES.find(c => c.path === pathname)?.name || 'Overview';

  const renderModalItem = (icon: any, title: string, subtitle: string, iconType: 'ionicons' | 'material' = 'ionicons', onPress?: () => void) => (
    <TouchableOpacity style={[styles.modalItem, { borderColor: theme.surfaceHighlight }]} onPress={onPress}>
      <View style={styles.modalIconContainer}>
        {iconType === 'ionicons' ? (
          <Ionicons name={icon} size={24} color={theme.text} />
        ) : (
          <MaterialCommunityIcons name={icon} size={24} color={theme.text} />
        )}
      </View>
      <View style={styles.modalItemContent}>
        <ThemedText type="bold" style={styles.modalItemTitle}>{title}</ThemedText>
        <ThemedText style={[styles.modalItemSubtitle, { color: theme.textSecondary }]}>{subtitle}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ backgroundColor: theme.background }}>

      {/* Backdrop */}
      {isDropdownVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        />
      )}

      {/* CATEGORY NAV */}
      <View style={styles.categoryHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              onPress={() => router.push(cat.path as any)}
              style={styles.categoryItem}
            >
              <ThemedText
                type={activeCategory === cat.name ? 'bold' : 'default'}
                style={[
                  styles.categoryText,
                  {
                    color:
                      activeCategory === cat.name
                        ? theme.text
                        : theme.textSecondary,
                  },
                ]}
              >
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SPOT SUB-TABS */}
      {activeCategory === 'Spot' && (
        <View style={[styles.spotSubTabsRow, { borderBottomColor: theme.surfaceHighlight }]}>
          {SPOT_SUB_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.spotSubTab,
                activeSpotTab === tab && [styles.spotSubTabActive, { backgroundColor: theme.surfaceHighlight }],
              ]}
              onPress={() => setActiveSpotTab(tab)}
            >
              <ThemedText
                type={activeSpotTab === tab ? 'semiBold' : 'default'}
                style={[
                  styles.spotSubTabText,
                  { color: activeSpotTab === tab ? theme.text : theme.textSecondary },
                ]}
              >
                {tab}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.balanceContainer}>

        {/* HEADER ROW */}
        <View style={styles.balanceHeaderRow}>
          <ThemedText style={[styles.balanceLabel, { color: theme.text }]}>
            Est. Total Value
          </ThemedText>

          <TouchableOpacity
            onPress={() => setBalanceVisible(!isBalanceVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={14}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          {activeCategory === 'Funding' || activeCategory === 'Spot' ? (
            <TouchableOpacity style={styles.headerIcon}>
              <MaterialCommunityIcons name="clipboard-clock-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.headerIcon}>
                <MaterialCommunityIcons name="finance" size={22} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.headerIcon}>
                <MaterialCommunityIcons name="clock-outline" size={22} color={theme.text} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* VALUE BLOCK */}
        <View style={styles.valueBlock}>

          {/* BALANCE + DROPDOWN */}
          <TouchableOpacity
            style={styles.mainBalanceRow}
            onPress={() => setDropdownVisible(!isDropdownVisible)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <ThemedText type="bold" style={styles.mainBalance}>
                {isBalanceVisible 
                  ? (selectedCurrency === 'USDT' 
                      ? `$${formatNumber(globalBalance, 2)}`
                      : (selectedCurrency === 'BTC' 
                          ? formatNumber(globalBalance / btcPrice, 8) 
                          : (selectedCurrency === 'BNB' 
                              ? formatNumber(globalBalance / bnbPrice, 4)
                              : (selectedCurrency === 'ETH'
                                  ? formatNumber(globalBalance / ethPrice, 6)
                                  : (selectedCurrency === 'KSH'
                                      ? formatNumber(globalBalance * 145, 2)
                                      : formatNumber(globalBalance, 2)))))) 
                  : '******** '}
              </ThemedText>

              <ThemedText style={styles.currencyCode}>
                {selectedCurrency}
              </ThemedText>
            </View>

            <MaterialCommunityIcons
              name="menu-down"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {/* DROPDOWN */}
          {isDropdownVisible && (
            <View style={[styles.dropdown, { backgroundColor: theme.surface }]}>
              {CURRENCIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.currencyItem}
                  onPress={() => {
                    setSelectedCurrency(item.id);
                    setDropdownVisible(false);
                  }}
                >
                  <ThemedText style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
                    {item.name}
                  </ThemedText>

                  {selectedCurrency === item.id && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      style={{ marginLeft: 'auto' }}
                      color={theme.tint}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* FIAT */}
          <ThemedText
            style={[styles.fiatEstimate, { color: theme.textSecondary }]}
          >
            {isBalanceVisible ? `≈$${formatNumber(globalBalance, 2)}` : '≈****'}
          </ThemedText>
        </View>

        {/* PNL */}
        <TouchableOpacity style={styles.pnlRow}>
          <ThemedText style={[styles.pnlLabel, { color: theme.text }]}>
            Today's PNL
          </ThemedText>

          <ThemedText style={[styles.pnlValue, { color: pnl.isPositive ? '#0FC97B' : '#F04B5A' }]}>
            {pnl.usd} ({pnl.percent})
          </ThemedText>

          <Ionicons
            name={pnl.isPositive ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={pnl.isPositive ? '#0FC97B' : '#F04B5A'}
          />
        </TouchableOpacity>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          onPress={() => setDepositVisible(true)}
          style={[styles.actionButton, { backgroundColor: theme.yellow }]}
        >
          <ThemedText style={styles.actionButtonTextPrimary}>
            Add Funds
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setWithdrawVisible(true)}
          style={[styles.actionButton, { backgroundColor: theme.surfaceHighlight }]}
        >
          <ThemedText
            style={[styles.actionButtonTextSecondary, { color: theme.text }]}
          >
            Send
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/transfer')}
          style={[styles.actionButton, { backgroundColor: theme.surfaceHighlight }]}
        >
          <ThemedText
            style={[styles.actionButtonTextSecondary, { color: theme.text }]}
          >
            Transfer
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      {/* Deposit Bottom Sheet */}
      <ActionBottomSheet isVisible={isDepositVisible} onClose={() => setDepositVisible(false)}>
        <View style={styles.modalContent}>
          <ThemedText type="bold" style={styles.modalTitle}>Select Deposit Method</ThemedText>
          {renderModalItem('download-outline', 'Deposit Crypto', 'Deposit Crypto from other exchanges/wallets to Binance', 'ionicons', () => {
            setDepositVisible(false);
            router.push('/select-coin');
          })}
          {renderModalItem('hand-coin-outline', 'Receive Via Binance Pay', 'Receive crypto from other Binance users', 'material')}
          {renderModalItem('account-search-outline', 'P2P Trading', 'Buy directly from users. Competitive pricing. Local payment', 'material')}
          {renderModalItem('wallet-outline', 'Buy with KES', 'Buy crypto easily via bank transfer, card, and more.')}
        </View>
      </ActionBottomSheet>

      {/* Withdraw Bottom Sheet */}
      <ActionBottomSheet isVisible={isWithdrawVisible} onClose={() => setWithdrawVisible(false)}>
        <View style={styles.modalContent}>
          <ThemedText type="bold" style={styles.modalTitle}>Select Withdraw Method</ThemedText>
          {renderModalItem('hand-coin-outline', 'Send to Binance users', 'Binance internal transfer, send via Email/Phone/ID', 'material')}
          {renderModalItem('arrow-up-outline', 'Withdraw Crypto', 'Withdraw Crypto from Binance to other exchanges/wallets', 'ionicons', () => {
            setWithdrawVisible(false);
            router.push('/select-coin?action=withdraw');
          })}
          {renderModalItem('arrow-up-outline', 'Withdraw USD', 'Sell your crypto for USD and withdraw via SWIFT bank transfer', 'ionicons')}
          {renderModalItem('account-switch-outline', 'P2P Trading', 'Sell directly to users. Competitive pricing. Local payment', 'material')}
        </View>
      </ActionBottomSheet>

    </View>
  );
}

const styles = StyleSheet.create({
  categoryHeader: {
    paddingVertical: 8,
    paddingLeft: 10,
  },
  categoryItem: {
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
  },

  spotSubTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  spotSubTab: {
    paddingVertical: 1,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  spotSubTabActive: {
    borderRadius: 6,
  },
  spotSubTabText: {
    fontSize: 12,
    lineHeight: 24,
  },

  balanceContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  balanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  balanceLabel: {
    fontSize: 14,
    marginRight: 6,
    fontWeight: '600',
  },

  eyeIcon: {
    padding: 2,
  },

  headerIcon: {
    marginLeft: 20,
  },

  valueBlock: {
    marginTop: 2,
    marginBottom: 6,
  },

  mainBalanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 2,
  },

  mainBalance: {
    fontSize: 34,
    lineHeight: 42,
  },

  currencyCode: {
    fontSize: 14,
    marginLeft: 2,
  },

  fiatEstimate: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },

  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 150,
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },

  pnlLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  pnlValue: {
    fontSize: 12,
    fontWeight: '500',
  },

  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },

  actionButtonTextPrimary: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },

  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Modal styles
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  modalItemSubtitle: {
    fontSize: 12,
  },
});