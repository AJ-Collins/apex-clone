import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';

const COINS = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', color: '#f7931a', logo: 'btc' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', color: '#627eea', icon: 'ethereum' },
  { id: 'USDT-TRC20', name: 'Tether', symbol: 'USDT', color: '#26a17b', logo: 'usdt' },
  { id: 'BNB', name: 'BNB', symbol: 'BNB', color: '#f3ba2f', logo: 'bnb' },
  { id: 'OG', name: 'OG', symbol: 'OG', color: '#9b59b6', icon: 'infinity' },
  { id: '1000CAT', name: '1000*Simons Cat', symbol: '1000CAT', color: '#e74c3c', icon: 'cat' },
  { id: '1000CHEEMS', name: '1000*cheems.pet', symbol: '1000CHEEMS', color: '#d35400', icon: 'dog' },
  { id: '1000PEPPER', name: 'PEPPER', symbol: '1000PEPPER', color: '#27ae60', icon: 'leaf', status: 'Suspended' },
  { id: '1000SATS', name: '1000*SATS (Ordinals)', symbol: '1000SATS', color: '#f39c12', icon: 'stairs' },
  { id: '1INCH', name: '1inch', symbol: '1INCH', color: '#2c3e50', icon: 'unicorn-variant' },
  { id: 'ERN', name: 'Ethernity Chain', symbol: 'ERN', color: '#000000', icon: 'infinity', status: 'Suspended' },
  { id: 'ETC', name: 'Ethereum Classic', symbol: 'ETC', color: '#2ecc71', icon: 'ethereum' },
  { id: 'ETHFI', name: 'ether.fi', symbol: 'ETHFI', color: '#9b59b6', icon: 'transit-connection-variant' },
  { id: 'ETHW', name: 'Ethereum PoW', symbol: 'ETHW', color: '#8e44ad', icon: 'ethereum' },
  { id: 'KATETH', name: 'ETH on KATANA', symbol: 'KATETH', color: '#ecf0f1', icon: 'circle', status: 'Suspended' },
  { id: 'NEIRO', name: 'First Neiro On Ethereum', symbol: 'NEIRO', color: '#f1c40f', icon: 'dog' },
  { id: 'USDE', name: 'USD Ethena', symbol: 'USDE', color: '#34495e', icon: 'currency-usd' },
  { id: 'VTHO', name: 'VeThor Token', symbol: 'VTHO', color: '#9b59b6', icon: 'flash' },
  { id: 'WBETH', name: 'Wrapped Beacon ETH (WBETH)', symbol: 'WBETH', color: '#f1c40f', icon: 'ethereum' },
  { id: 'WETH', name: 'Wrapped Ether', symbol: 'WETH', color: '#000000', icon: 'ethereum' },
  { id: 'XAUT', name: 'Tether Gold', symbol: 'XAUT', color: '#f1c40f', icon: 'gold' },
];



const ALPHABET = [
  '0', '1', '2', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'
];

export default function SelectCoinScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const [search, setSearch] = useState('');

  const renderCoinItem = ({ item }: { item: typeof COINS[0] }) => (
    <TouchableOpacity
      style={styles.coinItem}
      onPress={() => {
        if (action === 'withdraw') {
          router.push(`/withdraw/${item.id}` as any);
        } else {
          router.push(`/deposit/${item.id}` as any);
        }
      }}
    >
      <View style={[styles.coinIcon, { backgroundColor: item.color }]}>
        {item.logo ? (
          <SvgUri
            width={20}
            height={20}
            uri={`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/white/${item.logo}.svg`}
          />
        ) : (
          <MaterialCommunityIcons name={item.icon as any} size={24} color="#fff" />
        )}
      </View>
      <View style={styles.coinInfo}>
        <ThemedText type="bold" style={styles.coinSymbol}>{item.symbol}</ThemedText>
        <ThemedText style={[styles.coinName, { color: theme.textSecondary }]}>{item.name}</ThemedText>
      </View>
      {item.status && (
        <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>{item.status}</ThemedText>
      )}
    </TouchableOpacity>
  );

  const filteredCoins = search.trim() === ''
    ? COINS
    : COINS.filter(coin =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="bold" style={styles.headerTitle}>Select Coin</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search Coins"
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearIcon}>
              <Ionicons name="close" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {search.trim() === '' && (
            <>
              {/* HISTORY */}
              <View style={styles.sectionHeader}>
                <ThemedText type="bold" style={styles.sectionTitle}>History</ThemedText>
                <TouchableOpacity>
                  <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.historyContainer}>
                <TouchableOpacity style={[styles.historyChip, { backgroundColor: theme.surface }]}>
                  <ThemedText style={styles.historyChipText}>ETH</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.historyChip, { backgroundColor: theme.surface }]}>
                  <ThemedText style={styles.historyChipText}>BTC</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.historyChip, { backgroundColor: theme.surface }]}>
                  <ThemedText style={styles.historyChipText}>BNB</ThemedText>
                </TouchableOpacity>
              </View>

              {/* TRENDING */}
              <View style={styles.sectionHeader}>
                <ThemedText type="bold" style={styles.sectionTitle}>Trending</ThemedText>
              </View>
            </>
          )}

          {filteredCoins.map((coin) => (
            <React.Fragment key={coin.id}>
              {renderCoinItem({ item: coin })}
            </React.Fragment>
          ))}
        </ScrollView>

        {/* ALPHABET INDEX */}
        {search.trim() === '' && (
          <View style={styles.alphabetIndex}>
            {ALPHABET.map((letter) => (
              <TouchableOpacity key={letter} style={styles.alphabetLetter}>
                <ThemedText style={[styles.alphabetText, { color: theme.textSecondary }]}>
                  {letter}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
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
    height: 56,
  },
  headerTitle: {
    fontSize: 20,
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  historyContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
  },
  historyChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coinInfo: {
    flex: 1,
  },
  coinSymbol: {
    fontSize: 16,
    marginBottom: 2,
  },
  coinName: {
    fontSize: 13,
  },
  statusText: {
    fontSize: 12,
  },
  alphabetIndex: {
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  alphabetLetter: {
    height: 18,
    justifyContent: 'center',
  },
  alphabetText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
