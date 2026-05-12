import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const { width } = Dimensions.get('window');

const COIN_DEFS = [
  { s: 'BTCUSDT', n: 'Bitcoin', c: '#F5C518', a: 'B', isIcon: true, iconName: 'bitcoin' },
  { s: '1INCHUSDT', n: '1inch', c: '#000000', a: '', isIcon: false },
  { s: 'AAVEUSDT', n: 'Aave', c: '#8E99F3', a: 'AA', isIcon: false },
  { s: 'ACMUSDT', n: 'AC Milan Fan Tok...', c: '#333333', a: 'ACM', isIcon: false },
  { s: 'ADAUSDT', n: 'Cardano', c: '#1976D2', a: 'A', isIcon: false },
  { s: 'ALGOUSDT', n: 'Algorand', c: '#000000', a: 'A', isIcon: false },
  { s: 'ALICEUSDT', n: 'My Neighbor Alice', c: '#F48FB1', a: '✿', isIcon: false },
  { s: 'ANKRUSDT', n: 'Ankr', c: '#1E88E5', a: '⚓', isIcon: false },
  { s: 'ARDRUSDT', n: 'Ardor', c: '#0288D1', a: 'A', isIcon: false },
  { s: 'ARPAUSDT', n: 'ARPA Network', c: '#B0BEC5', a: 'Δ', isIcon: false },
  { s: 'ARUSDT', n: 'Arweave', c: '#000000', a: 'ar', isIcon: false },
];

const TABS_1 = ['Favorites', 'Market', 'Alpha', 'Grow', 'Square', 'Data'];
const TABS_2 = ['Crypto', 'Spot', 'USDⓈ-M', 'COIN-M', 'Options'];
const TABS_3 = ['All', 'BNB Chain', 'Solana', 'RWA', 'MEME', 'Payments'];

interface TokenData {
  symbol: string;
  displaySymbol: string;
  name: string;
  priceStr: string;
  usdStr: string;
  changeStr: string;
  isPositive: boolean;
  color: string;
  avatar: string;
  isIcon: boolean;
  iconName?: string;
}

export default function MarketsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const C = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [activeTab1, setActiveTab1] = useState('Market');
  const [activeTab2, setActiveTab2] = useState('Crypto');
  const [activeTab3, setActiveTab3] = useState('All');

  const [tokens, setTokens] = useState<TokenData[]>(
    COIN_DEFS.map(def => ({
      symbol: def.s,
      displaySymbol: def.s.replace('USDT', ''),
      name: def.n,
      priceStr: '0.00',
      usdStr: '$0.00',
      changeStr: '0.00%',
      isPositive: true,
      color: def.c,
      avatar: def.a,
      isIcon: def.isIcon,
      iconName: def.iconName,
    }))
  );

  useEffect(() => {
    const updateTokens = (data: any[], isStream: boolean) => {
      setTokens(prevTokens => {
        const newTokens = [...prevTokens];
        data.forEach(item => {
          const s = isStream ? item.s : item.symbol;
          const idx = newTokens.findIndex(t => t.symbol === s);
          if (idx !== -1) {
            const lastPrice = parseFloat(isStream ? item.c : item.lastPrice);
            const priceChange = parseFloat(isStream ? item.P : item.priceChangePercent);

            // Format price dynamically
            let formattedPrice = '';
            if (lastPrice >= 1000) formattedPrice = lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            else if (lastPrice >= 1) formattedPrice = lastPrice.toFixed(4);
            else formattedPrice = lastPrice.toFixed(5);

            // Format USD
            const usdVal = lastPrice;
            let formattedUsd = '';
            if (usdVal >= 1000) formattedUsd = usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            else formattedUsd = usdVal.toFixed(2);

            newTokens[idx] = {
              ...newTokens[idx],
              priceStr: formattedPrice,
              usdStr: `$${formattedUsd}`,
              changeStr: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
              isPositive: priceChange >= 0,
            };
          }
        });
        return newTokens;
      });
    };

    // Initial Fetch
    fetch('https://api.binance.com/api/v3/ticker/24hr')
      .then(res => res.json())
      .then((data: any[]) => {
        const relevant = data.filter(i => COIN_DEFS.some(d => d.s === i.symbol));
        updateTokens(relevant, false);
      })
      .catch(e => console.log('Fetch error:', e));

    // WebSocket Stream
    const streams = COIN_DEFS.map(c => `${c.s.toLowerCase()}@ticker`).join('/');

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        const item = json.data; // 👈 IMPORTANT (combined stream format)

        updateTokens([{
          s: item.s,
          c: item.c,
          P: item.P,
        }], true);

      } catch (e) {
        console.log(e);
      }
    };

    return () => ws.close();
  }, []);

  const renderItem = ({ item }: { item: TokenData }) => (
    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
      <View style={styles.colLeft}>
        <View style={[styles.iconWrap, { backgroundColor: item.color, borderRadius: item.symbol === '1INCHUSDT' ? 4 : 14 }]}>
          {item.isIcon ? (
            <MaterialCommunityIcons name={item.iconName as any} size={18} color="#FFF" />
          ) : (
            <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 10 }}>{item.avatar}</ThemedText>
          )}
        </View>
        <View style={styles.nameBlock}>
          <ThemedText style={[styles.symbolText, { color: C.text }]}>{item.displaySymbol}</ThemedText>
          <ThemedText style={[styles.nameText, { color: C.tabIconDefault }]}>{item.name}</ThemedText>
        </View>
      </View>

      <View style={styles.colCenter}>
        <ThemedText style={[styles.priceText, { color: C.text }]}>{item.priceStr}</ThemedText>
        <ThemedText style={[styles.usdText, { color: C.tabIconDefault }]}>{item.usdStr}</ThemedText>
      </View>

      <View style={styles.colRight}>
        <View style={[styles.changeBtn, { backgroundColor: item.isPositive ? '#0FC97B' : '#F04B5A' }]}>
          <ThemedText style={styles.changeBtnText}>{item.changeStr}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      {/* ── Top Search Bar Row ── */}
      <View style={styles.topSearchRow}>
        <View style={[styles.searchBox, { backgroundColor: C.surfaceHighlight }]}>
          <Ionicons name="search" size={16} color={C.tabIconDefault} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search Coin Pairs"
            placeholderTextColor={C.tabIconDefault}
            style={[styles.searchInput, { color: C.text }]}
          />
        </View>
        <TouchableOpacity style={styles.dotsMenu}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tokens}
        keyExtractor={(item) => item.symbol}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Tabs 1 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs1Scroll} contentContainerStyle={styles.tabs1Container}>
              {TABS_1.map(t => (
                <TouchableOpacity key={t} onPress={() => setActiveTab1(t)} style={styles.tab1Btn}>
                  <ThemedText style={[styles.tab1Text, activeTab1 === t ? { color: C.text, fontWeight: '700' } : { color: C.tabIconDefault }]}>{t}</ThemedText>
                  {activeTab1 === t && <View style={styles.tab1Underline} />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tabs 2 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs2Scroll} contentContainerStyle={styles.tabs2Container}>
              {TABS_2.map(t => (
                <TouchableOpacity key={t} onPress={() => setActiveTab2(t)} style={styles.tab2Btn}>
                  <ThemedText style={[styles.tab2Text, activeTab2 === t ? { color: C.text, fontWeight: '700' } : { color: C.tabIconDefault }]}>{t}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tabs 3 */}
            <View style={styles.tabs3Row}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs3Scroll} contentContainerStyle={styles.tabs3Container}>
                {TABS_3.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setActiveTab3(t)}
                    style={[styles.tab3Btn, activeTab3 === t ? { backgroundColor: C.surfaceHighlight } : { backgroundColor: 'transparent' }]}
                  >
                    <ThemedText style={[styles.tab3Text, activeTab3 === t ? { color: C.text, fontWeight: '600' } : { color: C.tabIconDefault }]}>{t}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.listMenuBtn}>
                <Ionicons name="list" size={18} color={C.tabIconDefault} />
              </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.thLeft}>
                <ThemedText style={styles.thText}>Name</ThemedText>
                <MaterialCommunityIcons name="chevron-up-down" size={12} color={C.tabIconDefault} style={{ marginLeft: 2 }} />
              </View>
              <View style={styles.thCenter}>
                <ThemedText style={styles.thText}>Last Price</ThemedText>
                <MaterialCommunityIcons name="chevron-up-down" size={12} color={C.tabIconDefault} style={{ marginLeft: 2 }} />
              </View>
              <View style={styles.thRight}>
                <ThemedText style={styles.thText}>24h Chg%</ThemedText>
                <MaterialCommunityIcons name="chevron-up-down" size={12} color={C.tabIconDefault} style={{ marginLeft: 2 }} />
              </View>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  dotsMenu: {
    padding: 4,
  },

  tabs1Scroll: {
    marginBottom: 8,
  },
  tabs1Container: {
    paddingHorizontal: 16,
    gap: 20,
  },
  tab1Btn: {
    paddingVertical: 12,
    position: 'relative',
  },
  tab1Text: {
    fontSize: 16,
    fontWeight: '500',
  },
  tab1Underline: {
    position: 'absolute',
    bottom: 4,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#F5C518',
    borderRadius: 2,
  },

  tabs2Scroll: {
    marginBottom: 8,
  },
  tabs2Container: {
    paddingHorizontal: 16,
    gap: 20,
  },
  tab2Btn: {
    paddingVertical: 8,
  },
  tab2Text: {
    fontSize: 15,
    fontWeight: '500',
  },

  tabs3Row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 16,
  },
  tabs3Scroll: {
    flex: 1,
  },
  tabs3Container: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 8,
  },
  tab3Btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tab3Text: {
    fontSize: 12,
    fontWeight: '500',
  },
  listMenuBtn: {
    padding: 6,
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  thLeft: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  thRight: {
    width: 85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  thText: {
    fontSize: 11,
    color: '#9B9B9B',
    fontWeight: '500',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  colLeft: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameBlock: {
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 11,
  },
  colCenter: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 16,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  usdText: {
    fontSize: 11,
  },
  colRight: {
    width: 85,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  changeBtn: {
    width: 78,
    height: 34,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
