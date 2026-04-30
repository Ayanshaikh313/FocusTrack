// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, 
         StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuthStore();

  const handleLogin = async () => {
    try {
      setError('');
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError('Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FocusTrack</Text>
      <Text style={styles.subtitle}>Take back your time</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Sign In</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', color: '#6c63ff' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#888', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
           padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#6c63ff', borderRadius: 12,
            padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#6c63ff', fontSize: 14 },
  error: { color: 'red', textAlign: 'center', marginBottom: 12 },
});