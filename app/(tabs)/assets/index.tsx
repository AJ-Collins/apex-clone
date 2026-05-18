import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CryptoCurrency, useCurrencyStore } from '@/store/currencyStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AssetsHeader } from '@/components/AssetsHeader';

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

  // Selector syntax guarantees re-render on every store change
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const setSelectedCurrency = useCurrencyStore((state) => state.setSelectedCurrency);
  const { fetchGlobalBalance, fetchPortfolio } = usePortfolioStore();

  const formatNumber = (num: number, decimals: number = 2) => {
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const renderCryptoTab = () => (
    <View style={styles.cryptoTabContent}>

      {/* Currency Selector Row */}
      <View style={styles.currencyRow}>
        <ThemedText style={[styles.currencyLabel, { color: theme.textSecondary }]}>
          Total Assets Value
        </ThemedText>
        <TouchableOpacity
          style={[styles.currencySelector, { backgroundColor: theme.surfaceHighlight }]}
          onPress={() => setDropdownVisible(true)}
        >
          <ThemedText style={[styles.currencySelectorText, { color: theme.text }]}>
            {selectedCurrency}
          </ThemedText>
          <Ionicons name="chevron-down" size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* BNB Asset */}
      <View style={styles.assetItem}>
        <View style={styles.assetHeader}>
          <View style={[styles.coinIcon, { backgroundColor: '#fcd535' }]}>
            <MaterialCommunityIcons name="currency-btc" size={16} color="#000" />
          </View>
          <View style={styles.coinNames}>
            <ThemedText type="bold" style={styles.coinTitle}>BNB</ThemedText>
            <ThemedText style={[styles.coinSubtitle, { color: theme.textSecondary }]}>BNB</ThemedText>
          </View>
          <View style={styles.coinBalance}>
            <ThemedText type="bold" style={styles.coinAmount}>{formatNumber(0.00001685, 8)}</ThemedText>
            <ThemedText style={[styles.coinBtcValue, { color: theme.textSecondary }]}>{formatNumber(0.00000014, 8)} {selectedCurrency}</ThemedText>
          </View>
        </View>
        <View style={styles.assetDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Today's PNL</ThemedText>
            <ThemedText style={[styles.detailValue, { color: theme.text }]}>$0.00(+0.43%)</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Average Price</ThemedText>
            <ThemedText style={[styles.detailValue, { color: theme.text }]}>$616.39</ThemedText>
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
      {/* OG Asset */}
      <View style={styles.assetItem}>
        <View style={styles.assetHeader}>
          <View style={[styles.coinIcon, { backgroundColor: '#9b59b6' }]}>
            <MaterialCommunityIcons name="infinity" size={16} color="#fff" />
          </View>
          <View style={styles.coinNames}>
            <ThemedText type="bold" style={styles.coinTitle}>OG</ThemedText>
            <ThemedText style={[styles.coinSubtitle, { color: theme.textSecondary }]}>OG</ThemedText>
          </View>
          <View style={styles.coinBalance}>
            <ThemedText type="bold" style={styles.coinAmount}>{formatNumber(0.015, 3)}</ThemedText>
            <ThemedText style={[styles.coinBtcValue, { color: theme.textSecondary }]}>{formatNumber(0.00000011, 8)} {selectedCurrency}</ThemedText>
          </View>
        </View>
        <View style={styles.assetDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Today's PNL</ThemedText>
            <ThemedText style={[styles.detailValue, { color: theme.text }]}>$0.00(-1.23%)</ThemedText>
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
                  new Promise(resolve => setTimeout(resolve, 600)),
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
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
          <View style={[styles.dropdownSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.dropdownHandle} />
            <ThemedText style={[styles.dropdownTitle, { color: theme.text }]}>
              Select Currency
            </ThemedText>
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
        </Pressable>
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
    marginBottom: 6,
  },
  coinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinNames: {
    flex: 1,
  },
  coinTitle: {
    fontSize: 17,
  },
  coinSubtitle: {
    fontSize: 13,
  },
  coinBalance: {
    alignItems: 'flex-end',
  },
  coinAmount: {
    fontSize: 16,
  },
  coinBtcValue: {
    fontSize: 12.5,
  },
  assetDetails: {
    marginBottom: 16,
    paddingLeft: 48,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 12,
  },
  assetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  assetContent: {
    paddingLeft: 48,
  },
  smallButton: {
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  smallButtonText: {
    fontSize: 14,
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
    marginVertical: 18,
  },
  // Modal / Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  dropdownSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  dropdownHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 16,
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
