import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TradeScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const C = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState('Convert');
  const [activeSubTab, setActiveSubTab] = useState('Instant');
  
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  
  // true = USDT to OG, false = OG to USDT
  const [isUsdtToOg, setIsUsdtToOg] = useState(true);

  const TOP_TABS = ['Convert', 'Spot', 'P2P', 'Buy/Sell', 'Alpha'];
  const SUB_TABS = ['Instant', 'Recurring', 'Limit'];

  useEffect(() => {
    // Listen to real-time OG/USDT price from Binance
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/ogusdt@ticker');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const currentPrice = parseFloat(data.c); // Last price
        setExchangeRate(currentPrice);
      } catch (e) {}
    };

    return () => ws.close();
  }, []);

  // Recalculate 'To' whenever 'From' or the live exchange rate changes
  useEffect(() => {
    if (exchangeRate && fromAmount && !isNaN(parseFloat(fromAmount))) {
      const amount = parseFloat(fromAmount);
      if (isUsdtToOg) {
        // USDT -> OG
        setToAmount((amount / exchangeRate).toFixed(5));
      } else {
        // OG -> USDT
        setToAmount((amount * exchangeRate).toFixed(2));
      }
    }
  }, [fromAmount, exchangeRate, isUsdtToOg]);

  const handleFromChange = (text: string) => {
    setFromAmount(text);
    if (!text || isNaN(parseFloat(text))) {
      setToAmount('');
    }
  };

  const handleSwap = () => {
    setIsUsdtToOg(!isUsdtToOg);
    setFromAmount(toAmount); // Swap the current values
  };

  const asset1 = isUsdtToOg ? 'USDT' : 'OG';
  const asset2 = isUsdtToOg ? 'OG' : 'USDT';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      {/* ── Top Header Tabs ── */}
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.headerScroll}>
          {TOP_TABS.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
              <ThemedText style={[
                styles.headerTab,
                activeTab === tab ? [styles.headerTabActive, { color: C.text }] : { color: C.tabIconDefault }
              ]}>
                {tab}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.menuIcon}>
          <Ionicons name="menu" size={26} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Announcement Banner ── */}
        <View style={styles.banner}>
          <Ionicons name="megaphone-outline" size={18} color="#000" />
          <ThemedText style={styles.bannerText}>Check out the New Convert Features!</ThemedText>
        </View>

        {/* ── Sub Tabs (Instant, Recurring, Limit) ── */}
        <View style={styles.subTabsContainer}>
          <View style={styles.subTabsLeft}>
            {SUB_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveSubTab(tab)}
                style={[
                  styles.subTabPill,
                  activeSubTab === tab ? { backgroundColor: C.surfaceHighlight } : { backgroundColor: 'transparent' }
                ]}
                activeOpacity={0.7}
              >
                <ThemedText style={[
                  styles.subTabText,
                  activeSubTab === tab ? { color: C.text, fontWeight: '700' } : { color: C.tabIconDefault }
                ]}>
                  {tab}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.subTabsRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="options-outline" size={22} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons name="clock-time-four-outline" size={22} color={C.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Convert Card ── */}
        <View style={styles.convertContainer}>
          
          {/* From Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <ThemedText style={[styles.inputLabel, { color: C.tabIconDefault }]}>From</ThemedText>
              <View style={styles.balanceRow}>
                <ThemedText style={[styles.balanceText, { color: C.text }]}>2</ThemedText>
                <Ionicons name="wallet-outline" size={14} color={C.text} style={{ marginHorizontal: 4 }} />
                <ThemedText style={[styles.balanceText, { color: C.text }]}>0 {asset1}</ThemedText>
                <TouchableOpacity style={styles.addBtn}>
                  <Ionicons name="add-circle" size={16} color={C.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputMain}>
              <TouchableOpacity style={styles.assetSelector}>
                {asset1 === 'USDT' ? (
                  <View style={[styles.assetIcon, { backgroundColor: '#26A17B' }]}>
                    <MaterialCommunityIcons name="currency-usd" size={18} color="#FFF" />
                  </View>
                ) : (
                  <View style={[styles.assetIcon, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' }]}>
                    <ThemedText style={{ color: '#8A2BE2', fontWeight: 'bold', fontSize: 10 }}>OG</ThemedText>
                  </View>
                )}
                <ThemedText style={[styles.assetName, { color: C.text }]}>{asset1}</ThemedText>
                <Ionicons name="caret-down" size={14} color={C.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { color: C.text }]}
                placeholder={isUsdtToOg ? "> 0.01" : "> 0.018"}
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#D1D1D6'}
                keyboardType="numeric"
                value={fromAmount}
                onChangeText={handleFromChange}
              />
            </View>
          </View>

          {/* Separator & Swap Button */}
          <View style={styles.separatorContainer}>
            <View style={[styles.line, { backgroundColor: C.surfaceHighlight }]} />
            <TouchableOpacity 
              style={[styles.swapBtn, { backgroundColor: C.background, borderColor: C.surfaceHighlight }]}
              onPress={handleSwap}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={18} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* To Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <ThemedText style={[styles.inputLabel, { color: C.tabIconDefault }]}>To</ThemedText>
              {exchangeRate && (
                <ThemedText style={[styles.inputLabel, { color: '#0FC97B', fontSize: 11 }]}>
                  1 OG ≈ {exchangeRate.toFixed(4)} USDT
                </ThemedText>
              )}
            </View>

            <View style={styles.inputMain}>
              <TouchableOpacity style={styles.assetSelector}>
                {asset2 === 'OG' ? (
                  <View style={[styles.assetIcon, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' }]}>
                    <ThemedText style={{ color: '#8A2BE2', fontWeight: 'bold', fontSize: 10 }}>OG</ThemedText>
                  </View>
                ) : (
                  <View style={[styles.assetIcon, { backgroundColor: '#26A17B' }]}>
                    <MaterialCommunityIcons name="currency-usd" size={18} color="#FFF" />
                  </View>
                )}
                <ThemedText style={[styles.assetName, { color: C.text }]}>{asset2}</ThemedText>
                <Ionicons name="caret-down" size={14} color={C.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { color: C.text }]}
                placeholder={isUsdtToOg ? "> 0.018" : "> 0.01"}
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#D1D1D6'}
                keyboardType="numeric"
                value={toAmount}
                editable={false} // Auto-calculated based on From amount
              />
            </View>
          </View>

        </View>

        {/* ── Preview Button ── */}
        <TouchableOpacity 
          style={[
            styles.previewBtn, 
            (!fromAmount || parseFloat(fromAmount) <= 0 || !exchangeRate) && { backgroundColor: C.surfaceHighlight, opacity: 0.6 }
          ]} 
          activeOpacity={0.7}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0 || !exchangeRate}
        >
          {exchangeRate === null ? (
            <ActivityIndicator color={C.text} size="small" />
          ) : (
            <ThemedText style={[
              styles.previewBtnText,
              (!fromAmount || parseFloat(fromAmount) <= 0) && { color: C.tabIconDefault }
            ]}>
              Preview Conversion
            </ThemedText>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 20,
  },
  headerTab: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTabActive: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuIcon: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  bannerText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '500',
  },
  subTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  subTabsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTabsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  convertContainer: {
    marginTop: 8,
  },
  inputSection: {
    paddingVertical: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 20,
  },
  inputLabel: {
    fontSize: 13,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addBtn: {
    marginLeft: 4,
  },
  inputMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetName: {
    fontSize: 20,
    fontWeight: '700',
  },
  textInput: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  separatorContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  line: {
    height: 1,
    width: '100%',
    position: 'absolute',
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  previewBtn: {
    backgroundColor: '#FCEEA7',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  previewBtnText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
});
