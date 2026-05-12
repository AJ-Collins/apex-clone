import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransferScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [fromWallet, setFromWallet] = useState('Funding');
  const [toWallet, setToWallet] = useState('Spot Wallet');
  const [amount, setAmount] = useState('');
  const [coin] = useState({ id: 'OG', name: 'OG', icon: 'infinity' });
  const [availableBalance] = useState(0.015);

  const handleSwap = () => {
    setFromWallet(toWallet);
    setToWallet(fromWallet);
  };

  const isInvalid = parseFloat(amount || '0') > availableBalance || parseFloat(amount || '0') === 0;
  const showErrorMessage = parseFloat(amount || '0') > 0 && isInvalid;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="bold" style={styles.headerTitle}>Transfer</ThemedText>
        <TouchableOpacity style={styles.historyButton}>
          <MaterialCommunityIcons name="clock-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* FROM/TO BOX */}
          <View style={[styles.transferBox, { backgroundColor: theme.surface || '#1e2329' }]}>
            <View style={styles.transferRow}>
              <ThemedText style={[styles.labelSide, { color: theme.textSecondary }]}>From</ThemedText>
              <TouchableOpacity style={styles.walletPicker}>
                <ThemedText type="bold" style={styles.walletName}>{fromWallet}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.line, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

            <View style={styles.transferRow}>
              <ThemedText style={[styles.labelSide, { color: theme.textSecondary }]}>To</ThemedText>
              <TouchableOpacity style={styles.walletPicker}>
                <ThemedText type="bold" style={styles.walletName}>{toWallet}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSwap} style={styles.swapButton}>
              <MaterialCommunityIcons name="swap-vertical" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* COIN SELECTOR */}
          <View style={styles.section}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Coin</ThemedText>
            <TouchableOpacity style={[styles.coinSelector, { backgroundColor: theme.surfaceHighlight || '#2b3139' }]}>
              <View style={styles.coinIconWrapper}>
                <View style={[styles.coinIcon, { backgroundColor: '#9b59b6' }]}>
                  <MaterialCommunityIcons name={coin.icon as any} size={14} color="#fff" />
                </View>
                <ThemedText type="bold" style={styles.coinName}>{coin.name}</ThemedText>
                <ThemedText style={[styles.coinSubtitle, { color: theme.textSecondary }]}>{coin.name}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* AMOUNT */}
          <View style={styles.section}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Amount</ThemedText>
            <View style={[styles.amountInputContainer, { backgroundColor: theme.surfaceHighlight || '#2b3139' }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.amountActions}>
                <ThemedText type="bold" style={styles.currencySuffix}>{coin.name}</ThemedText>
                <View style={[styles.verticalDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <TouchableOpacity onPress={() => setAmount(availableBalance.toString())}>
                  <ThemedText style={{ color: theme.yellow, fontWeight: 'bold' }}>Max</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <ThemedText style={[styles.availableText, { color: theme.textSecondary }]}>
              Available {availableBalance} {coin.name}
            </ThemedText>

            {showErrorMessage && (
              <ThemedText style={styles.errorText}>
                No amount available to transfer, please select another coin.
              </ThemedText>
            )}
          </View>
        </ScrollView>

        {/* FOOTER BUTTON */}
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={isInvalid}
            style={[
              styles.confirmButton,
              { backgroundColor: isInvalid ? theme.surfaceHighlight || '#2b3139' : theme.yellow },
            ]}
          >
            <ThemedText
              style={[
                styles.confirmButtonText,
                { color: isInvalid ? theme.textSecondary : '#000' },
              ]}
            >
              Confirm Transfer
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 18,
  },
  backButton: {
    padding: 4,
  },
  historyButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  transferBox: {
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    marginBottom: 24,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelSide: {
    width: 50,
    fontSize: 14,
  },
  walletPicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletName: {
    fontSize: 16,
  },
  line: {
    height: 1,
    marginLeft: 50,
    marginVertical: 4,
  },
  swapButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  coinSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
  },
  coinIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  coinName: {
    fontSize: 16,
    marginRight: 6,
  },
  coinSubtitle: {
    fontSize: 13,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySuffix: {
    fontSize: 14,
    marginRight: 12,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    marginRight: 12,
  },
  availableText: {
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#f6465d',
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 40,
  },
  confirmButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
