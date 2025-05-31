import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabOneScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const systemColorScheme = useColorScheme();

  const themeOptions = [
    { id: 'light', label: 'Modo Claro', icon: '☀️' },
    { id: 'dark', label: 'Modo Escuro', icon: '🌙' },
    { id: 'system', label: 'Sistema', icon: '🔄', description: `(${systemColorScheme ?? 'light'})` },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.titlePrimary }]}>Configurações de Tema</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escolha como você quer que o aplicativo apareça
        </Text>
      </View>

      <View style={styles.themeOptions}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.themeOption,
              {
                backgroundColor: themeMode === option.id ? colors.primary : colors.background50,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setThemeMode(option.id as 'light' | 'dark' | 'system')}
          >
            <Text style={[styles.themeIcon, { color: colors.textPrimary }]}>{option.icon}</Text>
            <View style={styles.themeTextContainer}>
              <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>{option.label}</Text>
              {option.description && (
                <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.titleSecondary }]}>Cores Primárias</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.primary }]} />
          <View style={[styles.colorBox, { backgroundColor: colors.primary50 }]} />
          <View style={[styles.colorBox, { backgroundColor: colors.primary20 }]} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.titleSecondary }]}>Cores Secundárias</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.secondary }]} />
          <View style={[styles.colorBox, { backgroundColor: colors.secondary50 }]} />
          <View style={[styles.colorBox, { backgroundColor: colors.secondary20 }]} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.titleSecondary }]}>Estados</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBox, { backgroundColor: colors.success }]}>
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>Sucesso</Text>
          </View>
          <View style={[styles.statusBox, { backgroundColor: colors.error }]}>
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>Erro</Text>
          </View>
          <View style={[styles.statusBox, { backgroundColor: colors.warning }]}>
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>Alerta</Text>
          </View>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  themeOptions: {
    padding: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  colorBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontWeight: '600',
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
});
