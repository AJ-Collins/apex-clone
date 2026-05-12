import { StyleSheet, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useReferralStore } from '@/store/referralStore';

export default function ReferralScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { data, loading, fetchReferrals } = useReferralStore();

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleShare = async () => {
    if (data?.referralLink) {
      await Share.share({
        message: `Join Binance Clone and start trading! Use my referral code: ${data.referralCode}\n${data.referralLink}`,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.surfaceHighlight, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Referral</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading || !data ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ThemedText style={{ color: theme.textSecondary }}>Loading...</ThemedText>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.cardHeader}>
                <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Your Referral Code</ThemedText>
              </View>
              <View style={styles.codeContainer}>
                <ThemedText style={[styles.codeText, { color: theme.yellow }]}>{data.referralCode}</ThemedText>
                <TouchableOpacity onPress={handleShare} style={[styles.shareButton, { backgroundColor: theme.yellow }]}>
                  <ThemedText style={styles.shareText}>Share Link</ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedText style={[styles.descText, { color: theme.textSecondary }]}>
                Share your link to invite friends. You'll both earn rewards!
              </ThemedText>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
                <ThemedText style={[styles.statValue, { color: theme.text }]}>{data.totalReferred}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Friends Invited</ThemedText>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
                <ThemedText style={[styles.statValue, { color: theme.green }]}>
                  ${data.referrals.reduce((sum, r) => sum + r.depositCount, 0) * 10}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Est. Bonus</ThemedText>
              </View>
            </View>

            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Referred Friends</ThemedText>

            {data.referrals.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ThemedText style={{ color: theme.textSecondary }}>No friends invited yet.</ThemedText>
              </View>
            ) : (
              data.referrals.map((ref) => (
                <View key={ref.id} style={[styles.refItem, { backgroundColor: theme.surface }]}>
                  <View style={styles.refLeft}>
                    <View style={styles.avatar}>
                      <ThemedText style={{ color: theme.background, fontWeight: 'bold' }}>{ref.name.substring(0, 2).toUpperCase()}</ThemedText>
                    </View>
                    <View>
                      <ThemedText style={[styles.refName, { color: theme.text }]}>{ref.name}</ThemedText>
                      <ThemedText style={[styles.refDate, { color: theme.textSecondary }]}>{new Date(ref.joinedAt).toLocaleDateString()}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.refRight}>
                    <ThemedText style={[styles.refDepositCount, { color: theme.text }]}>{ref.depositCount} Deposits</ThemedText>
                    {Object.entries(ref.depositsByCurrency).map(([cur, amt]) => (
                      <ThemedText key={cur} style={[styles.refAmount, { color: theme.green }]}>{Number(amt).toFixed(cur === 'BTC' ? 6 : 2)} {cur}</ThemedText>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 20, marginBottom: 16 },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  codeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  codeText: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  shareButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  shareText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  descText: { fontSize: 13, lineHeight: 18 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  refItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  refLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fcd535', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  refName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  refDate: { fontSize: 12 },
  refRight: { alignItems: 'flex-end' },
  refDepositCount: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  refAmount: { fontSize: 12, fontWeight: '500' },
});
