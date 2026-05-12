import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOP_TABS = ['USDⓈ-M', 'COIN-M', 'Options', 'Smart Money'];
const OPTION_TYPES = ['All', 'Call', 'Put'];
const DATES = [
  { date: '05-01', time: '18h:34m' },
  { date: '05-02', time: '1d:18h' },
  { date: '05-03', time: '2d:18h' },
  { date: '05-08', time: '7d:18h' },
  { date: '05-15', time: '14d:18h' },
];

export default function FuturesScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const C = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState('Options');
  const [activeType, setActiveType] = useState('Call');
  const [activeDate, setActiveDate] = useState('05-01');
  const [btcPrice, setBtcPrice] = useState(76241.0);
  const [strikes, setStrikes] = useState<any[]>([]);

  useEffect(() => {
    // Generate stable base strikes centered around an initial assumed price
    const initialPrice = 76241.0;
    const rounded = Math.round(initialPrice / 500) * 500;
    const newStrikes = [];
    for (let i = -10; i <= 10; i++) {
      const strike = rounded + (i * 500);
      const baseValue = Math.max(0, initialPrice - strike) + (Math.random() * 1000 + 500);
      newStrikes.push({
        strike,
        bid: baseValue * 0.98,
        ask: baseValue * 1.02,
        mark: baseValue,
        iv: 35 + Math.random() * 20,
        chg: (Math.random() * 100) - 50,
      });
    }
    setStrikes(newStrikes);

    // Live BTC Price via WebSocket
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.c);
        setBtcPrice(newPrice);
      } catch (e) {}
    };

    // Simulate live options pricing updates (IV, Bid, Ask jitter)
    const interval = setInterval(() => {
      setStrikes(prev => prev.map(s => {
        const fluctuation = 1 + (Math.random() * 0.02 - 0.01); // +/- 1%
        return {
          ...s,
          bid: s.bid * fluctuation,
          ask: s.ask * fluctuation,
          mark: s.mark * fluctuation,
          iv: s.iv + (Math.random() * 1 - 0.5),
          chg: s.chg + (Math.random() * 2 - 1),
        };
      }));
    }, 2000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const listData = useMemo(() => {
    const data: any[] = [];
    let priceInserted = false;

    strikes.forEach((s) => {
      if (!priceInserted && btcPrice < s.strike) {
        data.push({ isPriceLine: true, id: 'price-line' });
        priceInserted = true;
      }
      data.push({ ...s, id: s.strike.toString(), isPriceLine: false });
    });

    if (!priceInserted && strikes.length > 0) {
      data.push({ isPriceLine: true, id: 'price-line' });
    }
    return data;
  }, [strikes, btcPrice]);

  const renderHeader = () => (
    <View style={[styles.tableHeaderRow, { borderBottomColor: C.surfaceHighlight }]}>
      <View style={[styles.strikeCol, { backgroundColor: C.background }]}>
        <ThemedText style={styles.tableHeaderText}>Strike</ThemedText>
      </View>
      <View style={styles.dataCols}>
        <View style={styles.col}><ThemedText style={styles.tableHeaderText}>Bid / IV</ThemedText></View>
        <View style={styles.col}><ThemedText style={styles.tableHeaderText}>Ask / IV</ThemedText></View>
        <View style={styles.col}><ThemedText style={styles.tableHeaderText}>Mark / IV</ThemedText></View>
        <View style={styles.col}><ThemedText style={styles.tableHeaderText}>24h Chg</ThemedText></View>
      </View>
    </View>
  );

  const renderRow = ({ item }: { item: any }) => {
    if (item.isPriceLine) {
      return (
        <View style={styles.priceLineContainer}>
          <View style={[styles.priceLineLabel, { backgroundColor: isDark ? '#444' : '#555' }]}>
            <ThemedText style={styles.priceLineText}>{btcPrice.toFixed(1)}</ThemedText>
          </View>
          <View style={[styles.priceLine, { backgroundColor: isDark ? '#444' : '#555' }]} />
        </View>
      );
    }

    const isITM = activeType === 'Call' ? item.strike < btcPrice : item.strike > btcPrice;
    const itmBg = isITM 
      ? (isDark ? 'rgba(15, 201, 123, 0.08)' : 'rgba(15, 201, 123, 0.05)') 
      : 'transparent';

    return (
      <View style={[styles.row, { borderBottomColor: C.surfaceHighlight }]}>
        {/* Strike Column */}
        <View style={[styles.strikeCol, { backgroundColor: C.background, borderRightColor: C.surfaceHighlight, borderRightWidth: StyleSheet.hairlineWidth }]}>
          <ThemedText style={[styles.strikeText, { color: C.text }]}>{item.strike.toLocaleString()}</ThemedText>
        </View>

        {/* Data Columns */}
        <View style={[styles.dataCols, { backgroundColor: itmBg }]}>
          <View style={styles.col}>
            <ThemedText style={[styles.valText, { color: '#0FC97B' }]}>{item.bid < 1 ? '--' : item.bid.toFixed(0)}</ThemedText>
            <ThemedText style={[styles.subText, { color: C.tabIconDefault }]}>{item.iv.toFixed(2)}%</ThemedText>
          </View>
          <View style={styles.col}>
            <ThemedText style={[styles.valText, { color: '#F04B5A' }]}>{item.ask < 1 ? '--' : item.ask.toFixed(0)}</ThemedText>
            <ThemedText style={[styles.subText, { color: C.tabIconDefault }]}>{item.iv.toFixed(2)}%</ThemedText>
          </View>
          <View style={styles.col}>
            <ThemedText style={[styles.valText, { color: C.text }]}>{item.mark.toFixed(0)}</ThemedText>
            <ThemedText style={[styles.subText, { color: C.tabIconDefault }]}>{(item.iv - 2).toFixed(2)}%</ThemedText>
          </View>
          <View style={styles.col}>
            <ThemedText style={[styles.valText, { color: item.chg >= 0 ? '#0FC97B' : '#F04B5A' }]}>
              {item.chg > 0 ? '+' : ''}{item.chg.toFixed(0)}
            </ThemedText>
            <ThemedText style={[styles.subText, { color: item.chg >= 0 ? '#0FC97B' : '#F04B5A' }]}>
              {item.chg > 0 ? '+' : ''}{item.chg.toFixed(2)}%
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

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

      {/* ── Sub Header Row ── */}
      <View style={styles.subHeader}>
        <View style={styles.btcSelector}>
          <View style={styles.btcIconWrap}>
            <MaterialCommunityIcons name="bitcoin" size={24} color="#F5C518" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={[styles.btcText, { color: C.text }]}>BTC</ThemedText>
              <Ionicons name="caret-down" size={12} color={C.text} style={{ marginLeft: 2 }} />
            </View>
            <ThemedText style={styles.livePriceText}>{btcPrice.toFixed(1)}</ThemedText>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll} contentContainerStyle={{ paddingRight: 16 }}>
          {DATES.map((d) => (
            <TouchableOpacity 
              key={d.date} 
              onPress={() => setActiveDate(d.date)}
              style={[
                styles.dateBtn, 
                activeDate === d.date ? { backgroundColor: C.surfaceHighlight } : { backgroundColor: 'transparent' }
              ]}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.dateText, { color: activeDate === d.date ? C.text : C.tabIconDefault }]}>{d.date}</ThemedText>
              <ThemedText style={[styles.timeText, { color: C.tabIconDefault }]}>{d.time}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Option Types Row ── */}
      <View style={[styles.optionsTypeRow, { borderBottomColor: C.surfaceHighlight }]}>
        <View style={styles.optionsTypeLeft}>
          {OPTION_TYPES.map(type => (
            <TouchableOpacity key={type} onPress={() => setActiveType(type)} style={styles.typeBtn}>
              <ThemedText style={[
                styles.typeText,
                activeType === type ? { color: C.text, fontWeight: '700' } : { color: C.tabIconDefault }
              ]}>{type}</ThemedText>
              {activeType === type && <View style={styles.activeTypeUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.optionsTypeRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={20} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={20} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chain Table ── */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
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
    gap: 16,
  },
  headerTab: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTabActive: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuIcon: {
    paddingHorizontal: 16,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    marginBottom: 8,
  },
  btcSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
  },
  btcIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btcText: {
    fontSize: 18,
    fontWeight: '700',
  },
  livePriceText: {
    fontSize: 12,
    color: '#0FC97B',
    fontWeight: '600',
  },
  datesScroll: {
    flex: 1,
  },
  dateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
  },
  optionsTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionsTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  typeBtn: {
    paddingVertical: 12,
    position: 'relative',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeTypeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: -4,
    right: -4,
    height: 3,
    backgroundColor: '#F5C518',
    borderRadius: 2,
  },
  optionsTypeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableHeaderText: {
    fontSize: 11,
    color: '#9B9B9B',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  strikeCol: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 10,
  },
  strikeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dataCols: {
    flex: 1,
    flexDirection: 'row',
  },
  col: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  valText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  subText: {
    fontSize: 11,
  },
  priceLineContainer: {
    position: 'relative',
    height: 12,
    justifyContent: 'center',
    zIndex: 20,
  },
  priceLineLabel: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 21,
  },
  priceLineText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  priceLine: {
    height: 1.5,
    width: '100%',
    position: 'absolute',
    top: 5.5,
  },
});
