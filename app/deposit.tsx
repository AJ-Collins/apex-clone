import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDepositStore } from '@/store/depositStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CURRENCIES = ['USDT', 'BTC', 'ETH', 'SOL'];

export default function DepositScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [currency, setCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const { address, loading, submitting, error, getAddress, confirmDeposit } = useDepositStore();
  const { fetchPortfolio } = usePortfolioStore();

  const handleNext = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    await getAddress(currency);
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!txHash) {
      alert('Please provide the transaction hash');
      return;
    }
    const res = await confirmDeposit({
      currency,
      amount: Number(amount),
      txHash,
      network: address?.network || '',
    });
    if (res.success) {
      alert('Deposit confirmed! Waiting for admin approval.');
      fetchPortfolio();
      router.back();
    } else {
      alert(res.error || 'Failed to confirm deposit');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.surfaceHighlight, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Deposit Crypto</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 ? (
          <>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Select Coin</ThemedText>
            <View style={styles.currencyRow}>
              {CURRENCIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.currencyChip, {
                    backgroundColor: currency === c ? theme.yellow : theme.surface,
                  }]}
                  onPress={() => setCurrency(c)}
                >
                  <ThemedText style={{ color: currency === c ? '#000' : theme.text, fontWeight: 'bold' }}>{c}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: 24 }]}>Amount to Deposit</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <ThemedText style={[styles.currencyText, { color: theme.text }]}>{currency}</ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.yellow, marginTop: 40 }]}
              onPress={handleNext}
            >
              <ThemedText style={styles.primaryButtonText}>Next</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {loading ? (
              <ActivityIndicator size="large" color={theme.yellow} style={{ marginTop: 40 }} />
            ) : error ? (
              <ThemedText style={{ color: theme.red, textAlign: 'center', marginTop: 40 }}>{error}</ThemedText>
            ) : address ? (
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Deposit Details</ThemedText>

                <View style={styles.detailRow}>
                  <ThemedText style={{ color: theme.textSecondary }}>Network</ThemedText>
                  <ThemedText style={{ color: theme.text, fontWeight: 'bold' }}>{address.network}</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <ThemedText style={{ color: theme.textSecondary }}>Amount</ThemedText>
                  <ThemedText style={{ color: theme.green, fontWeight: 'bold' }}>{amount} {currency}</ThemedText>
                </View>

                <View style={styles.addressBox}>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Deposit Address</ThemedText>
                  <ThemedText style={{ color: theme.text, fontFamily: 'monospace', fontSize: 13 }} selectable>
                    {address.address}
                  </ThemedText>
                </View>

                <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: 24 }]}>Transaction Hash (Required)</ThemedText>
                <TextInput
                  style={[styles.inputContainer, styles.input, { backgroundColor: theme.background, color: theme.text, fontSize: 14 }]}
                  placeholder="Paste TxHash after sending..."
                  placeholderTextColor={theme.textSecondary}
                  value={txHash}
                  onChangeText={setTxHash}
                />

                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.yellow, marginTop: 24 }]}
                  onPress={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>I have Paid</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </>
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
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  currencyRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  currencyChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 24, fontWeight: 'bold' },
  currencyText: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  primaryButton: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  card: { borderRadius: 16, padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  addressBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, marginTop: 8 },
});
