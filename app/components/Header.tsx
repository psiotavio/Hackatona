import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import logoLight from '../../assets/images/logos/logoLight.png';
import logoBrown from '../../assets/images/logos/Logo-Brown.png';

interface HeaderProps {
  title?: string;
  pontos?: number;
  maximoPontosPorDia?: number;
}

const Header: React.FC<HeaderProps> = ({ title, pontos, maximoPontosPorDia }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}> 
      <Image
        source={colors.background === '#2C1810' ? logoLight : logoBrown}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.titlePrimary }]}>{title}</Text>
      </View>
      {typeof pontos === 'number' && (
        <View style={[styles.pointsContainer, { backgroundColor: colors.background50 }]}> 
          <Text style={[styles.pointsText, { color: colors.textPrimary }]}> 
            {pontos.toLocaleString()} pts
          </Text>
          {typeof maximoPontosPorDia === 'number' && (
            <Text style={[styles.maximoDiarioTexto, { color: colors.textSecondary }]}> 
              Máx: <Text style={{ color: colors.success, fontWeight: 'bold' }}>{maximoPontosPorDia.toLocaleString()} pts</Text>
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  maximoDiarioTexto: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default Header; 