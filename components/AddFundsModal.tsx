import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { ThemedText } from './themed-text';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AddFundsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AddFundsModal({ isVisible, onClose }: AddFundsModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
              {/* Handle Bar */}
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: theme.surfaceHighlight }]} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <ThemedText style={[styles.title, { color: theme.text }]}>Add Funds</ThemedText>
                <View style={styles.currencySelector}>
                  <View style={styles.currencyIcon}>
                    <ThemedText style={styles.currencyIconText}>USD</ThemedText>
                  </View>
                  <ThemedText style={[styles.currencyText, { color: theme.text }]}>KES</ThemedText>
                  <MaterialCommunityIcons name="menu-down" size={20} color={theme.textSecondary} />
                </View>
              </View>

              {/* List Items */}
              <View style={styles.optionsList}>
                {/* Item 1: P2P Trading */}
                <TouchableOpacity style={[styles.optionCard, { borderColor: theme.surfaceHighlight, backgroundColor: theme.background }]}>
                  <View style={styles.optionIconContainer}>
                     <Ionicons name="people-outline" size={24} color={theme.text} />
                  </View>
                  <View style={styles.optionTextContainer}>
                     <ThemedText style={[styles.optionTitle, { color: theme.text }]}>P2P Trading</ThemedText>
                     <ThemedText style={[styles.optionSub, { color: theme.textSecondary }]}>Bank Transfer, Digital Wallet Transfer, Mobile Payment and more</ThemedText>
                  </View>
                </TouchableOpacity>

                {/* Item 2: On-Chain Deposit */}
                <TouchableOpacity style={[styles.optionCard, { borderColor: theme.surfaceHighlight, backgroundColor: theme.background }]}>
                  <View style={styles.optionIconContainer}>
                     <Ionicons name="download-outline" size={24} color={theme.text} />
                  </View>
                  <View style={styles.optionTextContainer}>
                     <ThemedText style={[styles.optionTitle, { color: theme.text }]}>On-Chain Deposit</ThemedText>
                     <ThemedText style={[styles.optionSub, { color: theme.textSecondary }]}>Deposit crypto from other exchanges/wallets to Binance</ThemedText>
                  </View>
                </TouchableOpacity>

                {/* Expanded Items */}
                {isExpanded && (
                  <>
                    {/* Item 3: Buy with KES */}
                    <TouchableOpacity style={[styles.optionCard, { borderColor: theme.surfaceHighlight, backgroundColor: theme.background }]}>
                      <View style={styles.optionIconContainer}>
                         <Ionicons name="wallet-outline" size={24} color={theme.text} />
                      </View>
                      <View style={styles.optionTextContainer}>
                         <ThemedText style={[styles.optionTitle, { color: theme.text }]}>Buy with KES</ThemedText>
                         <ThemedText style={[styles.optionSub, { color: theme.textSecondary }]}>Embrace the variety of payment methods!</ThemedText>
                      </View>
                    </TouchableOpacity>

                    {/* Item 4: Receive via Binance Pay */}
                    <TouchableOpacity style={[styles.optionCard, { borderColor: theme.surfaceHighlight, backgroundColor: theme.background }]}>
                      <View style={styles.optionIconContainer}>
                         <MaterialCommunityIcons name="hand-coin-outline" size={24} color={theme.text} />
                      </View>
                      <View style={styles.optionTextContainer}>
                         <ThemedText style={[styles.optionTitle, { color: theme.text }]}>Receive via Binance Pay</ThemedText>
                         <ThemedText style={[styles.optionSub, { color: theme.textSecondary }]}>Receive crypto from other Binance users.</ThemedText>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* View More / Less Toggle */}
              <TouchableOpacity style={styles.toggleButton} onPress={toggleExpand}>
                <ThemedText style={[styles.toggleText, { color: theme.textSecondary }]}>
                  {isExpanded ? 'View Less' : 'View More'}
                </ThemedText>
                <MaterialCommunityIcons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
              
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    minHeight: '40%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#02c076', // specific green from screenshot
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  currencyIconText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  toggleText: {
    fontSize: 13,
    marginRight: 4,
  },
});
