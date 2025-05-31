import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CriarPost from '@/components/CriarPostModal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '../components/Header';

export default function CriarPostScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();

  const handleSubmit = (data: {
    titulo: string;
    descricao: string;
    imagem?: string;
    link?: string;
  }) => {
    // Implementar lógica para salvar o post
    console.log('Novo post:', data);
    // Aqui você pode adicionar a lógica para salvar o post no Firebase
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      
      <Header  />
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.createButton, { 
            borderColor: colors.border,
            backgroundColor: colors.background50
          }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={64} color={colors.primary} />
          <Text style={[styles.createText, { color: colors.textPrimary }]}>Criar nova publicação</Text>
        </TouchableOpacity>
      </View>

      <CriarPost 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    width: '100%',
  },
  createText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 