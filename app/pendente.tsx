import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PendenteScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>  
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={24} color="#8B4513" />
      </TouchableOpacity>
      
      <View style={styles.iconContainer}>
        <LottieView
          source={require('../assets/animations/clockAnimation.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
          speed={0.3}
        />
      </View>
      <Text style={[styles.title, { color: colors.primary }]}>Cadastro em Análise</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Seu cadastro está sendo analisado pela nossa equipe. Você receberá um e-mail assim que for aprovado.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
}); 