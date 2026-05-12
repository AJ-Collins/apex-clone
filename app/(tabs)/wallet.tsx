import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { usePortfolioStore } from '@/store/portfolioStore';

export default function WalletScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { balances, fetchPortfolio, globalBalance, fetchGlobalBalance } = usePortfolioStore();
  const [btcPrice, setBtcPrice] = React.useState(60000);

  useEffect(() => {
    fetchPortfolio();
    fetchGlobalBalance();

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setBtcPrice(parseFloat(data.c));
      } catch (err) {}
    };
    return () => ws.close();
  }, []);

  const totalBalanceUsd = globalBalance;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer}>
             <View style={[styles.hamburger, { justifyContent: 'center', alignItems: 'flex-start', flex: 1 }]}>
                <Ionicons name="menu" size={28} color={theme.text} />
             </View>
          </TouchableOpacity>
          
          <View style={[styles.toggleContainer, { backgroundColor: theme.surface }]}>
             <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => router.push('/')}
             >
               <ThemedText style={[styles.toggleTextInactive, { color: theme.textSecondary }]}>Exchange</ThemedText>
             </TouchableOpacity>
             <TouchableOpacity 
                style={[styles.toggleButton, { backgroundColor: theme.surfaceHighlight }]}
                onPress={() => {}} // Already on Wallet
             >
               <ThemedText style={[styles.toggleTextActive, { color: theme.text }]}>Wallet</ThemedText>
             </TouchableOpacity>
          </View>
          
          <View style={styles.headerRight}>
             <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="headset-outline" size={24} color={theme.text} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="scan-outline" size={24} color={theme.text} />
             </TouchableOpacity>
          </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Wallet Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
           <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.walletSearchIcon} />
           <ThemedText style={[styles.searchInput, { color: theme.textSecondary }]}>哈基米 Trends</ThemedText>
        </View>

        {/* Wallet Balance */}
        <View style={styles.walletBalanceContainer}>
           <View style={styles.walletTitleRow}>
              <MaterialCommunityIcons name="shield-check" size={16} color={theme.textSecondary} />
              <ThemedText style={[styles.walletTitleText, { color: theme.textSecondary }]}>My Wallet</ThemedText>
              <MaterialCommunityIcons name="menu-down" size={20} color={theme.textSecondary} />
              <Ionicons name="copy-outline" size={14} color={theme.textSecondary} style={{marginLeft: 12}} />
           </View>
           <View style={styles.walletAmountRow}>
              <ThemedText style={[styles.walletAmount, { color: theme.text }]}>
                {(totalBalanceUsd / btcPrice).toFixed(8)}
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => router.push('/deposit')} style={[styles.receiveButton, { backgroundColor: theme.yellow }]}>
                   <ThemedText style={styles.receiveText}>Deposit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/withdraw')} style={[styles.receiveButton, { backgroundColor: theme.surfaceHighlight }]}>
                   <ThemedText style={[styles.receiveText, { color: theme.text }]}>Withdraw</ThemedText>
                </TouchableOpacity>
              </View>
           </View>
           <View style={styles.walletSubAmountRow}>
               <ThemedText style={[styles.walletSubAmount, { color: theme.textSecondary }]}>≈${totalBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ThemedText>
              <MaterialCommunityIcons name="chevron-down" size={16} color={theme.textSecondary} />
           </View>
        </View>

        {/* Action Icons */}
        <View style={styles.walletActions}>
           {[
             {name: 'Alpha', icon: 'alpha-a-box-outline', type: 'material'},
             {name: 'Securities', icon: 'trending-up', type: 'ion'},
             {name: 'Earn', icon: 'cash-outline', type: 'ion'},
             {name: 'Referral', icon: 'person-add-outline', type: 'ion'},
             {name: 'More', icon: 'grid-outline', type: 'ion'},
           ].map((a) => (
             <TouchableOpacity 
               key={a.name} 
               style={styles.walletActionItem}
               onPress={() => {
                 if (a.name === 'Referral') router.push('/referral');
               }}
             >
                <View style={[styles.walletActionIconContainer, { backgroundColor: theme.surface }]}>
                   {a.type === 'material' ? 
                     <MaterialCommunityIcons name={a.icon as any} size={22} color={theme.yellow} /> :
                     <Ionicons name={a.icon as any} size={22} color={a.name === 'Securities' ? theme.text : theme.text} style={a.name === 'Earn' && {color: theme.yellow}} />
                   }
                </View>
                <ThemedText style={[styles.walletActionText, { color: theme.text }]}>{a.name}</ThemedText>
             </TouchableOpacity>
           ))}
        </View>

        {/* Perpetuals Banner */}
        <View style={[styles.perpBanner, { backgroundColor: theme.surface }]}>
           <View style={{flex: 1}}>
              <ThemedText style={[styles.perpTitle, { color: theme.text }]}>Trade Perpetuals To Earn 3 Alpha Points</ThemedText>
              <ThemedText style={[styles.perpLink, { color: theme.yellow }]}>Trade Now</ThemedText>
           </View>
           <View style={styles.perpIconContainer}>
              <Ionicons name="apps" size={40} color={theme.yellow} />
           </View>
        </View>

        {/* Meme & Earn Cards */}
        <View style={styles.walletCardsRow}>
           <View style={[styles.walletCard, { backgroundColor: theme.surface, marginRight: 8 }]}>
              <View style={styles.walletCardHeader}>
                 <ThemedText style={[styles.walletCardTitle, { color: theme.text }]}>Meme Rush</ThemedText>
                 <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
              </View>
              <View style={styles.walletCardMetrics}>
                 <View>
                    <ThemedText style={[styles.walletCardValue, { color: theme.text }]}>120</ThemedText>
                    <ThemedText style={[styles.walletCardSub, { color: theme.green }]}><Ionicons name="trending-up" size={10}/> 10x in 24h</ThemedText>
                 </View>
                 <View style={styles.memeIcons}>
                    <ThemedText style={{fontSize: 22}}>🪙</ThemedText>
                    <ThemedText style={{fontSize: 22, marginLeft: -12}}>👾</ThemedText>
                 </View>
              </View>
           </View>

           <View style={[styles.walletCard, { backgroundColor: theme.surface, marginLeft: 8 }]}>
              <View style={styles.walletCardHeader}>
                 <ThemedText style={[styles.walletCardTitle, { color: theme.text }]}>Earn</ThemedText>
                 <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
              </View>
              <View style={styles.walletCardMetrics}>
                 <View>
                    <ThemedText style={[styles.walletCardValue, { color: theme.text }]}>9%</ThemedText>
                    <ThemedText style={[styles.walletCardSub, { color: theme.textSecondary }]}>APY</ThemedText>
                 </View>
                 <View style={{alignItems: 'center'}}>
                    <Ionicons name="logo-usd" size={24} color="#2775ca" />
                    <ThemedText style={[styles.walletCardSub, { color: theme.textSecondary, fontSize: 10 }]}>USDC</ThemedText>
                 </View>
              </View>
           </View>
        </View>

        {/* Trending Section */}
        <View style={[styles.trendingSection, { backgroundColor: theme.surface }]}>
           <View style={styles.trendingTabs}>
              <MaterialCommunityIcons name="star" size={22} color={theme.textSecondary} style={{marginRight: 24}} />
              {['Holdings', 'Trending', 'Securities'].map((tab, i) => (
                <ThemedText key={tab} style={[
                   styles.trendingTab,
                   i === 1 ? [styles.trendingTabActive, { color: theme.text }] : { color: theme.textSecondary }
                ]}>{tab}</ThemedText>
              ))}
           </View>

           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={[styles.filterChip, { backgroundColor: theme.surfaceHighlight }]}>
                 <Ionicons name="globe-outline" size={14} color={theme.text} />
                 <ThemedText style={[styles.filterTextActive, { color: theme.text, marginLeft: 4 }]}>All</ThemedText>
              </View>
              {['BSC', 'Solana', 'Ethereum', 'Base'].map(f => (
                 <ThemedText key={f} style={[styles.filterText, { color: theme.textSecondary }]}>{f}</ThemedText>
              ))}
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 16}}>
                 <ThemedText style={[styles.filterTextActive, { color: theme.text }]}>1h</ThemedText>
                 <MaterialCommunityIcons name="menu-down" size={16} color={theme.text} />
              </View>
           </ScrollView>

           {/* Trending List */}
           {[
              {name: 'TRADOOR', sub: '$2.12M', sub2: '$496.2M', price: '$8.30', chg: '+7.46%', color: theme.green, tag: '@(V)x4'},
              {name: 'RAVE', sub: '$1.26M', sub2: '$36.5M', price: '$1.12', chg: '-1.65%', color: theme.red, tag: '@'},
              {name: '哈基米', sub: '$570K', sub2: '$20.8M', price: '$0.02', chg: '-11.44%', color: theme.red, tag: '@✋'},
              {name: 'OPG', sub: '$1.53M', sub2: '$13.8M', price: '$0.39', chg: '+3%', color: theme.green, tag: '@(V)x4'},
              {name: 'MTGA', sub: '$1.50M', sub2: '$1.4M', price: '$0.001', chg: '-68.58%', color: theme.red, tag: '💊💳'},
           ].map(t => (
              <View key={t.name} style={styles.trendingItem}>
                 <View style={styles.trendAvatar}><Ionicons name="ellipse" size={32} color={t.color} /></View>
                 <View style={{flex: 1, marginLeft: 12}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                       <ThemedText style={[styles.trendName, { color: theme.text }]}>{t.name}</ThemedText>
                       <ThemedText style={[styles.trendTag, { color: theme.yellow }]}>{t.tag}</ThemedText>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                       <ThemedText style={[styles.trendSub, { color: theme.textSecondary, marginRight: 8 }]}>{t.sub}</ThemedText>
                       <ThemedText style={[styles.trendSub, { color: theme.textSecondary }]}>{t.sub2}</ThemedText>
                    </View>
                 </View>
                 <View style={{alignItems: 'flex-end'}}>
                    <ThemedText style={[styles.trendPrice, { color: theme.text }]}>{t.price}</ThemedText>
                    <ThemedText style={[styles.trendChg, { color: t.color }]}>{t.chg}</ThemedText>
                 </View>
              </View>
           ))}
           
           <ThemedText style={[styles.viewMore, { color: theme.textSecondary }]}>View More</ThemedText>
           
           {/* Market Spotlight */}
           <ThemedText style={[styles.spotlightTitle, { color: theme.text }]}>Market Spotlight</ThemedText>
           <View style={styles.spotlightRow}>
              <View style={[styles.spotlightCard, { backgroundColor: theme.surfaceHighlight }]}>
                 <ThemedText style={[styles.spotlightHeader, { color: theme.text }]}>Pre-IPO</ThemedText>
                 <ThemedText style={[styles.spotlightChg, { color: theme.green }]}>0.64% ^</ThemedText>
                 <View style={styles.spotlightItem}>
                    <Ionicons name="options" size={14} color={theme.green} />
                    <ThemedText style={[styles.spotlightName, { color: theme.textSecondary }]}>OPENAI</ThemedText>
                 </View>
                 <ThemedText style={[styles.spotlightSubChg, { color: theme.green }]}>+9%</ThemedText>
              </View>
              <View style={[styles.spotlightCard, { backgroundColor: theme.surfaceHighlight }]}>
                 <ThemedText style={[styles.spotlightHeader, { color: theme.text }]}>Metals</ThemedText>
                 <ThemedText style={[styles.spotlightChg, { color: theme.green }]}>1.53% ^</ThemedText>
                 <View style={styles.spotlightItem}>
                    <Ionicons name="remove-circle" size={14} color="#f27059" />
                    <ThemedText style={[styles.spotlightName, { color: theme.textSecondary }]}>SLVOn</ThemedText>
                 </View>
                 <ThemedText style={[styles.spotlightSubChg, { color: theme.green }]}>+2.75%</ThemedText>
              </View>
              <View style={[styles.spotlightCard, { backgroundColor: theme.surfaceHighlight }]}>
                 <ThemedText style={[styles.spotlightHeader, { color: theme.text }]}>Hanzi Me...</ThemedText>
                 <ThemedText style={[styles.spotlightChg, { color: theme.red }]}>9.9% v</ThemedText>
                 <View style={styles.spotlightItem}>
                    <ThemedText style={{fontSize: 12}}>🐰</ThemedText>
                    <ThemedText style={[styles.spotlightName, { color: theme.textSecondary }]}>玉免</ThemedText>
                 </View>
                 <ThemedText style={[styles.spotlightSubChg, { color: theme.green }]}>+297.56%</ThemedText>
              </View>
           </View>

        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  hamburger: {
    width: 32,
    height: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleActive: {
  },
  toggleTextActive: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextInactive: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    width: 64,
    justifyContent: 'flex-end',
  },
  iconButton: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  walletSearchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  walletBalanceContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  walletTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitleText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  walletAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletAmount: {
    fontSize: 40,
    fontWeight: '700',
  },
  receiveButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  receiveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletSubAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  walletSubAmount: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  walletActionItem: {
    alignItems: 'center',
  },
  walletActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletActionText: {
    fontSize: 12,
  },
  perpBanner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  perpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 8,
  },
  perpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  perpIconContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  walletCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  walletCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  walletCardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  walletCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  walletCardSub: {
    fontSize: 12,
  },
  memeIcons: {
    flexDirection: 'row',
  },
  trendingSection: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  trendingTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendingTab: {
    fontSize: 16,
    marginRight: 24,
    fontWeight: '500',
  },
  trendingTabActive: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
  },
  filterTextActive: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterText: {
    fontSize: 13,
    marginRight: 16,
    alignSelf: 'center',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  trendAvatar: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendTag: {
    fontSize: 12,
    marginLeft: 6,
  },
  trendSub: {
    fontSize: 12,
    marginTop: 2,
  },
  trendPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  trendChg: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'right',
  },
  viewMore: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
    marginBottom: 16,
  },
  spotlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  spotlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spotlightCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  spotlightHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  spotlightChg: {
    fontSize: 12,
    marginBottom: 12,
  },
  spotlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotlightName: {
    fontSize: 12,
    marginLeft: 4,
  },
  spotlightSubChg: {
    fontSize: 12,
  },
});
