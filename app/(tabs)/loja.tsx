import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image, 
  Dimensions, 
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { db, auth } from '@/services/firebase/firebase.config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  addDoc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { calcularMaximoPontosPorDia, observarPontosUsuario } from '@/services/firebase/fetchMaxPoints';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Interface para tipagem dos produtos
interface Produto {
  id: string;
  nome: string;
  pontos: number;
  desconto: number;
  pontosOriginal: number;
  imagem: string;
  categoria: string;
  condicao: string;
  estoque?: number;
  empresaId?: string;
  nomeEmpresa?: string;
}

// Interface para tipagem do histórico
interface HistoricoItem {
  id: string;
  data: string;
  descricao: string;
  pontos: number;
  tipo: 'ganho' | 'gasto';
}

// Produtos de exemplo para sincronização
const PRODUTOS_EXEMPLO: Omit<Produto, 'id' | 'empresaId' | 'nomeEmpresa'>[] = [
  {
    nome: 'Fone Logitech',
    pontos: 500,
    desconto: 0,
    pontosOriginal: 500,
    imagem: 'https://picsum.photos/200/300',
    categoria: 'Eletrônicos',
    condicao: 'Novo',
    estoque: 10
  },
  {
    nome: 'Teclado Logitech',
    pontos: 400,
    desconto: 0,
    pontosOriginal: 400,
    imagem: 'https://picsum.photos/200/301',
    categoria: 'Eletrônicos',
    condicao: 'Novo',
    estoque: 10
  },
  {
    nome: 'Mousepad',
    pontos: 100,
    desconto: 0,
    pontosOriginal: 100,
    imagem: 'https://picsum.photos/200/302',
    categoria: 'Acessórios',
    condicao: 'Novo',
    estoque: 20
  },
  {
    nome: 'Lápis',
    pontos: 10,
    desconto: 0,
    pontosOriginal: 10,
    imagem: 'https://picsum.photos/200/303',
    categoria: 'Papelaria',
    condicao: 'Novo',
    estoque: 50
  },
  {
    nome: 'Cabo USB',
    pontos: 50,
    desconto: 0,
    pontosOriginal: 50,
    imagem: 'https://picsum.photos/200/304',
    categoria: 'Eletrônicos',
    condicao: 'Novo',
    estoque: 30
  },
];

// Dados de exemplo para o histórico
const HISTORICO: HistoricoItem[] = [
  { 
    id: '1', 
    data: '15/07/2023', 
    descricao: 'Feedback enviado para Equipe A', 
    pontos: 500, 
    tipo: 'ganho' 
  },
  { 
    id: '2', 
    data: '10/07/2023', 
    descricao: 'Feedback recebido da Gerência', 
    pontos: 300, 
    tipo: 'ganho' 
  },
  { 
    id: '3', 
    data: '05/07/2023', 
    descricao: 'Resgate: Powerbank 10000mAh', 
    pontos: 4500, 
    tipo: 'gasto' 
  },
  { 
    id: '4', 
    data: '01/07/2023', 
    descricao: 'Feedback enviado para Equipe B', 
    pontos: 500, 
    tipo: 'ganho' 
  },
  { 
    id: '5', 
    data: '28/06/2023', 
    descricao: 'Feedback enviado para Equipe C', 
    pontos: 500, 
    tipo: 'ganho' 
  },
  { 
    id: '6', 
    data: '20/06/2023', 
    descricao: 'Resgate: Caneca Personalizada', 
    pontos: 1200, 
    tipo: 'gasto' 
  },
];

// Opções de ordenação
const OPCOES_ORDENACAO = [
  { id: 'relevantes', nome: 'mais relevantes' },
  { id: 'menor_preco', nome: 'menor preço' },
  { id: 'maior_preco', nome: 'maior preço' },
  { id: 'maior_desconto', nome: 'maior desconto' },
  { id: 'mais_recentes', nome: 'mais recentes' },
];

const LojaScreen = () => {
  const { colors, currentTheme } = useTheme();
  const [visualizacao, setVisualizacao] = useState('grade'); // 'grade' ou 'lista'
  const [produtosEncontrados, setProdutosEncontrados] = useState(0);
  const [pontos, setPontos] = useState(0); // Pontos do usuário
  const [modalOrdenacaoVisible, setModalOrdenacaoVisible] = useState(false);
  const [modalConfirmacaoVisible, setModalConfirmacaoVisible] = useState(false);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [ordenacaoSelecionada, setOrdenacaoSelecionada] = useState(OPCOES_ORDENACAO[0]);
  const [produtosOrdenados, setProdutosOrdenados] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [maximoPontosPorDia, setMaximoPontosPorDia] = useState<number>(0);

  // Buscar usuário atual e seus pontos
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Buscar dados do usuário
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          
          // Configurar observador de pontos
          const unsubscribe = observarPontosUsuario(user.uid, (novosPontos) => {
            setPontos(novosPontos);
          });

          // Calcular máximo de pontos por dia
          const empresaId = userData.tipo === 'empresa' ? user.uid : userData.empresaId;
          if (empresaId) {
            const maximoDiario = await calcularMaximoPontosPorDia(empresaId);
            setMaximoPontosPorDia(maximoDiario);
          }
        }
        
        // Buscar produtos da loja
        await fetchProdutos();
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setIsLoading(false);
        Alert.alert("Erro", "Não foi possível carregar seus dados.");
      }
    };

    fetchUserData();
  }, []);

  // Buscar produtos da loja
  const fetchProdutos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const empresaId = userData.tipo === 'empresa' ? user.uid : userData.empresaId;

      if (!empresaId) {
        Alert.alert("Erro", "Não foi possível identificar sua empresa.");
        return;
      }

      // Buscar produtos da loja
      const produtosQuery = query(
        collection(db, "loja"),
        where("empresaId", "==", empresaId),
        orderBy("nome")
      );

      const querySnapshot = await getDocs(produtosQuery);
      const produtosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Produto[];

      setProdutosOrdenados(produtosList);
      setProdutosEncontrados(produtosList.length);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      Alert.alert("Erro", "Não foi possível carregar os produtos da loja.");
    }
  };

  // Função para sincronizar produtos com o Firebase
  const sincronizarProdutos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      // Verificar se o usuário tem acesso à empresa
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        Alert.alert("Erro", "Dados do usuário não encontrados.");
        return;
      }

      const userData = userDoc.data();
      const empresaId = userData.tipo === 'empresa' ? user.uid : userData.empresaId;
      const nomeEmpresa = userData.nomeEmpresa;

      if (!empresaId || !nomeEmpresa) {
        Alert.alert("Erro", "Informações da empresa não encontradas.");
        return;
      }

      // Verificar se a coleção já existe
      const lojaRef = collection(db, "loja");
      const q = query(lojaRef, where("empresaId", "==", empresaId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Adicionar produtos de exemplo
        for (const produto of PRODUTOS_EXEMPLO) {
          await addDoc(lojaRef, {
            ...produto,
            empresaId,
            nomeEmpresa,
            createdAt: serverTimestamp()
          });
        }
        
        Alert.alert(
          "Sucesso", 
          "Produtos sincronizados com sucesso! Foram adicionados produtos de exemplo."
        );
      } else {
        Alert.alert(
          "Sincronização", 
          "Já existem produtos cadastrados para esta empresa. Deseja substituí-los?",
          [
            {
              text: "Não",
              style: "cancel"
            },
            {
              text: "Sim",
              onPress: async () => {
                // Deletar produtos existentes
                for (const doc of querySnapshot.docs) {
                  await setDoc(doc.ref, {
                    ...PRODUTOS_EXEMPLO.find((p, index) => index === querySnapshot.docs.indexOf(doc)) || PRODUTOS_EXEMPLO[0],
                    id: doc.id,
                    empresaId,
                    nomeEmpresa,
                    updatedAt: serverTimestamp()
                  });
                }
                
                // Se tiver menos produtos que o exemplo, adicionar o restante
                if (querySnapshot.docs.length < PRODUTOS_EXEMPLO.length) {
                  for (let i = querySnapshot.docs.length; i < PRODUTOS_EXEMPLO.length; i++) {
                    await addDoc(lojaRef, {
                      ...PRODUTOS_EXEMPLO[i],
                      empresaId,
                      nomeEmpresa,
                      createdAt: serverTimestamp()
                    });
                  }
                }
                
                Alert.alert("Sucesso", "Produtos atualizados com sucesso!");
                fetchProdutos();
              }
            }
          ]
        );
      }
      
      await fetchProdutos();
    } catch (error) {
      console.error("Erro ao sincronizar produtos:", error);
      Alert.alert("Erro", "Não foi possível sincronizar os produtos.");
    }
  };

  // Atualizar pontos do usuário no Firebase
  const atualizarPontosUsuario = async (novosPontos: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        pontos: novosPontos
      });
    } catch (error) {
      console.error("Erro ao atualizar pontos do usuário:", error);
    }
  };

  // Função para ordenar produtos
  const ordenarProdutos = (opcao: typeof OPCOES_ORDENACAO[0]) => {
    let produtos = [...produtosOrdenados];
    
    switch (opcao.id) {
      case 'menor_preco':
        produtos.sort((a, b) => a.pontos - b.pontos);
        break;
      case 'maior_preco':
        produtos.sort((a, b) => b.pontos - a.pontos);
        break;
      case 'maior_desconto':
        produtos.sort((a, b) => b.desconto - a.desconto);
        break;
      case 'mais_recentes':
        // Aqui seria baseado em uma data, mas como não temos, vamos inverter a ordem atual
        produtos.reverse();
        break;
      default:
        // Relevantes (padrão) - mantém a ordem original
        break;
    }
    
    setProdutosOrdenados(produtos);
    setOrdenacaoSelecionada(opcao);
    setModalOrdenacaoVisible(false);
  };

  // Função para verificar se o usuário pode resgatar o produto
  const verificarPontosParaResgate = (produto: Produto) => {
    if (pontos >= produto.pontos && (produto.estoque === undefined || produto.estoque > 0)) {
      return true;
    }
    return false;
  };

  // Função para iniciar o processo de resgate
  const iniciarResgate = (produto: Produto) => {
    setProdutoSelecionado(produto);
    
    if (verificarPontosParaResgate(produto)) {
      setModalConfirmacaoVisible(true);
    } else if (produto.estoque !== undefined && produto.estoque <= 0) {
      Alert.alert(
        "Produto indisponível",
        "Este produto está sem estoque no momento.",
        [{ text: "OK", style: "cancel" }]
      );
    } else {
      Alert.alert(
        "Pontos insuficientes",
        `Você precisa de ${produto.pontos.toLocaleString()} pontos para resgatar este item. Faltam ${(produto.pontos - pontos).toLocaleString()} pontos.`,
        [{ text: "OK", style: "cancel" }]
      );
    }
  };

  // Função para finalizar o resgate
  const finalizarResgate = async () => {
    if (!produtoSelecionado) return;
    
    try {
      // Desconta os pontos do saldo do usuário
      const novoSaldo = pontos - produtoSelecionado.pontos;
      setPontos(novoSaldo);
      
      // Atualizar pontos no Firebase
      await atualizarPontosUsuario(novoSaldo);
      
      // Reduzir estoque do produto
      if (produtoSelecionado.id && produtoSelecionado.estoque !== undefined && produtoSelecionado.estoque > 0) {
        await updateDoc(doc(db, "loja", produtoSelecionado.id), {
          estoque: produtoSelecionado.estoque - 1
        });
      }
      
      // Adiciona ao histórico
      const novoHistorico: HistoricoItem = {
        id: (HISTORICO.length + 1).toString(),
        data: new Date().toLocaleDateString('pt-BR'),
        descricao: `Resgate: ${produtoSelecionado.nome}`,
        pontos: produtoSelecionado.pontos,
        tipo: 'gasto'
      };
      
      // Atualizar a lista de produtos
      await fetchProdutos();
      
      // Fecha o modal de confirmação
      setModalConfirmacaoVisible(false);
      setProdutoSelecionado(null);
      
      // Exibe mensagem de sucesso
      Alert.alert(
        "Resgate realizado com sucesso!",
        "Você receberá mais informações sobre a entrega em breve.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erro ao finalizar resgate:", error);
      Alert.alert("Erro", "Não foi possível finalizar o resgate. Tente novamente.");
    }
  };

  // Função para mostrar detalhes do produto
  const mostrarDetalhesProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalDetalhesVisible(true);
  };

  // Renderiza um item da grade de produtos
  const renderItem = ({ item }: { item: Produto }) => {
    const podeResgatar = verificarPontosParaResgate(item);
    const estoqueIndisponivel = item.estoque !== undefined && item.estoque <= 0;
    
    return (
      <Pressable
        style={[
          styles.produtoCard,
          visualizacao === 'lista' && styles.produtoCardLista,
          { backgroundColor: colors.background50, borderColor: colors.border }
        ]}
        onPress={() => mostrarDetalhesProduto(item)}
      >
        {item.condicao && (
          <View style={styles.condicaoTag}>
            <Text style={[styles.condicaoText, { color: colors.background }]}>
              {item.condicao}
            </Text>
          </View>
        )}
        
        {estoqueIndisponivel && (
          <View style={[styles.condicaoTag, { backgroundColor: colors.error }]}>
            <Text style={[styles.condicaoText, { color: colors.background }]}>
              Sem estoque
            </Text>
          </View>
        )}
        
        <Image
          source={{ uri: item.imagem }}
          style={[
            styles.produtoImagem,
            visualizacao === 'lista' && styles.produtoImagemLista
          ]}
          resizeMode="cover"
        />
        
        <View style={[
          styles.produtoInfo,
          visualizacao === 'lista' && styles.produtoInfoLista
        ]}>
          <Text 
            style={[styles.produtoNome, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {item.nome}
          </Text>
          
          <View style={styles.avaliacaoContainer}>
            {[1, 2, 3, 4, 5].map((estrela) => (
              <FontAwesome
                key={estrela}
                name="star"
                size={16}
                color={colors.warning}
              />
            ))}
            <Text style={[styles.avaliacaoText, { color: colors.textSecondary }]}>
              {" 5.0"}
            </Text>
          </View>
          
          <View style={styles.precoContainer}>
            {item.desconto > 0 && (
              <>
                <Text style={[styles.precoOriginal, { color: colors.textSecondary }]}>
                  {item.pontosOriginal.toLocaleString()} pts
                </Text>
                <View style={[styles.descontoTag, { backgroundColor: colors.success }]}>
                  <Text style={[styles.descontoText, { color: colors.background }]}>
                    {item.desconto}%
                  </Text>
                </View>
              </>
            )}
          </View>
          
          <Text style={[
            styles.precoAtual, 
            { 
              color: podeResgatar ? colors.primary : colors.error 
            }
          ]}>
            {item.pontos.toLocaleString()} pts
          </Text>

          {visualizacao === 'lista' ? (
            <TouchableOpacity 
              style={[
                styles.botaoResgatarLista, 
                { 
                  backgroundColor: podeResgatar ? colors.primary : colors.background50,
                  borderColor: podeResgatar ? 'transparent' : colors.error,
                  borderWidth: podeResgatar ? 0 : 1
                }
              ]}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                iniciarResgate(item);
              }}
              disabled={!podeResgatar}
            >
              <Text style={[
                styles.botaoResgatarTexto, 
                { 
                  color: podeResgatar ? colors.background : colors.error 
                }
              ]}>
                {estoqueIndisponivel ? 'Sem estoque' : (podeResgatar ? 'Resgatar' : 'Indisponível')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        {visualizacao !== 'lista' && (
          <TouchableOpacity 
            style={[
              styles.botaoResgatar, 
              { 
                backgroundColor: podeResgatar ? colors.primary : colors.background50,
                borderColor: podeResgatar ? 'transparent' : colors.error,
                borderWidth: podeResgatar ? 0 : 1
              }
            ]}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              iniciarResgate(item);
            }}
            disabled={!podeResgatar}
          >
            <Text style={[
              styles.botaoResgatarTexto, 
              { 
                color: podeResgatar ? colors.background : colors.error 
              }
            ]}>
              {estoqueIndisponivel ? 'Sem estoque' : (podeResgatar ? 'Resgatar' : 'Indisponível')}
            </Text>
          </TouchableOpacity>
        )}
      </Pressable>
    );
  };

  // Renderiza um item do histórico
  const renderHistoricoItem = ({ item }: { item: HistoricoItem }) => {
    const { colors } = useTheme();
    return (
      <View style={styles.modalBody}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {item.data}
          </Text>
          <View style={[styles.modalButton, { backgroundColor: item.tipo === 'ganho' ? colors.success : colors.error }]}>
            <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
              {item.tipo === 'ganho' ? 'Ganho' : 'Gasto'}
            </Text>
          </View>
        </View>
        <Text style={[styles.modalBody, { color: colors.textPrimary }]}>
          {item.descricao}
        </Text>
        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
          {item.pontos} pontos
        </Text>
      </View>
    );
  };

  // Renderiza um item de ordenação
  const renderOrdenacaoOption = ({ item }: { item: { id: string; nome: string } }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        style={[styles.ordenacaoItem, { backgroundColor: colors.background }]}
        onPress={() => {
          setOrdenacaoSelecionada(item);
          setModalOrdenacaoVisible(false);
        }}
      >
        <Text style={[styles.ordenacaoItemText, { color: colors.textPrimary }]}>
          {item.nome}
        </Text>
        {ordenacaoSelecionada.id === item.id && (
          <FontAwesome name="check" size={16} color={colors.primary} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Carregando produtos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header pontos={pontos} maximoPontosPorDia={maximoPontosPorDia} />

      {/* Opções de ordenação */}
      <View style={styles.ordenacaoContainer}>
        <TouchableOpacity 
          style={[
            styles.ordenacaoWrapper, 
            { 
              backgroundColor: colors.background50, 
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }
          ]}
          onPress={() => setModalOrdenacaoVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.ordenacaoLabel, { color: colors.textSecondary }]}>
            ordenar por:
          </Text>
          <Text style={[styles.ordenacaoValor, { color: colors.textPrimary, fontWeight: '500' }]}>
            {ordenacaoSelecionada.nome}
          </Text>
          <FontAwesome name="angle-down" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Lista de produtos */}
      <FlatList
        data={produtosOrdenados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={visualizacao === 'grade' ? 2 : 1}
        key={visualizacao} // Força re-render quando muda visualização
        contentContainerStyle={styles.produtosContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de Ordenação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalOrdenacaoVisible}
        onRequestClose={() => setModalOrdenacaoVisible(false)}
      >
        <Pressable 
          style={styles.modalContainer}
          onPress={() => setModalOrdenacaoVisible(false)}
        >
          <View 
            style={[
              styles.ordenacaoModalContent, 
              { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                width: '92%',
                alignSelf: 'center'
              }
            ]}
          >
            <Text style={{
              fontSize: 16, 
              fontWeight: 'bold', 
              color: colors.textPrimary, 
              marginBottom: 12,
              textAlign: 'center'
            }}>
              Ordenar por
            </Text>
            
            {OPCOES_ORDENACAO.map((opcao) => (
              <TouchableOpacity
                key={opcao.id}
                style={[
                  styles.ordenacaoOption,
                  ordenacaoSelecionada.id === opcao.id && {
                    backgroundColor: colors.background50
                  }
                ]}
                onPress={() => ordenarProdutos(opcao)}
              >
                <Text 
                  style={[
                    styles.ordenacaoOptionText, 
                    { 
                      color: ordenacaoSelecionada.id === opcao.id 
                        ? colors.primary 
                        : colors.textPrimary 
                    }
                  ]}
                >
                  {opcao.nome}
                </Text>
                {ordenacaoSelecionada.id === opcao.id && (
                  <FontAwesome name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal de Confirmação de Resgate */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalConfirmacaoVisible}
        onRequestClose={() => setModalConfirmacaoVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalConfirmacao, 
            { backgroundColor: colors.background }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Confirmar Resgate
              </Text>
            </View>
            
            {produtoSelecionado && (
              <>
                <Text style={[styles.confirmacaoTexto, { color: colors.textPrimary }]}>
                  Você está prestes a resgatar:
                </Text>
                
                <View style={[
                  styles.confirmacaoProduto, 
                  { backgroundColor: colors.background50, borderColor: colors.border }
                ]}>
                  <Image 
                    source={{ uri: produtoSelecionado.imagem }} 
                    style={styles.confirmacaoImagem}
                    resizeMode="cover"
                  />
                  <View style={styles.confirmacaoInfo}>
                    <Text style={[styles.confirmacaoNome, { color: colors.textPrimary }]}>
                      {produtoSelecionado.nome}
                    </Text>
                    <Text style={[styles.confirmacaoPontos, { color: colors.primary }]}>
                      {produtoSelecionado.pontos.toLocaleString()} pontos
                    </Text>
                  </View>
                </View>
                
                <View style={styles.confirmacaoSaldo}>
                  <Text style={[styles.confirmacaoTexto, { color: colors.textPrimary }]}>
                    Saldo atual: <Text style={{ fontWeight: 'bold' }}>{pontos.toLocaleString()}</Text>
                  </Text>
                  <Text style={[styles.confirmacaoTexto, { color: colors.textPrimary }]}>
                    Após resgate: <Text style={{ fontWeight: 'bold' }}>{(pontos - produtoSelecionado.pontos).toLocaleString()}</Text>
                  </Text>
                </View>
                
                <Text style={[styles.confirmacaoAviso, { color: colors.textSecondary }]}>
                  Esta ação não pode ser desfeita. Confirma o resgate?
                </Text>
                
                <View style={styles.confirmacaoBotoes}>
                  <TouchableOpacity
                    style={[styles.confirmacaoBotao, styles.botaoCancelar, { borderColor: colors.border }]}
                    onPress={() => setModalConfirmacaoVisible(false)}
                  >
                    <Text style={[styles.confirmacaoBotaoTexto, { color: colors.textPrimary }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.confirmacaoBotao, styles.botaoConfirmar, { backgroundColor: colors.primary }]}
                    onPress={finalizarResgate}
                  >
                    <Text style={[styles.confirmacaoBotaoTexto, { color: colors.background }]}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes do Produto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetalhesVisible}
        onRequestClose={() => setModalDetalhesVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalDetalhe, { backgroundColor: colors.background }]}>
            {produtoSelecionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detalheCabecalho}>
                  <TouchableOpacity
                    onPress={() => setModalDetalhesVisible(false)}
                    style={styles.closeButton}
                  >
                    <FontAwesome name="arrow-left" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.detalheCategoria, { color: colors.textSecondary }]}>
                    {produtoSelecionado.categoria}
                  </Text>
                </View>
                
                <Image 
                  source={{ uri: produtoSelecionado.imagem }} 
                  style={styles.detalheImagem}
                  resizeMode="cover"
                />
                
                <View style={styles.detalheTags}>
                  <View style={[styles.detalheTag, { backgroundColor: colors.background50 }]}>
                    <Text style={[styles.detalheTagText, { color: colors.textSecondary }]}>
                      {produtoSelecionado.condicao}
                    </Text>
                  </View>
                  
                  {produtoSelecionado.desconto > 0 && (
                    <View style={[styles.detalheTag, { backgroundColor: colors.success + '30' }]}>
                      <Text style={[styles.detalheTagText, { color: colors.success }]}>
                        {produtoSelecionado.desconto}% OFF
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.detalheNome, { color: colors.textPrimary }]}>
                  {produtoSelecionado.nome}
                </Text>
                
                <View style={styles.detalheAvaliacao}>
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <FontAwesome
                      key={estrela}
                      name="star"
                      size={18}
                      color={colors.warning}
                    />
                  ))}
                  <Text style={[styles.detalheAvaliacaoText, { color: colors.textSecondary }]}>
                    {" 5.0 (24 avaliações)"}
                  </Text>
                </View>
                
                <View style={styles.detalhePrecosContainer}>
                  {produtoSelecionado.desconto > 0 && (
                    <Text style={[styles.detalhePrecoOriginal, { color: colors.textSecondary }]}>
                      {produtoSelecionado.pontosOriginal.toLocaleString()} pts
                    </Text>
                  )}
                  
                  <Text style={[
                    styles.detalhePrecoAtual, 
                    { 
                      color: verificarPontosParaResgate(produtoSelecionado) 
                        ? colors.primary 
                        : colors.error 
                    }
                  ]}>
                    {produtoSelecionado.pontos.toLocaleString()} pts
                  </Text>
                </View>
                
                <View style={[styles.detalheHr, { backgroundColor: colors.border }]} />
                
                <Text style={[styles.detalheSecaoTitulo, { color: colors.textPrimary }]}>
                  Descrição do produto
                </Text>
                
                <Text style={[styles.detalheDescricao, { color: colors.textSecondary }]}>
                  {`${produtoSelecionado.nome} em excelente estado. Este produto faz parte do nosso programa de recompensas para colaboradores que participam ativamente do sistema de feedback da empresa.`}
                </Text>
                
                <Text style={[styles.detalheSecaoTitulo, { color: colors.textPrimary, marginTop: 24 }]}>
                  Informações adicionais
                </Text>
                
                <View style={styles.detalheInfo}>
                  <Text style={[styles.detalheInfoLabel, { color: colors.textSecondary }]}>
                    Categoria:
                  </Text>
                  <Text style={[styles.detalheInfoValor, { color: colors.textPrimary }]}>
                    {produtoSelecionado.categoria}
                  </Text>
                </View>
                
                <View style={styles.detalheInfo}>
                  <Text style={[styles.detalheInfoLabel, { color: colors.textSecondary }]}>
                    Condição:
                  </Text>
                  <Text style={[styles.detalheInfoValor, { color: colors.textPrimary }]}>
                    {produtoSelecionado.condicao}
                  </Text>
                </View>
                
                <View style={styles.detalheInfo}>
                  <Text style={[styles.detalheInfoLabel, { color: colors.textSecondary }]}>
                    Disponibilidade:
                  </Text>
                  <Text style={[
                    styles.detalheInfoValor, 
                    { 
                      color: verificarPontosParaResgate(produtoSelecionado) 
                        ? colors.success 
                        : colors.error 
                    }
                  ]}>
                    {verificarPontosParaResgate(produtoSelecionado) 
                      ? 'Disponível para resgate' 
                      : 'Pontos insuficientes'}
                  </Text>
                </View>
                
                <View style={styles.detalheBotaoContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.detalheBotao, 
                      { 
                        backgroundColor: verificarPontosParaResgate(produtoSelecionado) 
                          ? colors.primary 
                          : colors.background50,
                        borderColor: verificarPontosParaResgate(produtoSelecionado) 
                          ? 'transparent' 
                          : colors.error,
                        borderWidth: verificarPontosParaResgate(produtoSelecionado) ? 0 : 1
                      }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setModalDetalhesVisible(false);
                      iniciarResgate(produtoSelecionado);
                    }}
                    disabled={!verificarPontosParaResgate(produtoSelecionado)}
                  >
                    <Text style={[
                      styles.detalheBotaoTexto, 
                      { 
                        color: verificarPontosParaResgate(produtoSelecionado) 
                          ? colors.background 
                          : colors.error 
                      }
                    ]}>
                      {verificarPontosParaResgate(produtoSelecionado) 
                        ? 'Resgatar agora' 
                        : 'Pontos insuficientes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  pontosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  pontosInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pontosTexto: {
    fontSize: 16,
    marginLeft: 4,
  },
  maximoDiarioTexto: {
    fontSize: 13,
    marginTop: 2,
  },
  visualizacaoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visualizacaoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  visualizacaoButton: {
    padding: 8,
    borderRadius: 8,
  },
  ordenacaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
  },
  ordenacaoTexto: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  listContainer: {
    padding: 8,
  },
  card: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pontos: {
    fontSize: 16,
    fontWeight: '600',
  },
  resgatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resgatarButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  ordenacaoList: {
    marginTop: 12,
  },
  ordenacaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  ordenacaoItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 15,
  },
  viewOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
  },
  ordenacaoContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  ordenacaoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  ordenacaoLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  ordenacaoValor: {
    fontSize: 14,
    flex: 1,
  },
  produtosContainer: {
    paddingBottom: 20,
  },
  produtoCard: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  produtoCardLista: {
    flexDirection: 'row',
    marginHorizontal: 0,
    flex: 0,
  },
  condicaoTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  condicaoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  produtoImagem: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  produtoImagemLista: {
    width: 100,
    height: '100%',
  },
  produtoInfo: {
    padding: 12,
  },
  produtoInfoLista: {
    flex: 1,
    paddingRight: 100, // Espaço para o botão
    position: 'relative',
  },
  produtoNome: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    minHeight: 36,
  },
  avaliacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avaliacaoText: {
    marginLeft: 4,
    fontSize: 14,
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  precoOriginal: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  descontoTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  descontoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  precoAtual: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  botaoResgatar: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoResgatarLista: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoResgatarTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalConfirmacao: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmacaoTexto: {
    fontSize: 16,
    marginVertical: 10,
  },
  confirmacaoProduto: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 10,
  },
  confirmacaoImagem: {
    width: 80,
    height: 80,
  },
  confirmacaoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  confirmacaoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  confirmacaoPontos: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmacaoSaldo: {
    marginVertical: 10,
  },
  confirmacaoAviso: {
    fontSize: 14,
    marginVertical: 16,
    textAlign: 'center',
  },
  confirmacaoBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmacaoBotao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  botaoCancelar: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  botaoConfirmar: {
    backgroundColor: '#583101',
  },
  confirmacaoBotaoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalDetalhe: {
    width: '92%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detalheCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detalheCategoria: {
    fontSize: 15,
    fontWeight: '500',
  },
  detalheImagem: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  detalheTags: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detalheTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  detalheTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  detalheNome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detalheAvaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detalheAvaliacaoText: {
    marginLeft: 4,
    fontSize: 15,
  },
  detalhePrecosContainer: {
    marginBottom: 20,
  },
  detalhePrecoOriginal: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  detalhePrecoAtual: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  detalheHr: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  detalheSecaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detalheDescricao: {
    fontSize: 15,
    lineHeight: 22,
  },
  detalheInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detalheInfoLabel: {
    fontSize: 15,
    width: 110,
  },
  detalheInfoValor: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  detalheBotaoContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  detalheBotao: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  detalheBotaoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ordenacaoModalContent: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginTop: 80,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ordenacaoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  ordenacaoOptionText: {
    fontSize: 16,
  },
});

export default LojaScreen; 