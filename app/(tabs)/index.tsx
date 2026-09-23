import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Linking, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// Notification handler is configured once in app/_layout.tsx (with
// shouldShowBanner / shouldShowList). Do not override it here.

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
    author: 'Binance Square Official',
    time: '6h',
    avatar: 'https://public.bnbstatic.com/image/pgc/202310/4f74b69ed53c1d3c0f3d6d30f54155bb.png',
    text: 'Share & Win Traffic Reward in our Trending Hashtag Campaign\n\n✨Topic: Will CPI Trigger Rate Hike?\n\n👉How to Join:\nPublish a short post or article with hashtag #CPIWatch\nCreate content based on the below two angles:\n- Nonfarm payrolls beat expectations and CPI is around the corner, do you think the Fed will hike or hold the rate?\n- Bullish or bearish? Share your take and showcase your stocks or gold trade/holdings with our trade sharing widget.',
    likes: '279',
    views: '472.1k',
    postImage: 'https://public.bnbstatic.com/static/content/square/images/9af45c715dd64b19ab5d5aeabe90f722.png',
  },
  {
    id: '2',
    author: 'Spin-zk',
    time: 'Sep 9',
    avatar: 'https://public.bnbstatic.com/image/pgc/20260905/e436e8a1c8a74a42b11b3bccb0cdb874.jpg',
    text: 'ZECUSDT Perp — Opening Long\n\nUnrealized PNL: +404,349.97 USDT\n\nThe setup is playing out perfectly. $ZEC has been one of the most underappreciated assets in this cycle. Those who followed the call are already in solid profit. Hold your positions — the move isn\'t over.',
    likes: '322',
    views: '1.1M',
    postImage: 'https://public.bnbstatic.com/static/content/square/images/f1e930d8a3a042c58fdc6a5754ffd5c0.jpg',
  },
  {
    id: '3',
    author: 'Kripto Kurdu',
    time: 'Sep 10',
    avatar: 'https://bin.bnbstatic.com/internal_upload/live-admin-api/images/6qFy27R3dqZ1TRDFQEonyt.png',
    text: 'I DIDN\'T LIKE THESE GAINERS AT ALL! DOWN\n\nI might not have even seen some of these coins before — why on earth would projects like this go up?\n\n$VTHO is a project at the 60M level that suddenly spiked, but I didn\'t see anything useful about it.\n\n$ANIME is the token of an NFT project that wiped out its investors the moment it hit the market. It has no real utility — it was launched purely for profit. So send it to zero!\n\n$ZEST is the only coin among these that seems average to me. It could keep going!\n\nTHESE ARE MY PERSONAL OPINIONS! DO YOUR OWN RESEARCH!',
    likes: '55',
    views: '97.6k',
    postImage: 'https://public.bnbstatic.com/static/content/square/images/ab2c2a5e1d2c4752a4b5466674c2d57d.png',
  },
  {
    id: '4',
    author: 'Trade Zilla TZ',
    time: 'Sep 9',
    avatar: 'https://public.bnbstatic.com/image/pgc/202603/ee83fd7c760cbab8575c98bba97e19b9.jpg',
    text: 'Guys, when $ZEC was trading around $840, I told you that $ZEC was going to hit $1,000. And exactly as predicted, $ZEC reached $1,000.\n\nNow I\'m giving you #ZEC next target. You might find it hard to believe, but in my view, #ZEC could reach $2,000 within this week. This could be a golden opportunity, so consider taking a long entry early.',
    likes: '71',
    views: '87.3k',
    postImage: 'https://public.bnbstatic.com/static/content/square/images/604621d4a65e47579c7a18450db5aeb9.png',
  },
  {
    id: '5',
    author: '三马哥',
    time: '57m',
    avatar: 'https://public.bnbstatic.com/image/pgc/202605/95b277ebf06d54247d309b555a9973df.jpg',
    text: 'There are just a little over 3 hours left before the major CPI data is released. Can BTC quickly surge up to 77,800 before the announcement so we can grab a bite first? #BTC\n\nETH yesterday at 2,375 didn\'t get added to the position — if we had, we would have made even more. ETH long positions can be synchronized with BTC to take profit once at 77,800. This is a little "snack" before the CPI data comes out. #ETH',
    likes: '16',
    views: '5.1k',
    postImage: 'https://public.bnbstatic.com/static/content/square/images/461d82844e2945fb92860f5293a8796b.png',
  },
  {
    id: '6',
    author: 'MIND FLARE',
    time: '21h',
    avatar: 'https://public.bnbstatic.com/image/pgc/202603/b5a634c866744e6bb8d09f240437f45c.jpg',
    text: '$BTC is starting to look heavy on the 1H.\n\nAt $77,675, price is trading below MA7 ($78,005), MA25 ($78,366) and MA99 ($79,977). More importantly, every bounce since $78,564 has been sold into, while the latest decline is coming with stronger red volume.\n\n$77,650 is the immediate line I\'m watching. If BTC loses that level on a clean 1H close, the move can extend toward $77.3K–$77.0K before buyers get another meaningful test.\n\nFor bulls, BTC first needs to reclaim $77.9K–$78.0K. Above that, $78.22K–$78.36K becomes the real resistance zone. #BTC',
    likes: '20',
    views: '24.4k',
    postImage: 'https://public.bnbstatic.com/static/content/square/images/586afe91b34749d5acfee9361fd9b31b.jpg',
  }
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [isAddFundsVisible, setAddFundsVisible] = useState(false);
  const [isSetBalanceVisible, setSetBalanceVisible] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [notiAmountInput, setNotiAmountInput] = useState('');
  const { checkAuth } = useAuthStore();
  const { fetchPortfolio, globalBalance, fetchGlobalBalance, updateGlobalBalance } = usePortfolioStore();
  const { selectedCurrency, kshRate, fetchKshRate } = useCurrencyStore((state) => state);

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
  const [refreshing, setRefreshing] = useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
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
    fetchKshRate();
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
            <View style={styles.badge}><ThemedText style={styles.badgeText}>99+</ThemedText></View>
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
          <TouchableOpacity style={styles.iconBtn} onPress={() => setSetBalanceVisible(true)}>
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
              const withTimeout = <T,>(p: Promise<T>, ms = 12000): Promise<T | null> =>
                Promise.race([
                  p,
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
                ]) as Promise<T | null>;
              try {
                // allSettled + timeout: one slow/failing endpoint must not hang
                // the spinner or block the other fetch. 600ms min for visual feedback.
                await Promise.allSettled([
                  withTimeout(fetchGlobalBalance()),
                  withTimeout(fetchPortfolio()),
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <ThemedText type="bold" style={[styles.balAmount, { color: theme.text }]}>
                {selectedCurrency === 'USDT'
                  ? `$${formatNumber(globalBalance, 2)}`
                  : selectedCurrency === 'BTC'
                    ? formatNumber(globalBalance / btcPrice, 8)
                    : selectedCurrency === 'ETH'
                      ? formatNumber(globalBalance / ethPrice, 6)
                      : selectedCurrency === 'BNB'
                        ? formatNumber(globalBalance / bnbPrice, 4)
                        : selectedCurrency === 'KES'
                          ? `KSh ${formatNumber(globalBalance * kshRate, 2)}`
                          : formatNumber(globalBalance, 2)}
              </ThemedText>
              <ThemedText type='bold' style={[styles.currencyCode, { color: theme.text }]}>
                {selectedCurrency}
              </ThemedText>
            </View>
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
                  source={typeof post.postImage === 'string' ? { uri: post.postImage } : post.postImage}
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

      <AddFundsModal isVisible={isAddFundsVisible} onClose={() => setAddFundsVisible(false)} />

      <Modal
        visible={isSetBalanceVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSetBalanceVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSetBalanceVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={[styles.setBalanceSheet, { backgroundColor: theme.surface }]}>
                <ThemedText style={[styles.modalTitle, { color: theme.text }]}>Set Balance</ThemedText>

                <ThemedText style={[styles.inputLabel, { color: theme.tabIconDefault }]}>Balance (USDT)</ThemedText>
                <TextInput
                  style={[styles.inputField, { color: theme.text, borderColor: theme.surfaceHighlight }]}
                  placeholder="Enter balance"
                  placeholderTextColor={theme.tabIconDefault}
                  keyboardType="numeric"
                  value={balanceInput}
                  onChangeText={setBalanceInput}
                />
                <ThemedText style={[styles.currentBalanceText, { color: theme.tabIconDefault }]}>
                  Current Balance: {formatNumber(globalBalance, 2)} USDT
                </ThemedText>

                <ThemedText style={[styles.inputLabel, { color: theme.tabIconDefault, marginTop: 16 }]}>Notification Amount (USDT)</ThemedText>
                <TextInput
                  style={[styles.inputField, { color: theme.text, borderColor: theme.surfaceHighlight }]}
                  placeholder="Enter amount"
                  placeholderTextColor={theme.tabIconDefault}
                  keyboardType="numeric"
                  value={notiAmountInput}
                  onChangeText={setNotiAmountInput}
                />

                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.surfaceHighlight }]} onPress={() => setSetBalanceVisible(false)}>
                    <ThemedText style={{ color: theme.text, fontWeight: '600' }}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#F5C518' }]}
                    onPress={async () => {
                      const balanceVal = balanceInput?.trim() ?? '';
                      const notiVal = notiAmountInput?.trim() ?? '';
                      const hasBalance = balanceVal !== '' && !isNaN(Number(balanceVal));
                      const hasNoti = notiVal !== '' && !isNaN(Number(notiVal));
                      const currency = 'USDT';

                      // Close modal immediately, keep captured values for delayed work
                      setSetBalanceVisible(false);
                      setBalanceInput('');
                      setNotiAmountInput('');

                      if (hasNoti) {
                        const delaySec = 10;
                        // Pre-compute success timestamp so it matches delivery time
                        // even though we schedule up-front.
                        const successTime = new Date(Date.now() + delaySec * 1000)
                          .toISOString().replace('T', ' ').substring(0, 19) + ' (UTC)';

                        // 1. Show Processing immediately.
                        await Notifications.scheduleNotificationAsync({
                          content: {
                            title: `${currency} Deposit Processing`,
                            body: `Your deposit of ${notiVal} ${currency} is currently processing. If you do not recognize this activity, please contact us immediately.`,
                          },
                          trigger: null,
                        });

                        // 2. Schedule Successful up-front with an OS-level time trigger,
                        // so it arrives even if the JS timer is suspended (backgrounded app)
                        // or the balance POST below is slow/fails. Never gate this on the POST.
                        const trigger: any =
                          (Notifications as any).SchedulableTriggerInputTypes
                            ? {
                                type: (Notifications as any).SchedulableTriggerInputTypes.TIME_INTERVAL,
                                seconds: delaySec,
                              }
                            : { seconds: delaySec };
                        await Notifications.scheduleNotificationAsync({
                          content: {
                            title: `${currency} Deposit Successful`,
                            body: `You have successfully deposited ${notiVal} ${currency} at ${successTime}. If you do not recognize this activity please contact us immediately.`,
                          },
                          trigger,
                        });

                        // 3. Persist balance + notification amount in the background at
                        // success time WITHOUT updating UI or fetching. UI stays stale
                        // until user manually pull-to-refreshes (fetchGlobalBalance).
                        // Errors must not affect the already-scheduled Success notification.
                        if (hasBalance || hasNoti) {
                          const amt = hasBalance ? Number(balanceVal) : undefined;
                          const notiAmt = hasNoti ? Number(notiVal) : undefined;
                          setTimeout(() => {
                            updateGlobalBalance(amt, notiAmt).catch((e) =>
                              console.error('updateGlobalBalance error:', e),
                            );
                          }, delaySec * 1000);
                        }
                      } else if (hasBalance) {
                        // Persist only — no UI update/fetch. User pulls down to refresh manually.
                        try {
                          await updateGlobalBalance(Number(balanceVal), undefined);
                        } catch (e) {
                          console.error('updateGlobalBalance error:', e);
                        }
                      }
                    }}
                  >
                    <ThemedText style={{ color: '#000', fontWeight: 'bold' }}>Confirm</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

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
  balAmount: { fontSize: 32, lineHeight: 42 },
  currencyCode: { fontSize: 14, marginLeft: 2, marginBottom: 8 },
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
  postContentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  setBalanceSheet: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
  },
  currentBalanceText: {
    fontSize: 12,
    marginTop: 6,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
