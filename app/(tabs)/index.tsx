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
import { ChatModal } from '@/components/ChatModal';
import { useTheme } from '@/contexts/ThemeContext';

// Função para gerar avatar com as iniciais do nome
const getAvatarUri = (name: string) => {
  const formattedName = encodeURIComponent(name);
  return { uri: `https://ui-avatars.com/api/?name=${formattedName}&background=8B4513&color=fff` };
};

interface Feedback {
  id: string;
  author: {
    name: string;
    avatar: any;
  };
  content: string;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: any;
  };
  title: string;
  description: string;
  image?: string;
  link?: string;
  likes: number;
  isLiked: boolean;
  isFavorite: boolean;
  comments: number;
  topFeedback: Feedback;
  allFeedbacks: Feedback[];
}

// Dados fictícios para os cards de time
const TIME_DATA: Post[] = [
  {
    id: '1',
    author: {
      name: 'Teste Lorem Ipsum',
      avatar: getAvatarUri('Teste Lorem'),
    },
    title: 'Teste Lorem Ipsum',
    description: 'Fiz uma tela de dashboard',
    image: 'https://picsum.photos/800/600?random=1',
    link: 'https://exemplo.com/dashboard',
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
    allFeedbacks: [
      {
        id: '101',
        author: {
          name: 'Super Interessante!',
          avatar: getAvatarUri('Super Interessante'),
        },
        content: 'Super Interessante!',
        likes: 8,
        isLiked: false,
      },
      {
        id: '102',
        author: {
          name: 'João Silva',
          avatar: getAvatarUri('João Silva'),
        },
        content: 'Ficou incrível! Adorei as cores e a disposição dos elementos.',
        likes: 5,
        isLiked: false,
      }
    ]
  },
  {
    id: '2',
    author: {
      name: 'Teste Lorem Ipsum',
      avatar: getAvatarUri('Teste Lorem'),
    },
    title: 'Teste Lorem Ipsum',
    description: 'Fiz uma tela de dashboard',
    image: 'https://picsum.photos/800/600?random=2',
    link: 'https://exemplo.com/dashboard2',
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
    allFeedbacks: [
      {
        id: '102',
        author: {
          name: 'Super Interessante!',
          avatar: getAvatarUri('Super Interessante'),
        },
        content: 'Super Interessante!',
        likes: 12,
        isLiked: false,
      },
      {
        id: '103',
        author: {
          name: 'Maria Oliveira',
          avatar: getAvatarUri('Maria Oliveira'),
        },
        content: 'Muito bem feito! Parabéns pelo trabalho.',
        likes: 7,
        isLiked: false,
      }
    ]
  },
  {
    id: '3',
    author: {
      name: 'Teste Lorem Ipsum',
      avatar: getAvatarUri('Teste Lorem'),
    },
    title: 'Teste Lorem Ipsum',
    description: 'Fiz uma tela de dashboard',
    image: 'https://picsum.photos/800/600?random=3',
    link: 'https://exemplo.com/dashboard3',
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
    allFeedbacks: [
      {
        id: '103',
        author: {
          name: 'Super Interessante!',
          avatar: getAvatarUri('Super Interessante'),
        },
        content: 'Super Interessante!',
        likes: 15,
        isLiked: false,
      },
      {
        id: '104',
        author: {
          name: 'Pedro Santos',
          avatar: getAvatarUri('Pedro Santos'),
        },
        content: 'Excelente trabalho! Ficou muito profissional.',
        likes: 9,
        isLiked: false,
      }
    ]
  },
  {
    id: '4',
    author: {
      name: 'Maria Silva',
      avatar: getAvatarUri('Maria Silva'),
    },
    title: 'Maria Silva',
    description: 'Implementei uma nova funcionalidade no app',
    image: 'https://picsum.photos/800/600?random=4',
    link: 'https://exemplo.com/nova-funcionalidade',
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
    allFeedbacks: [
      {
        id: '104',
        author: {
          name: 'João Santos',
          avatar: getAvatarUri('João Santos'),
        },
        content: 'Ficou incrível!',
        likes: 10,
        isLiked: false,
      },
      {
        id: '105',
        author: {
          name: 'Ana Paula',
          avatar: getAvatarUri('Ana Paula'),
        },
        content: 'Essa funcionalidade vai facilitar muito o trabalho!',
        likes: 8,
        isLiked: false,
      }
    ]
  },
  {
    id: '5',
    author: {
      name: 'Carlos Oliveira',
      avatar: getAvatarUri('Carlos Oliveira'),
    },
    title: 'Carlos Oliveira',
    description: 'Criei uma animação para o app',
    image: 'https://picsum.photos/800/600?random=5',
    link: 'https://exemplo.com/animacao',
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
    allFeedbacks: [
      {
        id: '105',
        author: {
          name: 'Ana Paula',
          avatar: getAvatarUri('Ana Paula'),
        },
        content: 'Muito fluído, parabéns!',
        likes: 18,
        isLiked: false,
      },
      {
        id: '106',
        author: {
          name: 'Roberto Gomes',
          avatar: getAvatarUri('Roberto Gomes'),
        },
        content: 'A animação ficou super suave! Como você fez isso?',
        likes: 12,
        isLiked: false,
      }
    ]
  },
  {
    id: '6',
    author: {
      name: 'Roberto Gomes',
      avatar: getAvatarUri('Roberto Gomes'),
    },
    title: 'Roberto Gomes',
    description: 'Resolvi um bug crítico no sistema',
    image: 'https://picsum.photos/800/600?random=6',
    link: 'https://exemplo.com/bugfix',
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
    allFeedbacks: [
      {
        id: '106',
        author: {
          name: 'Patricia Mendes',
          avatar: getAvatarUri('Patricia Mendes'),
        },
        content: 'Excelente trabalho!',
        likes: 22,
        isLiked: false,
      },
      {
        id: '107',
        author: {
          name: 'Lucas Ferreira',
          avatar: getAvatarUri('Lucas Ferreira'),
        },
        content: 'Estava atrapalhando muito o nosso fluxo. Obrigado por resolver!',
        likes: 15,
        isLiked: false,
      }
    ]
  },
];

// Dados fictícios para os cards de empresa
const EMPRESA_DATA: Post[] = [
  {
    id: '101',
    author: {
      name: 'Tech Solutions',
      avatar: getAvatarUri('Tech Solutions'),
    },
    title: 'Tech Solutions',
    description: 'Lançamos a nova versão do nosso app empresarial',
    image: 'https://picsum.photos/800/600?random=7',
    link: 'https://techsolutions.com/nova-versao',
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
    allFeedbacks: [
      {
        id: '201',
        author: {
          name: 'Sandra Marketing',
          avatar: getAvatarUri('Sandra Marketing'),
        },
        content: 'Essa atualização vai revolucionar o mercado!',
        likes: 32,
        isLiked: false,
      },
      {
        id: '202',
        author: {
          name: 'Marcos Diretor',
          avatar: getAvatarUri('Marcos Diretor'),
        },
        content: 'Estamos recebendo feedbacks muito positivos dos clientes!',
        likes: 24,
        isLiked: false,
      }
    ]
  },
  {
    id: '102',
    author: {
      name: 'Cloud Systems',
      avatar: getAvatarUri('Cloud Systems'),
    },
    title: 'Cloud Systems',
    description: 'Nova estratégia de marketing digital implementada',
    image: 'https://picsum.photos/800/600?random=8',
    link: 'https://cloudsystems.com/marketing',
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
    allFeedbacks: [
      {
        id: '202',
        author: {
          name: 'Marcos Diretor',
          avatar: getAvatarUri('Marcos Diretor'),
        },
        content: 'Estamos observando um aumento significativo nas conversões!',
        likes: 45,
        isLiked: false,
      },
      {
        id: '203',
        author: {
          name: 'Carla Finanças',
          avatar: getAvatarUri('Carla Finanças'),
        },
        content: 'Os resultados financeiros já estão aparecendo. Excelente trabalho da equipe!',
        likes: 38,
        isLiked: false,
      }
    ]
  },
  {
    id: '103',
    author: {
      name: 'Innovate Inc',
      avatar: getAvatarUri('Innovate Inc'),
    },
    title: 'Innovate Inc',
    description: 'Resultados do primeiro trimestre superaram expectativas',
    image: 'https://picsum.photos/800/600?random=9',
    link: 'https://innovateinc.com/resultados-q1',
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
    allFeedbacks: [
      {
        id: '203',
        author: {
          name: 'Carla Finanças',
          avatar: getAvatarUri('Carla Finanças'),
        },
        content: 'Os investidores estão muito satisfeitos com esses números!',
        likes: 56,
        isLiked: false,
      },
      {
        id: '204',
        author: {
          name: 'Ricardo Expansão',
          avatar: getAvatarUri('Ricardo Expansão'),
        },
        content: 'Isso nos dá confiança para expandir para novos mercados!',
        likes: 41,
        isLiked: false,
      }
    ]
  },
  {
    id: '104',
    author: {
      name: 'Global Tech',
      avatar: getAvatarUri('Global Tech'),
    },
    title: 'Global Tech',
    description: 'Expandimos operações para três novos países',
    image: 'https://picsum.photos/800/600?random=10',
    link: 'https://globaltech.com/expansao',
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
    allFeedbacks: [
      {
        id: '204',
        author: {
          name: 'Ricardo Expansão',
          avatar: getAvatarUri('Ricardo Expansão'),
        },
        content: 'Uma jogada estratégica impressionante para o mercado internacional',
        likes: 78,
        isLiked: false,
      },
      {
        id: '205',
        author: {
          name: 'Amanda Inovação',
          avatar: getAvatarUri('Amanda Inovação'),
        },
        content: 'Estou ansiosa para ver como nossos produtos serão recebidos nesses novos mercados!',
        likes: 65,
        isLiked: false,
      }
    ]
  },
  {
    id: '105',
    author: {
      name: 'Future Labs',
      avatar: getAvatarUri('Future Labs'),
    },
    title: 'Future Labs',
    description: 'Nova patente registrada para tecnologia de IA',
    image: 'https://picsum.photos/800/600?random=11',
    link: 'https://futurelabs.com/ia-patent',
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
    allFeedbacks: [
      {
        id: '205',
        author: {
          name: 'Amanda Inovação',
          avatar: getAvatarUri('Amanda Inovação'),
        },
        content: 'Esta tecnologia vai mudar completamente o setor!',
        likes: 91,
        isLiked: false,
      },
      {
        id: '206',
        author: {
          name: 'Gustavo Tecnologia',
          avatar: getAvatarUri('Gustavo Tecnologia'),
        },
        content: 'Anos de pesquisa finalmente dando frutos. Parabéns a toda equipe!',
        likes: 82,
        isLiked: false,
      }
    ]
  },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('time'); // 'time' ou 'empresa'
  const [timeData, setTimeData] = useState<Post[]>([...TIME_DATA]);
  const [empresaData, setEmpresaData] = useState<Post[]>([...EMPRESA_DATA]);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [selectedPostContent, setSelectedPostContent] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { colors } = useTheme();

  // Função para lidar com curtidas
  const handleLike = (cardId: string, isFromFeedback = false) => {
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
  const handleFavorite = (cardId: string) => {
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
  const handleShare = async (tarefa: Post) => {
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
  const handleComments = (cardId: string) => {
    const currentData = activeTab === 'time' ? timeData : empresaData;
    const selectedPost = currentData.find(card => card.id === cardId);
    
    if (selectedPost) {
      setSelectedPostContent(selectedPost.description);
      setIsChatModalVisible(true);
    }
  };

  const renderCard = (tarefa: Post, index: number) => {
    const cardHeight = 200;
    const position = index * cardHeight;
    
    const inputRange = [
      position - 300,
      position - 100,
      position + 100,
      position + 300
    ];
    
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.98, 1, 1, 0.98],
      extrapolate: 'clamp',
    });
    
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
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => router.push({
            pathname: '/card-details',
            params: { cardId: tarefa.id, cardType: activeTab }
          })}
        >
          <View style={[styles.card, { backgroundColor: colors.background50 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.authorContainer}>
                <Image source={tarefa.author.avatar} style={styles.avatar} />
                <Text style={[styles.authorName, { color: colors.titlePrimary }]}>{tarefa.title}</Text>
              </View>
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleFavorite(tarefa.id);
                }}
              >
                <Ionicons 
                  name={tarefa.isFavorite ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{tarefa.description}</Text>
            
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleLike(tarefa.id);
                }}
              >
                <Ionicons 
                  name={tarefa.isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
                {tarefa.likes > 0 && (
                  <Text style={[styles.likeCount, { color: colors.primary }]}>{tarefa.likes}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleComments(tarefa.id);
                }}
              >
                <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
                {tarefa.comments > 0 && (
                  <Text style={[styles.commentCount, { color: colors.primary }]}>{tarefa.comments}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleShare(tarefa);
                }}
              >
                <Ionicons name="paper-plane-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={[styles.feedbackContainer, { backgroundColor: colors.background50 }]}>
          <View style={styles.feedbackContent}>
            <Image source={tarefa.topFeedback.author.avatar} style={styles.feedbackAvatar} />
            <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>{tarefa.topFeedback.content}</Text>
            <TouchableOpacity 
              style={styles.feedbackLikeButton}
              onPress={() => handleLike(tarefa.topFeedback.id, true)}
            >
              <Ionicons 
                name={tarefa.topFeedback.isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={colors.primary} 
              />
              <Text style={[styles.feedbackLikeCount, { color: colors.primary }]}>{tarefa.topFeedback.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Seleciona o conjunto de dados correto com base na aba ativa
  const currentData = activeTab === 'time' ? timeData : empresaData;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#2C1810' ? 'light' : 'dark'} />
      
      {/* Header com abas */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.titlePrimary }]}>Feed</Text>
        <TouchableOpacity 
          style={[styles.chatButton, { backgroundColor: colors.background50 }]}
          onPress={() => setIsChatModalVisible(true)}
        >
          <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Abas de seleção */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'time' && { 
              borderBottomWidth: 2,
              borderBottomColor: colors.primary
            }
          ]}
          onPress={() => setActiveTab('time')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'time' ? colors.primary : colors.textSecondary }
            ]}
          >
            Time
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'empresa' && { 
              borderBottomWidth: 2,
              borderBottomColor: colors.primary
            }
          ]}
          onPress={() => setActiveTab('empresa')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'empresa' ? colors.primary : colors.textSecondary }
            ]}
          >
            Empresa
          </Text>
        </TouchableOpacity>
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
      <ChatModal 
        visible={isChatModalVisible}
        onClose={() => {
          setIsChatModalVisible(false);
          setSelectedPostContent('');
        }}
        postContent={selectedPostContent}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 20,
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
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
  },
  bookmarkButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 14,
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
    fontWeight: '500',
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: -8,
    zIndex: -1,
    marginLeft: 20,
    marginRight: 20,
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
  },
  feedbackLikeButton: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackLikeCount: {
    marginLeft: 2,
    fontSize: 10,
    fontWeight: '500',
  },
  scrollEndSpacer: {
    height: 80, // Espaço extra no final da lista para melhorar a experiência de rolagem
  }
}); 