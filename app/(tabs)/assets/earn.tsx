import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AssetsHeader } from '@/components/AssetsHeader';

export default function EarnScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AssetsHeader />
        <View style={styles.content}>
          <ThemedText style={{ color: theme.textSecondary }}>Earn Account Details</ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, alignItems: 'center', paddingTop: 40 },
});
