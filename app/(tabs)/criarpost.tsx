import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CriarPost from '@/components/criarpost';
import { Ionicons } from '@expo/vector-icons';

export default function CriarPostScreen() {
  const [modalVisible, setModalVisible] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Criar Publicação</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={64} color="#8B4513" />
          <Text style={styles.createText}>Criar nova publicação</Text>
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
    backgroundColor: '#FFF5E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5D3B3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
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
    borderColor: '#E5D3B3',
    borderStyle: 'dashed',
    borderRadius: 16,
    width: '100%',
    backgroundColor: 'rgba(242, 226, 206, 0.5)',
  },
  createText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
}); 