import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function PendenteScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>  
      <View style={styles.iconContainer}>
        <LottieView
          source={require('../assets/animations/clockAnimation.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
          speed={0.3}
        />
      </View>
      <Text style={[styles.text, { color: colors.primary }]}>Pendente</Text>
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
  iconContainer: {
    marginBottom: 24,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 