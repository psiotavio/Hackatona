import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/services/firebase/firebase.config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/contexts/ThemeContext';

// Função para gerar avatar com as iniciais do nome
const getAvatarUri = (name: string) => {
  const formattedName = encodeURIComponent(name);
  return { uri: `https://ui-avatars.com/api/?name=${formattedName}&background=8B4513&color=fff` };
};

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  avatar: any;
  dataSolicitacao: string;
  empresa: string;
  status: 'pending' | 'approved' | 'rejected';
  empresaId: string;
}

export default function AdminScreen() {
  const [solicitacoes, setSolicitacoes] = useState<Usuario[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Verificar se o usuário é uma empresa
    const verificarTipoUsuario = async () => {
      try {
        const userType = await AsyncStorage.getItem('userType');
        if (userType !== 'empresa') {
          // Redirecionar para a tela inicial se não for empresa
          router.replace('/');
          return;
        }
        
        // Se for empresa, carrega as solicitações
        carregarSolicitacoes();
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error);
        router.replace('/');
      }
    };

    verificarTipoUsuario();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "users"),
        where("tipo", "==", "cliente"),
        where("status", "==", "pending"),
        where("empresaId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const solicitacoesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataSolicitacao: new Date(doc.data().dataCriacao).toLocaleDateString(),
        avatar: getAvatarUri(doc.data().nome)
      })) as Usuario[];

      setSolicitacoes(solicitacoesList);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      Alert.alert("Erro", "Não foi possível carregar as solicitações.");
    }
  };

  const handleAprovar = async (usuario: Usuario) => {
    try {
      await updateDoc(doc(db, "users", usuario.id), {
        status: "approved"
      });

      setSolicitacoes(prev => prev.filter(s => s.id !== usuario.id));
      Alert.alert("Sucesso", `${usuario.nome} foi aprovado com sucesso.`);
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      Alert.alert("Erro", "Não foi possível aprovar o usuário.");
    }
  };

  const handleRecusar = async (usuario: Usuario) => {
    Alert.alert(
      'Recusar solicitação',
      `Tem certeza que deseja recusar a solicitação de ${usuario.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, "users", usuario.id), {
                status: "rejected"
              });

              setSolicitacoes(prev => prev.filter(s => s.id !== usuario.id));
              Alert.alert("Sucesso", `${usuario.nome} foi recusado.`);
            } catch (error) {
              console.error("Erro ao recusar usuário:", error);
              Alert.alert("Erro", "Não foi possível recusar o usuário.");
            }
          },
        },
      ]
    );
  };

  const renderSolicitacao = ({ item }: { item: Usuario }) => (
    <View style={[styles.solicitacaoContainer, { backgroundColor: colors.background50 }]}>
      <View style={styles.solicitacaoHeader}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.solicitacaoInfo}>
          <Text style={[styles.solicitacaoNome, { color: colors.titlePrimary }]}>{item.nome}</Text>
          <Text style={[styles.solicitacaoEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          <Text style={[styles.solicitacaoData, { color: colors.textSecondary }]}>Solicitação: {item.dataSolicitacao}</Text>
        </View>
      </View>
      
      <View style={styles.acaoContainer}>
        <TouchableOpacity 
          style={styles.botaoAprovar}
          onPress={() => handleAprovar(item)}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.botaoTexto}>Aprovar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botaoRecusar}
          onPress={() => handleRecusar(item)}
        >
          <Ionicons name="close-circle-outline" size={22} color="#fff" />
          <Text style={styles.botaoTexto}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#2C1810' ? 'light' : 'dark'} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.titlePrimary }]}>Solicitações Pendentes</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.conteudo}>
          {solicitacoes.length === 0 ? (
            <Text style={[styles.semSolicitacoes, { color: colors.textSecondary }]}>
              Não há solicitações pendentes no momento.
            </Text>
          ) : (
            <FlatList
              data={solicitacoes}
              renderItem={renderSolicitacao}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  conteudo: {
    padding: 16,
  },
  semSolicitacoes: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  solicitacaoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  solicitacaoHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  solicitacaoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  solicitacaoNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  solicitacaoEmail: {
    fontSize: 14,
  },
  solicitacaoData: {
    fontSize: 12,
    marginTop: 4,
  },
  acaoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  botaoAprovar: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  botaoRecusar: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 