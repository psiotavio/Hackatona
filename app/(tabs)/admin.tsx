import React, { useState } from 'react';
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

// Função para gerar avatar com as iniciais do nome
const getAvatarUri = (name) => {
  const formattedName = encodeURIComponent(name);
  return { uri: `https://ui-avatars.com/api/?name=${formattedName}&background=8B4513&color=fff` };
};

// Lista de projetos fictícios
const PROJETOS = [
  { id: '1', nome: 'App Mobile' },
  { id: '2', nome: 'Portal Web' },
  { id: '3', nome: 'Sistema Interno' },
  { id: '4', nome: 'API de Integração' },
  { id: '5', nome: 'Dashboard BI' },
];

// Dados fictícios para solicitações de cadastro
const SOLICITACOES_INICIAIS = [
  {
    id: '1',
    nome: 'Carlos Silva',
    email: 'carlos.silva@empresa.com',
    cargo: 'Desenvolvedor Frontend',
    avatar: getAvatarUri('Carlos Silva'),
    dataSolicitacao: '12/06/2023',
    empresa: 'Tech Solutions',
    status: 'pendente',
  },
  {
    id: '2',
    nome: 'Ana Beatriz',
    email: 'ana.beatriz@empresa.com',
    cargo: 'UX Designer',
    avatar: getAvatarUri('Ana Beatriz'),
    dataSolicitacao: '14/06/2023',
    empresa: 'Tech Solutions',
    status: 'pendente',
  },
  {
    id: '3',
    nome: 'Marcelo Santos',
    email: 'marcelo.santos@empresa.com',
    cargo: 'Desenvolvedor Backend',
    avatar: getAvatarUri('Marcelo Santos'),
    dataSolicitacao: '15/06/2023',
    empresa: 'Cloud Systems',
    status: 'pendente',
  },
  {
    id: '4',
    nome: 'Juliana Costa',
    email: 'juliana.costa@empresa.com',
    cargo: 'Gerente de Produto',
    avatar: getAvatarUri('Juliana Costa'),
    dataSolicitacao: '16/06/2023',
    empresa: 'Future Labs',
    status: 'pendente',
  },
  {
    id: '5',
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@empresa.com',
    cargo: 'DevOps Engineer',
    avatar: getAvatarUri('Roberto Almeida'),
    dataSolicitacao: '18/06/2023',
    empresa: 'Innovate Inc',
    status: 'pendente',
  },
];

export default function AdminScreen() {
  const [solicitacoes, setSolicitacoes] = useState(SOLICITACOES_INICIAIS);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState('funcionario');
  const [projetosSelecionados, setProjetosSelecionados] = useState({});
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const verificarStatus = () => {
    router.push('/pendente');
  };

  // Função para lidar com a aprovação de um usuário
  const handleAprovar = (usuario) => {
    setUsuarioSelecionado(usuario);
    setTipoUsuario('funcionario');
    setProjetosSelecionados({});
    setModalVisible(true);
  };

  // Função para lidar com a recusa de um usuário
  const handleRecusar = (usuario) => {
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
          onPress: () => {
            setSolicitacoes(prev => 
              prev.map(s => 
                s.id === usuario.id 
                  ? { ...s, status: 'recusado' } 
                  : s
              )
            );
            Alert.alert('Solicitação recusada', `A solicitação de ${usuario.nome} foi recusada.`);
          },
        },
      ]
    );
  };

  // Função para confirmar a aprovação de um usuário
  const confirmarAprovacao = () => {
    if (!usuarioSelecionado) return;

    const projetoIds = Object.keys(projetosSelecionados)
      .filter(id => projetosSelecionados[id]);

    if (projetoIds.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um projeto');
      return;
    }

    // Atualiza o status da solicitação para 'aprovado'
    setSolicitacoes(prev => 
      prev.map(s => 
        s.id === usuarioSelecionado.id 
          ? { 
              ...s, 
              status: 'aprovado', 
              tipoUsuario, 
              projetos: projetoIds.map(id => 
                PROJETOS.find(p => p.id === id)
              )
            } 
          : s
      )
    );

    // Exibe mensagem de confirmação
    const tipoTexto = {
      'funcionario': 'Funcionário',
      'lider': 'Líder de Projeto',
      'admin': 'Administrador'
    };

    Alert.alert(
      'Solicitação aprovada', 
      `${usuarioSelecionado.nome} foi aprovado como ${tipoTexto[tipoUsuario]} e vinculado a ${projetoIds.length} projeto(s).`
    );

    // Fecha o modal
    setModalVisible(false);
  };

  // Função para lidar com a seleção de um projeto
  const toggleProjeto = (projetoId) => {
    setProjetosSelecionados(prev => ({
      ...prev,
      [projetoId]: !prev[projetoId]
    }));
  };

  // Renderiza um item da lista de solicitações
  const renderSolicitacao = ({ item }) => (
    <View style={[
      styles.solicitacaoContainer,
      item.status === 'aprovado' && styles.solicitacaoAprovada,
      item.status === 'recusado' && styles.solicitacaoRecusada
    ]}>
      <View style={styles.solicitacaoHeader}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.solicitacaoInfo}>
          <Text style={styles.solicitacaoNome}>{item.nome}</Text>
          <Text style={styles.solicitacaoCargo}>{item.cargo}</Text>
          <Text style={styles.solicitacaoEmpresa}>{item.empresa}</Text>
        </View>
      </View>
      
      <View style={styles.solicitacaoDetalhes}>
        <Text style={styles.solicitacaoEmail}>{item.email}</Text>
        <Text style={styles.solicitacaoData}>Solicitação: {item.dataSolicitacao}</Text>
        
        {item.status === 'pendente' && (
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
        )}
        
        {item.status === 'aprovado' && (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.statusAprovado}>
              Aprovado como {item.tipoUsuario === 'funcionario' ? 'Funcionário' : 
                item.tipoUsuario === 'lider' ? 'Líder de Projeto' : 'Administrador'}
            </Text>
          </View>
        )}
        
        {item.status === 'recusado' && (
          <View style={styles.statusContainer}>
            <Ionicons name="close-circle" size={20} color="#F44336" />
            <Text style={styles.statusRecusado}>Recusado</Text>
          </View>
        )}
        
        {item.status === 'aprovado' && item.projetos && (
          <View style={styles.projetosContainer}>
            <Text style={styles.projetosTitulo}>Projetos vinculados:</Text>
            {item.projetos.map(projeto => (
              <Text key={projeto.id} style={styles.projetoItem}>• {projeto.nome}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // Renderiza a lista de solicitações separadas por status
  const renderSolicitacoesPorStatus = () => {
    const pendentes = solicitacoes.filter(s => s.status === 'pendente');
    const aprovados = solicitacoes.filter(s => s.status === 'aprovado');
    const recusados = solicitacoes.filter(s => s.status === 'recusado');

    return (
      <>
        {pendentes.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Pendentes de Aprovação ({pendentes.length})</Text>
            <FlatList
              data={pendentes}
              renderItem={renderSolicitacao}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </>
        )}
        
        {aprovados.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Aprovados ({aprovados.length})</Text>
            <FlatList
              data={aprovados}
              renderItem={renderSolicitacao}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </>
        )}
        
        {recusados.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Recusados ({recusados.length})</Text>
            <FlatList
              data={recusados}
              renderItem={renderSolicitacao}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administração</Text>
      </View>
      
      {/* Conteúdo principal */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.conteudo}>
          <Text style={styles.titulo}>Solicitações de Cadastro</Text>
          {renderSolicitacoesPorStatus()}
        </View>
      </ScrollView>
      
      {/* Modal para definir tipo de usuário e projetos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aprovar Solicitação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {usuarioSelecionado && (
              <View style={styles.usuarioInfo}>
                <Image source={usuarioSelecionado.avatar} style={styles.modalAvatar} />
                <View>
                  <Text style={styles.modalNome}>{usuarioSelecionado.nome}</Text>
                  <Text style={styles.modalEmpresa}>{usuarioSelecionado.empresa}</Text>
                </View>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Tipo de Usuário</Text>
            <View style={styles.tipoUsuarioContainer}>
              <TouchableOpacity 
                style={[
                  styles.tipoUsuarioOpcao, 
                  tipoUsuario === 'funcionario' && styles.tipoUsuarioSelecionado
                ]}
                onPress={() => setTipoUsuario('funcionario')}
              >
                <Ionicons 
                  name={tipoUsuario === 'funcionario' ? "person" : "person-outline"} 
                  size={24} 
                  color={tipoUsuario === 'funcionario' ? "#8B4513" : "#666"} 
                />
                <Text 
                  style={[
                    styles.tipoUsuarioTexto,
                    tipoUsuario === 'funcionario' && styles.tipoUsuarioTextoSelecionado
                  ]}
                >
                  Funcionário
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tipoUsuarioOpcao, 
                  tipoUsuario === 'lider' && styles.tipoUsuarioSelecionado
                ]}
                onPress={() => setTipoUsuario('lider')}
              >
                <Ionicons 
                  name={tipoUsuario === 'lider' ? "star" : "star-outline"} 
                  size={24} 
                  color={tipoUsuario === 'lider' ? "#8B4513" : "#666"} 
                />
                <Text 
                  style={[
                    styles.tipoUsuarioTexto,
                    tipoUsuario === 'lider' && styles.tipoUsuarioTextoSelecionado
                  ]}
                >
                  Líder de Projeto
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tipoUsuarioOpcao, 
                  tipoUsuario === 'admin' && styles.tipoUsuarioSelecionado
                ]}
                onPress={() => setTipoUsuario('admin')}
              >
                <Ionicons 
                  name={tipoUsuario === 'admin' ? "shield" : "shield-outline"} 
                  size={24} 
                  color={tipoUsuario === 'admin' ? "#8B4513" : "#666"} 
                />
                <Text 
                  style={[
                    styles.tipoUsuarioTexto,
                    tipoUsuario === 'admin' && styles.tipoUsuarioTextoSelecionado
                  ]}
                >
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Projetos</Text>
            <ScrollView style={styles.projetosScroll}>
              {PROJETOS.map(projeto => (
                <View key={projeto.id} style={styles.projetoRow}>
                  <Text style={styles.projetoNome}>{projeto.nome}</Text>
                  <Switch
                    trackColor={{ false: "#d0d0d0", true: "#d4c2a8" }}
                    thumbColor={projetosSelecionados[projeto.id] ? "#8B4513" : "#f4f3f4"}
                    onValueChange={() => toggleProjeto(projeto.id)}
                    value={!!projetosSelecionados[projeto.id]}
                  />
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.botaoConfirmar}
              onPress={confirmarAprovacao}
            >
              <Text style={styles.botaoConfirmarTexto}>Confirmar Aprovação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6', // Fundo bege claro
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
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  scrollView: {
    flex: 1,
  },
  conteudo: {
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f5efe5',
    padding: 8,
    borderRadius: 4,
  },
  solicitacaoContainer: {
    backgroundColor: '#F2E2CE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  solicitacaoAprovada: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  solicitacaoRecusada: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
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
    color: '#333',
  },
  solicitacaoCargo: {
    fontSize: 14,
    color: '#555',
  },
  solicitacaoEmpresa: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
  },
  solicitacaoDetalhes: {
    borderTopWidth: 1,
    borderTopColor: '#E5D3B3',
    paddingTop: 12,
  },
  solicitacaoEmail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  solicitacaoData: {
    fontSize: 12,
    color: '#777',
    marginBottom: 12,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusAprovado: {
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusRecusado: {
    color: '#F44336',
    marginLeft: 8,
    fontWeight: '500',
  },
  projetosContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 8,
    borderRadius: 4,
  },
  projetosTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  projetoItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5D3B3',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  usuarioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F2E2CE',
    padding: 12,
    borderRadius: 8,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalEmpresa: {
    fontSize: 14,
    color: '#777',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 12,
    marginTop: 8,
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipoUsuarioOpcao: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tipoUsuarioSelecionado: {
    borderColor: '#8B4513',
    backgroundColor: '#F2E2CE',
  },
  tipoUsuarioTexto: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    textAlign: 'center',
  },
  tipoUsuarioTextoSelecionado: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  projetosScroll: {
    maxHeight: 180,
    marginBottom: 16,
  },
  projetoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  projetoNome: {
    fontSize: 16,
    color: '#333',
  },
  botaoConfirmar: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoConfirmarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verificarStatusButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#8B4513',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  verificarStatusText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 