import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

// Função para gerar avatar com as iniciais do nome
const getAvatarUri = (name) => {
  const formattedName = encodeURIComponent(name);
  return { uri: `https://ui-avatars.com/api/?name=${formattedName}&background=8B4513&color=fff` };
};

// Dados fictícios para os cards de time
const TIME_DATA = [
  {
    id: '1',
    author: {
      name: 'Teste Lorem Ipsum',
      avatar: getAvatarUri('Teste Lorem'),
    },
    title: 'Teste Lorem Ipsum',
    description: 'Fiz uma tela de dashboard',
    likes: 5,
    isLiked: false,
    isFavorite: false,
    comments: 3,
    topFeedback: {
      id: '101',
      author: {
        name: 'Super Interessante!',
        avatar: getAvatarUri('Super Interessante'),
      },
      content: 'Super Interessante!',
      likes: 8,
      isLiked: false,
    },
  },
  {
    id: '2',
    author: {
      name: 'Teste Lorem Ipsum',
      avatar: getAvatarUri('Teste Lorem'),
    },
    title: 'Teste Lorem Ipsum',
    description: 'Fiz uma tela de dashboard',
    likes: 7,
    isLiked: false,
    isFavorite: false,
    comments: 4,
    topFeedback: {
      id: '102',
      author: {
        name: 'Super Interessante!',
        avatar: getAvatarUri('Super Interessante'),
      },
      content: 'Super Interessante!',
      likes: 12,
      isLiked: false,
    },
  },
  {
    id: '3',
    author: {
      name: 'Teste Lorem Ipsum',
      avatar: getAvatarUri('Teste Lorem'),
    },
    title: 'Teste Lorem Ipsum',
    description: 'Fiz uma tela de dashboard',
    likes: 9,
    isLiked: false,
    isFavorite: false,
    comments: 2,
    topFeedback: {
      id: '103',
      author: {
        name: 'Super Interessante!',
        avatar: getAvatarUri('Super Interessante'),
      },
      content: 'Super Interessante!',
      likes: 15,
      isLiked: false,
    },
  },
  {
    id: '4',
    author: {
      name: 'Maria Silva',
      avatar: getAvatarUri('Maria Silva'),
    },
    title: 'Maria Silva',
    description: 'Implementei uma nova funcionalidade no app',
    likes: 12,
    isLiked: false,
    isFavorite: false,
    comments: 5,
    topFeedback: {
      id: '104',
      author: {
        name: 'João Santos',
        avatar: getAvatarUri('João Santos'),
      },
      content: 'Ficou incrível!',
      likes: 10,
      isLiked: false,
    },
  },
  {
    id: '5',
    author: {
      name: 'Carlos Oliveira',
      avatar: getAvatarUri('Carlos Oliveira'),
    },
    title: 'Carlos Oliveira',
    description: 'Criei uma animação para o app',
    likes: 15,
    isLiked: false,
    isFavorite: false,
    comments: 7,
    topFeedback: {
      id: '105',
      author: {
        name: 'Ana Paula',
        avatar: getAvatarUri('Ana Paula'),
      },
      content: 'Muito fluído, parabéns!',
      likes: 18,
      isLiked: false,
    },
  },
  {
    id: '6',
    author: {
      name: 'Roberto Gomes',
      avatar: getAvatarUri('Roberto Gomes'),
    },
    title: 'Roberto Gomes',
    description: 'Resolvi um bug crítico no sistema',
    likes: 20,
    isLiked: false,
    isFavorite: false,
    comments: 8,
    topFeedback: {
      id: '106',
      author: {
        name: 'Patricia Mendes',
        avatar: getAvatarUri('Patricia Mendes'),
      },
      content: 'Excelente trabalho!',
      likes: 22,
      isLiked: false,
    },
  },
];

// Dados fictícios para os cards de empresa
const EMPRESA_DATA = [
  {
    id: '101',
    author: {
      name: 'Tech Solutions',
      avatar: getAvatarUri('Tech Solutions'),
    },
    title: 'Tech Solutions',
    description: 'Lançamos a nova versão do nosso app empresarial',
    likes: 48,
    isLiked: false,
    isFavorite: false,
    comments: 15,
    topFeedback: {
      id: '201',
      author: {
        name: 'Sandra Marketing',
        avatar: getAvatarUri('Sandra Marketing'),
      },
      content: 'Essa atualização vai revolucionar o mercado!',
      likes: 32,
      isLiked: false,
    },
  },
  {
    id: '102',
    author: {
      name: 'Cloud Systems',
      avatar: getAvatarUri('Cloud Systems'),
    },
    title: 'Cloud Systems',
    description: 'Nova estratégia de marketing digital implementada',
    likes: 67,
    isLiked: false,
    isFavorite: false,
    comments: 21,
    topFeedback: {
      id: '202',
      author: {
        name: 'Marcos Diretor',
        avatar: getAvatarUri('Marcos Diretor'),
      },
      content: 'Estamos observando um aumento significativo nas conversões!',
      likes: 45,
      isLiked: false,
    },
  },
  {
    id: '103',
    author: {
      name: 'Innovate Inc',
      avatar: getAvatarUri('Innovate Inc'),
    },
    title: 'Innovate Inc',
    description: 'Resultados do primeiro trimestre superaram expectativas',
    likes: 89,
    isLiked: false,
    isFavorite: false,
    comments: 34,
    topFeedback: {
      id: '203',
      author: {
        name: 'Carla Finanças',
        avatar: getAvatarUri('Carla Finanças'),
      },
      content: 'Os investidores estão muito satisfeitos com esses números!',
      likes: 56,
      isLiked: false,
    },
  },
  {
    id: '104',
    author: {
      name: 'Global Tech',
      avatar: getAvatarUri('Global Tech'),
    },
    title: 'Global Tech',
    description: 'Expandimos operações para três novos países',
    likes: 112,
    isLiked: false,
    isFavorite: false,
    comments: 42,
    topFeedback: {
      id: '204',
      author: {
        name: 'Ricardo Expansão',
        avatar: getAvatarUri('Ricardo Expansão'),
      },
      content: 'Uma jogada estratégica impressionante para o mercado internacional',
      likes: 78,
      isLiked: false,
    },
  },
  {
    id: '105',
    author: {
      name: 'Future Labs',
      avatar: getAvatarUri('Future Labs'),
    },
    title: 'Future Labs',
    description: 'Nova patente registrada para tecnologia de IA',
    likes: 135,
    isLiked: false,
    isFavorite: false,
    comments: 53,
    topFeedback: {
      id: '205',
      author: {
        name: 'Amanda Inovação',
        avatar: getAvatarUri('Amanda Inovação'),
      },
      content: 'Esta tecnologia vai mudar completamente o setor!',
      likes: 91,
      isLiked: false,
    },
  },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('time'); // 'time' ou 'empresa'
  const [timeData, setTimeData] = useState([...TIME_DATA]);
  const [empresaData, setEmpresaData] = useState([...EMPRESA_DATA]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Função para lidar com curtidas
  const handleLike = (cardId, isFromFeedback = false) => {
    if (activeTab === 'time') {
      setTimeData(prev => prev.map(card => {
        if (isFromFeedback) {
          if (card.topFeedback.id === cardId) {
            const newLikes = card.topFeedback.isLiked ? card.topFeedback.likes - 1 : card.topFeedback.likes + 1;
            return {
              ...card,
              topFeedback: {
                ...card.topFeedback,
                likes: newLikes,
                isLiked: !card.topFeedback.isLiked
              }
            };
          }
        } else {
          if (card.id === cardId) {
            const newLikes = card.isLiked ? card.likes - 1 : card.likes + 1;
            return { ...card, likes: newLikes, isLiked: !card.isLiked };
          }
        }
        return card;
      }));
    } else {
      setEmpresaData(prev => prev.map(card => {
        if (isFromFeedback) {
          if (card.topFeedback.id === cardId) {
            const newLikes = card.topFeedback.isLiked ? card.topFeedback.likes - 1 : card.topFeedback.likes + 1;
            return {
              ...card,
              topFeedback: {
                ...card.topFeedback,
                likes: newLikes,
                isLiked: !card.topFeedback.isLiked
              }
            };
          }
        } else {
          if (card.id === cardId) {
            const newLikes = card.isLiked ? card.likes - 1 : card.likes + 1;
            return { ...card, likes: newLikes, isLiked: !card.isLiked };
          }
        }
        return card;
      }));
    }
  };

  // Função para lidar com favoritos
  const handleFavorite = (cardId) => {
    if (activeTab === 'time') {
      setTimeData(prev => prev.map(card => {
        if (card.id === cardId) {
          return { ...card, isFavorite: !card.isFavorite };
        }
        return card;
      }));
    } else {
      setEmpresaData(prev => prev.map(card => {
        if (card.id === cardId) {
          return { ...card, isFavorite: !card.isFavorite };
        }
        return card;
      }));
    }
  };

  // Função para compartilhar
  const handleShare = async (tarefa) => {
    try {
      // Texto formatado diferente dependendo do tipo de conteúdo (time ou empresa)
      let message = '';
      let title = '';
      
      if (activeTab === 'time') {
        // Formato mais pessoal para compartilhamentos do time
        message = `📱 Confira esta tarefa de ${tarefa.author.name}: "${tarefa.description}" #desenvolvimento #inovação`;
        title = `Compartilhar conquista de ${tarefa.author.name}`;
      } else {
        // Formato mais profissional para compartilhamentos da empresa
        message = `🚀 ${tarefa.title}: ${tarefa.description}\n\nConfira esta atualização importante para nosso mercado. #negócios #tecnologia #inovação`;
        title = `Novidades de ${tarefa.title}`;
      }
      
      const result = await Share.share({
        message,
        title,
        // URL opcional - poderia ser um link para o app ou site da empresa
        // url: 'https://seuapp.com/compartilhar/' + tarefa.id,
      }, {
        // Diálogo específico para Android
        dialogTitle: 'Compartilhar com sua rede',
        // Define LinkedIn como uma opção de compartilhamento em destaque no iOS
        excludedActivityTypes: [
          'com.apple.UIKit.activity.Print',
          'com.apple.UIKit.activity.AssignToContact',
          'com.apple.UIKit.activity.SaveToCameraRoll',
          'com.apple.UIKit.activity.AddToReadingList',
          'com.apple.UIKit.activity.AirDrop',
        ]
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Compartilhado com atividade específica
          console.log(`Compartilhado via ${result.activityType}`);
          // Se for compartilhado pelo LinkedIn, podemos rastrear isso
          if (result.activityType.includes('LinkedIn')) {
            console.log('Compartilhado no LinkedIn!');
          }
        } else {
          // Compartilhado
          console.log('Compartilhado com sucesso');
        }
      } else if (result.action === Share.dismissedAction) {
        // Compartilhamento cancelado
        console.log('Compartilhamento cancelado');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao compartilhar');
    }
  };

  // Função para exibir comentários
  const handleComments = (cardId) => {
    Alert.alert('Comentários', 'Funcionalidade de comentários será implementada em breve!');
  };

  const renderCard = (tarefa, index) => {
    // Calculando valores para animação suave sem fazer os cards sumirem
    const cardHeight = 200; // Altura aproximada do card em pixels
    const position = index * cardHeight;
    
    // Definindo ranges mais adequados para a animação
    const inputRange = [
      position - 300, // Antes do card entrar na tela
      position - 100, // Card começando a aparecer
      position + 100, // Card totalmente visível
      position + 300  // Card saindo da tela
    ];
    
    // Efeito de escala sutil para dar sensação de profundidade
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.98, 1, 1, 0.98],
      extrapolate: 'clamp',
    });
    
    // Efeito de translação para movimento leve enquanto rola
    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [5, 0, 0, 5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        key={tarefa.id} 
        style={[
          styles.cardContainer,
          { 
            transform: [
              { scale },
              { translateY }
            ] 
          }
        ]}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.authorContainer}>
              <Image source={tarefa.author.avatar} style={styles.avatar} />
              <Text style={styles.authorName}>{tarefa.title}</Text>
            </View>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={() => handleFavorite(tarefa.id)}
            >
              <Ionicons 
                name={tarefa.isFavorite ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color="#8B4513" 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.cardDescription}>{tarefa.description}</Text>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLike(tarefa.id)}
            >
              <Ionicons 
                name={tarefa.isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color="#8B4513" 
              />
              {tarefa.likes > 0 && (
                <Text style={styles.likeCount}>{tarefa.likes}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleComments(tarefa.id)}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#8B4513" />
              {tarefa.comments > 0 && (
                <Text style={styles.commentCount}>{tarefa.comments}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShare(tarefa)}
            >
              <Ionicons name="paper-plane-outline" size={22} color="#8B4513" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Feedback "filho" - o mais curtido */}
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackContent}>
            <Image source={tarefa.topFeedback.author.avatar} style={styles.feedbackAvatar} />
            <Text style={styles.feedbackText}>{tarefa.topFeedback.content}</Text>
            <TouchableOpacity 
              style={styles.feedbackLikeButton}
              onPress={() => handleLike(tarefa.topFeedback.id, true)}
            >
              <Ionicons 
                name={tarefa.topFeedback.isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color="#8B4513" 
              />
              <Text style={styles.feedbackLikeCount}>{tarefa.topFeedback.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Seleciona o conjunto de dados correto com base na aba ativa
  const currentData = activeTab === 'time' ? timeData : empresaData;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header com abas */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'time' && styles.activeTab]}
            onPress={() => setActiveTab('time')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'time' && styles.activeTabText
              ]}
            >
              Time
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'empresa' && styles.activeTab]}
            onPress={() => setActiveTab('empresa')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'empresa' && styles.activeTabText
              ]}
            >
              Empresa
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Conteúdo principal */}
      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16} // Otimização para manter animações suaves
      >
        {currentData.map((tarefa, index) => renderCard(tarefa, index))}
        <View style={styles.scrollEndSpacer} />
      </Animated.ScrollView>
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
    borderBottomColor: '#E5D3B3', // Cor bege mais escura para a borda
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center', // Centraliza as abas
    alignItems: 'center',
    marginRight: 24, // Espaço para equilibrar com o botão de voltar
  },
  tab: {
    marginHorizontal: 12,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513', // Marrom para combinar com o resto da UI
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingVertical: 8,
  },
  cardContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#F2E2CE', // Bege mais escuro para o card
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bookmarkButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: -10,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#F2E2CE', // Mesmo cor do card
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  feedbackLikeButton: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackLikeCount: {
    marginLeft: 2,
    fontSize: 10,
    color: '#8B4513',
    fontWeight: '500',
  },
  scrollEndSpacer: {
    height: 80, // Espaço extra no final da lista para melhorar a experiência de rolagem
  }
}); 