import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Linking, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import AddFundsModal from '@/components/AddFundsModal';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { usePortfolioStore } from '@/store/portfolioStore';

const { width } = Dimensions.get('window');

const COINS = [
  { s: 'BNBUSDT', n: 'BNB', isHot: true },
  { s: 'BTCUSDT', n: 'BTC', isHot: true },
  { s: 'ETHUSDT', n: 'ETH', isHot: true },
  { s: 'MEGAUSDT', n: 'MEGA', isHot: false }, // Mocked token
  { s: 'SOLUSDT', n: 'SOL', isHot: false },
];

const MARKETING_BANNERS = [
  {
    title: 'HODLer Airdrops',
    desc: 'Subscribe to BNB Simple Earn Products to receive automatically',
    link: 'https://app.binance.com/earn/simple-earn?asset=BNB&productId=BNB001&top=1&_dp=L2Vhcm5zL3NpbXBsZUJ1eT9wcm9kdWN0PUJOQjAwMSZkdXJhdGlvbj1GbGV4aWJsZSZhc3NldD1CTkI',
    image: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20260410/27697385-76d8-4c94-994f-f839af54c72b.png'
  },
  {
    title: 'Enjoy Up to 20% APR Rewards',
    desc: 'Subscribe to CATI Flexible Products now!',
    link: 'https://www.binance.com/earn/simple-earn?asset=CATI&productId=CATI001&top=1',
    image: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20260417/b92c652e-7690-47fb-bfc4-92218e8e74ba.png'
  },
  {
    title: 'USDe Rewards Are Here',
    desc: 'Simply Holding to Earn Rewards',
    link: 'https://app.binance.com/earn/usde-page?_dp=L3dlYnZpZXcvd2Vidmlldz90eXBlPWRlZmF1bHQmbmVlZER5bmFtaWM9dHJ1ZSZ1cmw9YUhSMGNITTZMeTkzZDNjdVltbHVZVzVqWlM1amIyMHZaV0Z5Ymk5MWMyUmxMWEJoWjJV',
    image: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20260410/6e36d996-0a2d-4bbe-bd15-f1b2144214e3.png'
  }
];
const SEARCH_PLACEHOLDERS = [
  '🔥 MEGA top gainer',
  '🔥 D top gainer',
  '🔥 BIO hot search',
];



const DISCOVER_POSTS = [
  {
    id: '1',
    author: 'Spot Safe Capital',
    time: 'Apr 29',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'UPDATE $SOL FDUSD 29/04/2026 18:30\n\nThe analysis remains the same, no changes, currently wave 4 is complete, we are in wave 5 in black (3 pink), I hope this market will fall impulsively and I will take profit gradually too\n\nTonight there will be an FOMC meeting and interest rate, but by reading the news, it is very likely that the market will only spike up and down (choppy) because of the many uncertainties and expectations from the market.',
    likes: '133',
    views: '372.5k',
    postImage: require('@/assets/news/news_1.webp'),
  },
  {
    id: '2',
    author: 'CryptoHelix',
    time: 'Apr 29',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    text: '🚨 STOP LOSS IS NOT SAFETY — IT\'S A TARGET 🚨\nYOUR STOP LOSS IS PUBLIC INFORMATION 🚨\n\nRead that again.\nYour SL isn\'t "protection"...\nIt\'s liquidity sitting on the chart.\nAnd guess who gets paid when it gets hit?\n👉 Not you.\n\n📉 The reality no one tells you:\nMarket makers don\'t guess your trade…\nThey engineer moves to take your stop first — THEN move in your direction.',
    likes: '232',
    views: '375.5k',
    postImage: require('@/assets/news/news_2.webp'),
  },
  {
    id: '3',
    author: 'MarketPulse Crypto Analyst',
    time: 'Apr 28',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: '$STO After a whole day of stability and positive dynamics, where do we go next? I predict a price of $0.10 tomorrow. Don\'t let me down, STO team, stop dragging, let the growth go, the time has come)))',
    likes: '113',
    views: '280.6k',
    postImage: require('@/assets/news/news_3.webp'),
  },
  {
    id: '4',
    author: 'Pampa1',
    time: 'Apr 28',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    text: 'XRP at a Tipping Point: 200 Days of Support, But Cracks Are Showing$XRP \n\nSomething feels off with XRP right now. After hovering around a key support zone for nearly 200 days, the market is starting to look… undecided.\n\nThe chart shows XRP clinging to a long-standing support range, but momentum isn\'t exactly convincing. Price action has been choppy, with neither buyers nor sellers taking full control.',
    likes: '154',
    views: '223k',
    postImage: require('@/assets/news/news_4.webp'),
  },
  {
    id: '5',
    author: 'BabaYaga Calls',
    time: 'Apr 28',
    avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
    text: '🚨 $LUNC Update\n\nI\'m not too focused on this coin this is more about the trend itself.\n\n$LUNC is moving again with strong volume and fresh hype, but these kinds of sudden pumps always catch attention.\nSometimes it\'s not the coin, it\'s the pattern that becomes interesting.',
    likes: '150',
    views: '183.8k',
    postImage: require('@/assets/news/news_5.webp'),
  },
  {
    id: '6',
    author: 'WA7CRYPTO',
    time: '9h',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    text: 'Dear follower, forget about investing in a cryptocurrency and thinking that within 15 or 30 days it will rise 300%, or that with 50x leverage you\'ll achieve 3000% or 10000% returns. Do you realize that if you did that in 2024 or 2025, your portfolio would likely be wiped out due to this movement?',
    likes: '63',
    views: '120.9k',
    postImage: require('@/assets/news/news_6.webp'),
  }
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [isAddFundsVisible, setAddFundsVisible] = useState(false);
  const { checkAuth } = useAuthStore();
  const { fetchPortfolio, globalBalance, fetchGlobalBalance } = usePortfolioStore();
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);

  const [bnbPrice, setBnbPrice] = useState(616.39);
  const [btcPrice, setBtcPrice] = useState(60000);
  const [ethPrice, setEthPrice] = useState(3200);
  const [pnl, setPnl] = useState({ usd: '$0.00', percent: '0.00%', isPositive: true });

  const formatNumber = (num: number, decimals: number = 2) => {
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const [discoverPosts, setDiscoverPosts] = useState<any[]>(DISCOVER_POSTS);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const [searchPlaceholderIndex, setSearchPlaceholderIndex] = useState(0);
  const searchScrollRef = useRef<ScrollView>(null);

  // Pull to Refresh State
  const scrollY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshProgress = useSharedValue(0);
  const REFRESH_THRESHOLD = 80;

  useEffect(() => {
    if (refreshing) {
      isRefreshing.value = true;
      refreshProgress.value = withTiming(1);
    } else {
      isRefreshing.value = false;
      refreshProgress.value = withTiming(0);
    }
  }, [refreshing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // Drive the custom indicator based on built-in pull distance
      if (!isRefreshing.value) {
        refreshProgress.value = Math.max(0, -event.contentOffset.y / REFRESH_THRESHOLD);
      }
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Hide header on BOTH scroll down (positive) and pull-to-refresh (negative)
    const opacity = interpolate(
      scrollY.value,
      [-60, 0, 60],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [-60, 0, 60],
      [-40, 0, -20],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
      overflow: 'hidden'
    };
  });

  const [tokens, setTokens] = useState<any[]>(
    COINS.map(c => ({
      symbol: c.s,
      name: c.n,
      priceStr: '0.00',
      usdStr: '$0.00',
      changeStr: '0.00%',
      isPositive: true,
      isHot: c.isHot
    }))
  );

  useEffect(() => {
    checkAuth();
    fetchPortfolio();
    fetchGlobalBalance();
  }, []);

  useEffect(() => {
    // Initial fake MEGA coin data to match screenshot
    setTokens(prev => {
      const copy = [...prev];
      const megaIdx = copy.findIndex(t => t.symbol === 'MEGAUSDT');
      if (megaIdx !== -1) {
        copy[megaIdx] = {
          ...copy[megaIdx],
          priceStr: '0.17013',
          usdStr: '$0.17',
          changeStr: '+220.55%',
          isPositive: true,
        };
      }
      return copy;
    });

    const streams = COINS.filter(c => c.s !== 'MEGAUSDT').map(c => `${c.s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        const item = json.data;
        if (!item) return;

        setTokens(prev => {
          const newTokens = [...prev];
          const idx = newTokens.findIndex(t => t.symbol === item.s);
          if (idx !== -1) {
            const lastPrice = parseFloat(item.c);
            const priceChange = parseFloat(item.P);

            if (item.s === 'BNBUSDT') {
              setBnbPrice(lastPrice);
              const pnlUsd = (globalBalance * (priceChange / 100));
              setPnl({
                usd: `${pnlUsd >= 0 ? '+' : '-'}$${formatNumber(Math.abs(pnlUsd), 2)}`,
                percent: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
                isPositive: priceChange >= 0
              });
            }

            if (item.s === 'BTCUSDT') {
              setBtcPrice(lastPrice);
            }

            if (item.s === 'ETHUSDT') {
              setEthPrice(lastPrice);
            }

            let formattedPrice = formatNumber(lastPrice, 2);
            const usdVal = lastPrice;
            let formattedUsd = formatNumber(usdVal, 2);

            newTokens[idx] = {
              ...newTokens[idx],
              priceStr: formattedPrice,
              usdStr: `$${formattedUsd}`,
              changeStr: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
              isPositive: priceChange >= 0,
            };
          }
          return newTokens;
        });
      } catch (e) { }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % MARKETING_BANNERS.length;
        scrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchPlaceholderIndex((prev) => {
        const next = (prev + 1) % SEARCH_PLACEHOLDERS.length;
        searchScrollRef.current?.scrollTo({ y: next * 34, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalFiatValue = globalBalance;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} collapsable={false}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatarWrap}>
            <Image source={require('@/assets/icons/profile-avatar.png')} style={styles.avatarImg} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inboxBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M20.653 2.508A1.5 1.5 0 0122 4v12.273l-.008.153a1.5 1.5 0 01-1.339 1.339l-.153.008h-6.092l-.05.013-5.816 3.397-.19.093A1.502 1.502 0 016.3 20.1l-.014-.212v-2.014a.101.101 0 00-.061-.093l-.04-.008H3.5l-.153-.007a1.5 1.5 0 01-1.34-1.34L2 16.274V4a1.5 1.5 0 011.347-1.492L3.5 2.5h17l.153.008zM3.8 15.973h2.386a1.9 1.9 0 011.9 1.9v1.491l5.364-3.132.11-.06c.263-.131.554-.2.848-.2H20.2V4.3H3.8v11.673zm13.292-4.369a.9.9 0 010 1.792L17 13.4H7a.9.9 0 010-1.8h10l.092.005zm0-4.5a.9.9 0 010 1.792L17 8.9H7a.9.9 0 010-1.8h10l.092.004z" fill={theme.text} />
            </Svg>
            <View style={styles.badge}><ThemedText style={styles.badgeText}>66</ThemedText></View>
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleWrap, { backgroundColor: theme.surfaceHighlight }]}>
          <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: theme.background }]}>
            <ThemedText style={[styles.toggleText, { color: theme.text, fontWeight: '700' }]}>Exchange</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleBtn} onPress={() => router.push('/wallet')}>
            <ThemedText style={[styles.toggleText, { color: theme.tabIconDefault }]}>Wallet</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="scan-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                // Minimum visual delay of 800ms combined with the API fetch calls
                await Promise.all([
                  fetchGlobalBalance(),
                  fetchPortfolio(),
                  new Promise(resolve => setTimeout(resolve, 800))
                ]);
              } catch (e) {
                console.log(e);
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor="transparent"   // hides the default spinner on iOS
            colors={['transparent']}  // hides it on Android
            progressBackgroundColor="transparent"
          />
        }
      >
        {/* ── SEARCH ── */}
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceHighlight }]}>
          <View style={{ flex: 1, height: 38, overflow: 'hidden' }}>
            <ScrollView
              ref={searchScrollRef}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            >
              {SEARCH_PLACEHOLDERS.map((text, i) => (
                <View key={i} style={{ height: 34, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 6 }}>
                  <ThemedText style={[styles.searchInput, { color: theme.tabIconDefault }]}>
                    {text}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>
          <Ionicons name="search" size={18} color={theme.tabIconDefault} />
        </View>

        {/* ── BALANCE ── */}
        <View style={styles.balanceWrap}>
          <View style={styles.balTop}>
            <ThemedText style={[styles.balLabel, { color: theme.text }]}>
              Est. Total Value ({selectedCurrency})
            </ThemedText>
            <Ionicons name="chevron-up" size={14} color={theme.text} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.balMid}>
            <ThemedText style={[styles.balAmount, { color: theme.text }]}>
              {selectedCurrency === 'USDT'
                ? formatNumber(globalBalance, 2)
                : selectedCurrency === 'BTC'
                  ? formatNumber(globalBalance / btcPrice, 8)
                  : selectedCurrency === 'ETH'
                    ? formatNumber(globalBalance / ethPrice, 6)
                    : selectedCurrency === 'BNB'
                      ? formatNumber(globalBalance / bnbPrice, 4)
                      : selectedCurrency === 'KSH'
                        ? formatNumber(globalBalance * 145, 2)
                        : formatNumber(globalBalance, 2)}
            </ThemedText>
            <TouchableOpacity style={styles.addFundsBtn} onPress={() => setAddFundsVisible(true)}>
              <ThemedText style={styles.addFundsText}>Add Funds</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={[styles.fiatAmount, { color: theme.tabIconDefault }]}>≈${formatNumber(globalBalance, 2)}</ThemedText>

          <View style={styles.pnlRow}>
            <ThemedText style={[styles.pnlLabel, { color: theme.tabIconDefault }]}>Today's PNL </ThemedText>
            <ThemedText style={[styles.pnlValue, { color: pnl.isPositive ? '#0FC97B' : '#F04B5A' }]}>
              {pnl.usd} ({pnl.percent})
            </ThemedText>
            <Ionicons
              name={pnl.isPositive ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={pnl.isPositive ? '#0FC97B' : '#F04B5A'}
              style={{ marginLeft: 4 }}
            />
          </View>
        </View>

        {/* ── BANNER ── */}
        <View style={[styles.bannerCard, { borderColor: theme.surfaceHighlight }]}>
          {/* Carousel */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / (width - 32));
              setActiveBannerIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {MARKETING_BANNERS.map((banner, idx) => (
              <View key={idx} style={[styles.bannerSlide, { width: width - 32 }]}>
                <TouchableOpacity
                  onPress={() => Linking.openURL(banner.link)}
                  activeOpacity={0.8}
                  style={styles.bannerContent}
                >
                  <View style={styles.bannerTextContainer}>
                    <View style={styles.bannerHeader}>
                      <ThemedText style={[styles.bannerLabel, { color: theme.tabIconDefault }]}>{banner.title}</ThemedText>
                    </View>
                    <ThemedText style={[styles.bannerDesc, { color: theme.text }]} numberOfLines={2}>
                      {banner.desc}
                    </ThemedText>
                  </View>
                  <Image source={{ uri: banner.image }} style={styles.bannerImage} resizeMode="contain" />
                  <TouchableOpacity style={[styles.joinBtn, { backgroundColor: theme.surfaceHighlight, marginLeft: 12 }]}>
                    <ThemedText style={[styles.joinBtnText, { color: theme.text }]}>Join</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.bannerDots}>
            {MARKETING_BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i === activeBannerIndex ? theme.text : theme.surfaceHighlight }]}
              />
            ))}
          </View>
        </View>

        {/* ── ACTION CARDS ── */}
        <View style={styles.actionCardsRow}>
          <View style={[styles.actionCard, { backgroundColor: theme.surface }]}>
            <ThemedText style={[styles.actionTitle, { color: theme.tabIconDefault }]}>Pay</ThemedText>
            <ThemedText style={[styles.actionDesc, { color: theme.text }]}>Pay with Crypto Instantly</ThemedText>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surfaceHighlight }]}>
              <Ionicons name="cart-outline" size={16} color={theme.text} style={{ marginRight: 6 }} />
              <ThemedText style={[styles.actionBtnText, { color: theme.text }]}>Buy Goods</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.actionCard, { backgroundColor: theme.surface }]}>
            <View style={styles.uahHeader}>
              <View style={styles.uahIcon}><ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>₴</ThemedText></View>
              <ThemedText style={[styles.actionTitle, { color: theme.tabIconDefault, marginLeft: 6 }]}>UAH</ThemedText>
            </View>
            <View style={styles.depositBadge}><ThemedText style={styles.depositBadgeText}>Deposit</ThemedText></View>
            <ThemedText style={[styles.actionDesc, { color: theme.text }]}>Card (Fiat Trade)</ThemedText>
            <Ionicons name="card-outline" size={24} color={theme.text} style={{ marginTop: 12 }} />

            <View style={styles.cardDots}>
              <View style={[styles.dot, { backgroundColor: theme.text }]} />
              <View style={[styles.dot, { backgroundColor: theme.surfaceHighlight }]} />
            </View>
          </View>
        </View>

        {/* ── CRYPTO LIST ── */}
        <View style={[styles.cryptoSection, { backgroundColor: theme.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cryptoTabsRow}>
            {['Favorites', 'Hot', 'Alpha', 'New', 'Gainers', 'Losers'].map((tab, idx) => (
              <ThemedText key={tab} style={[
                styles.cryptoTab,
                idx === 1 ? [styles.cryptoTabActive, { color: theme.text }] : { color: theme.tabIconDefault }
              ]}>{tab}</ThemedText>
            ))}
          </ScrollView>

          <View style={styles.cryptoSubTabs}>
            <ThemedText style={[styles.cryptoSubTab, { color: theme.text, fontWeight: '700' }]}>Crypto</ThemedText>
            <ThemedText style={[styles.cryptoSubTab, { color: theme.tabIconDefault }]}>Futures</ThemedText>
          </View>

          <View style={styles.listHeaderRow}>
            <ThemedText style={[styles.listHeader, { color: theme.tabIconDefault, flex: 2 }]}>Name</ThemedText>
            <ThemedText style={[styles.listHeader, { color: theme.tabIconDefault, flex: 2, textAlign: 'right' }]}>Last Price</ThemedText>
            <ThemedText style={[styles.listHeader, { color: theme.tabIconDefault, flex: 1.5, textAlign: 'right' }]}>24h chg%</ThemedText>
          </View>

          {tokens.map((coin) => (
            <View key={coin.symbol} style={styles.listItem}>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={[styles.coinName, { color: theme.text }]}>{coin.name}</ThemedText>
                {coin.isHot && <ThemedText style={{ marginLeft: 4, fontSize: 12 }}>🔥</ThemedText>}
              </View>
              <View style={{ flex: 2, alignItems: 'flex-end' }}>
                <ThemedText style={[styles.coinPrice, { color: theme.text }]}>{coin.priceStr}</ThemedText>
                <ThemedText style={[styles.coinFiat, { color: theme.tabIconDefault }]}>{coin.usdStr}</ThemedText>
              </View>
              <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                <View style={[styles.chgButton, { backgroundColor: coin.isPositive ? '#0FC97B' : '#F04B5A' }]}>
                  <ThemedText style={[styles.chgText, { color: '#FFF' }]}>{coin.changeStr}</ThemedText>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.viewMoreBtn}>
            <ThemedText style={[styles.viewMoreText, { color: theme.tabIconDefault }]}>View More</ThemedText>
          </TouchableOpacity>
        </View>

        {/* ── DISCOVER FEED ── */}
        <View style={styles.discoverSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.discoverTabsRow}>
            {['Discover', 'Following', 'Campaign', 'Announcements'].map((tab, idx) => (
              <View key={tab} style={{ position: 'relative' }}>
                <ThemedText style={[
                  styles.discoverTab,
                  idx === 0 ? [styles.discoverTabActive, { color: theme.text }] : { color: theme.tabIconDefault }
                ]}>{tab}</ThemedText>
                {idx === 0 && <View style={[styles.discoverTabUnderline, { backgroundColor: '#F5C518' }]} />}
              </View>
            ))}
            <TouchableOpacity style={{ padding: 12 }}><Ionicons name="menu" size={20} color={theme.text} /></TouchableOpacity>
          </ScrollView>

          {/* Social Posts mapped from actual Binance Square data */}
          {discoverPosts.map(post => (
            <View key={post.id} style={[styles.postCard, { borderBottomColor: theme.surfaceHighlight }]}>
              <View style={styles.postHeader}>
                <Image
                  source={{ uri: post.avatar }}
                  style={styles.postAvatar}
                />
                <View>
                  <ThemedText style={[styles.postAuthor, { color: theme.text }]}>{post.author}</ThemedText>
                </View>
                <ThemedText style={[styles.postTime, { color: theme.tabIconDefault }]}>• {post.time}</ThemedText>
                <View style={{ flex: 1 }} />
                <Ionicons name="close" size={16} color={theme.tabIconDefault} />
              </View>

              <ThemedText style={[styles.postText, { color: theme.text }]}>
                {post.text}
              </ThemedText>

              {post.postImage && (
                <Image
                  source={post.postImage}
                  style={styles.postContentImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.postFooter}>
                <View style={styles.postFooterItem}>
                  <Ionicons name="thumbs-up-outline" size={18} color={theme.tabIconDefault} />
                  <ThemedText style={[styles.postFooterText, { color: theme.tabIconDefault }]}>{post.likes}</ThemedText>
                </View>
                <View style={styles.postFooterItem}>
                  <Ionicons name="eye-outline" size={18} color={theme.tabIconDefault} />
                  <ThemedText style={[styles.postFooterText, { color: theme.tabIconDefault }]}>{post.views}</ThemedText>
                </View>
                <View style={styles.postFooterItem}>
                  <Ionicons name="share-social-outline" size={18} color={theme.tabIconDefault} />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* ── REFRESH INDICATOR ── */}
      <RefreshIndicator progress={refreshProgress} refreshing={refreshing} />

      <AddFundsModal isVisible={isAddFundsVisible} onClose={() => setAddFundsVisible(false)} />
    </SafeAreaView>
  );
}

const RefreshIndicator = ({ progress, refreshing }: { progress: any, refreshing: boolean }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        -1,
        false
      );
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(0.8, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
      rotation.value = withTiming(0);
      pulse.value = withTiming(1);
    }
  }, [refreshing]);

  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.2], [0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(progress.value, [0, 1], [-20, 30], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const centerSquareStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const scale = refreshing
      ? pulse.value
      : interpolate(p, [0.3, 0.7, 1], [0, 1, 1.2], Extrapolate.CLAMP);
    const rotateDeg = refreshing
      ? `${rotation.value + 45}deg`
      : `${interpolate(p, [0.5, 1], [0, 45], Extrapolate.CLAMP)}deg`;
    return {
      transform: [{ rotate: rotateDeg }, { scale }],
      opacity: interpolate(p, [0.2, 0.4], [0, 1], Extrapolate.CLAMP),
    };
  });

  const leftSquareStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const translateX = refreshing
      ? 0
      : interpolate(p, [0.1, 0.6, 1], [-30, -14, 0], Extrapolate.CLAMP);
    const scale = refreshing
      ? pulse.value * 0.8
      : interpolate(p, [0.1, 0.6], [0.5, 0.8], Extrapolate.CLAMP);
    const rotateDeg = refreshing
      ? `${rotation.value + 45}deg`
      : `${interpolate(p, [0.6, 1], [0, 45], Extrapolate.CLAMP)}deg`;
    return {
      transform: [{ translateX }, { rotate: rotateDeg }, { scale }],
      opacity: interpolate(p, [0, 0.3], [0, 1], Extrapolate.CLAMP),
    };
  });

  const rightSquareStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const translateX = refreshing
      ? 0
      : interpolate(p, [0.1, 0.6, 1], [30, 14, 0], Extrapolate.CLAMP);
    const scale = refreshing
      ? pulse.value * 0.8
      : interpolate(p, [0.1, 0.6], [0.5, 0.8], Extrapolate.CLAMP);
    const rotateDeg = refreshing
      ? `${rotation.value + 45}deg`
      : `${interpolate(p, [0.6, 1], [0, 45], Extrapolate.CLAMP)}deg`;
    return {
      transform: [{ translateX }, { rotate: rotateDeg }, { scale }],
      opacity: interpolate(p, [0, 0.3], [0, 1], Extrapolate.CLAMP),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"   // ← component prop, not style
      style={[
        {
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        },
        containerStyle,
      ]}
    >
      <View style={{ width: 80, height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.refreshSquare, centerSquareStyle, { position: 'absolute' }]} />
        <Animated.View style={[styles.refreshSquare, leftSquareStyle, { position: 'absolute' }]} />
        <Animated.View style={[styles.refreshSquare, rightSquareStyle, { position: 'absolute' }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', width: 90, gap: 12 },
  avatarWrap: { position: 'relative', width: 28, height: 28 },
  avatarImg: { width: 28, height: 28, borderRadius: 16 },
  avatarEditOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(24, 26, 32, 0.4)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  vipBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#000', borderRadius: 8, paddingHorizontal: 4, borderWidth: 1, borderColor: '#fcd535' },
  vipBadgeText: { color: '#fcd535', fontSize: 8, fontWeight: 'bold' },
  inboxBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#F5C518', borderRadius: 10, paddingHorizontal: 4, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#000', marginTop: -4 },
  toggleWrap: { flexDirection: 'row', borderRadius: 8, padding: 3 },
  toggleBtn: { paddingVertical: 3, paddingHorizontal: 16, borderRadius: 6 },
  toggleText: { fontSize: 13, fontWeight: '600' },
  headerRight: { flexDirection: 'row', width: 90, justifyContent: 'flex-end', gap: 16 },
  iconBtn: {},

  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, borderRadius: 20, paddingHorizontal: 12, height: 38 },
  fireIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13 },

  balanceWrap: { paddingHorizontal: 16, marginBottom: 20 },
  balTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  balLabel: { fontSize: 13, fontWeight: '500' },
  balMid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  balAmount: { fontSize: 34, fontWeight: '700', lineHeight: 40 },
  addFundsBtn: { backgroundColor: '#F5C518', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 6 },
  addFundsText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
  fiatAmount: { fontSize: 13, marginBottom: 8 },
  pnlRow: { flexDirection: 'row', alignItems: 'center' },
  pnlLabel: { fontSize: 12 },
  pnlValue: { fontSize: 12, fontWeight: '500' },

  bannerCard: { marginHorizontal: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, overflow: 'hidden' },
  bannerHeader: { marginBottom: 4 },
  bannerLabel: { fontSize: 12, fontWeight: '600' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, height: 90 },
  bannerTextContainer: { flex: 1, paddingRight: 12 },
  bannerDesc: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  joinBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  joinBtnText: { fontSize: 12, fontWeight: '600' },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 12, gap: 4 },

  actionCardsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24, height: 140, gap: 12 },
  actionCard: { flex: 1, borderRadius: 12, padding: 14, position: 'relative' },
  actionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  actionDesc: { fontSize: 15, fontWeight: '600', lineHeight: 20, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  uahHeader: { flexDirection: 'row', alignItems: 'center' },
  uahIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#2b78e4', justifyContent: 'center', alignItems: 'center' },
  depositBadge: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 8 },
  depositBadgeText: { color: '#0FC97B', fontSize: 9, fontWeight: '600' },
  cardDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  bannerSlide: { width: width - 32, overflow: 'hidden' },
  bannerImage: { width: 60, height: 60, borderRadius: 8 },

  cryptoSection: { paddingTop: 8, paddingHorizontal: 16 },
  cryptoTabsRow: { flexDirection: 'row', marginBottom: 16 },
  cryptoTab: { fontSize: 15, marginRight: 24, fontWeight: '500' },
  cryptoTabActive: { fontWeight: 'bold', fontSize: 17 },
  cryptoSubTabs: { flexDirection: 'row', marginBottom: 16 },
  cryptoSubTab: { fontSize: 13, marginRight: 16 },
  listHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  listHeader: { fontSize: 11 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  coinName: { fontSize: 16, fontWeight: '700' },
  coinPrice: { fontSize: 16, fontWeight: '600' },
  coinFiat: { fontSize: 12, marginTop: 2 },
  chgButton: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6, minWidth: 72, alignItems: 'center' },
  chgText: { fontWeight: '700', fontSize: 13 },
  viewMoreBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  viewMoreText: { fontSize: 13, fontWeight: '500' },

  discoverSection: { marginTop: 12 },
  discoverTabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2B3139' },
  discoverTab: { fontSize: 15, fontWeight: '600', paddingVertical: 12, paddingHorizontal: 16 },
  discoverTabActive: { fontWeight: '700' },
  discoverTabUnderline: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 3, borderRadius: 2 },
  postCard: { padding: 16, borderBottomWidth: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  postAuthor: { fontSize: 14, fontWeight: '600' },
  postTime: { fontSize: 12, marginLeft: 6 },
  postText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  postFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postFooterText: { fontSize: 13, fontWeight: '500' },
  refreshSquare: {
    width: 14,
    height: 14,
    backgroundColor: '#F5C518',
    borderRadius: 2,
  },
  postContentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
});
