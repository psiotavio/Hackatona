import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const { colors, currentTheme } = useTheme();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>  
      {/* Logo centralizada */}
      <Image source={ currentTheme === 'dark' ? require('../assets/images/logos/logoVertical-light.png') : require('../assets/images/logos/logoVertical-Brown.png')} style={styles.logo} resizeMode="contain" />

      {/* Nome do app */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bem-vindo! Entre ou crie sua conta para começar.</Text>

      <View style={styles.buttonGroup}>
        {/* Botão Login */}
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            styles.buttonFilled,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }
          ]}
          onPress={handleLogin}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>Fazer Login</Text>
        </Pressable>
        {/* Botão Criar Conta */}
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            styles.buttonOutlined,
            { borderColor: colors.primary, opacity: pressed ? 0.85 : 1 }
          ]}
          onPress={handleRegister}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Criar Conta</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    marginBottom: 36,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  buttonGroup: {
    width: '100%',
    gap: 18,
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    minWidth: 180,
    marginBottom: 0,
  },
  buttonFilled: {
    backgroundColor: '#583101',
  },
  buttonOutlined: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
