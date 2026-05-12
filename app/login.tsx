import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      setErrorMsg('Login failed. Please check your credentials.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Log in</ThemedText>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Email</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderBottomColor: theme.surfaceHighlight }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Password</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderBottomColor: theme.surfaceHighlight }]}
            placeholder="Enter your password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[
            styles.loginBtn,
            { backgroundColor: email && password ? theme.yellow : theme.surfaceHighlight }
          ]}
          onPress={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <ThemedText style={[styles.loginBtnText, { color: email && password ? '#000' : theme.textSecondary }]}>
              Log In
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    lineHeight: 38,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  loginBtn: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(240, 75, 90, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#F04B5A',
    fontSize: 14,
  },
});
