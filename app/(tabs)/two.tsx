import React from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function TabTwoScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.titlePrimary }]}>Exemplos de UI</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.titleSecondary }]}>Campos de Texto</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background50,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Digite algo..."
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.titleSecondary }]}>Cards</Text>
          <View style={[styles.card, { backgroundColor: colors.background50 }]}>
            <Text style={[styles.cardTitle, { color: colors.titlePrimary }]}>Card Principal</Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Este é um exemplo de card usando as cores do tema.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.titleSecondary }]}>Destaques</Text>
          <View style={[styles.highlightBox, { backgroundColor: colors.highlight }]}>
            <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
              Área de Destaque
            </Text>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  highlightBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 18,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
});
