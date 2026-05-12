import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssetsLayout() {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }} />
        </SafeAreaView>
    );
}