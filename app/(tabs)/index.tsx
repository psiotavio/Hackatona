import React, { useState, useRef, useEffect } from 'react';
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
import { db, auth } from '@/services/firebase/firebase.config';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

// Função para gerar avatar com as iniciais do nome
const getAvatarUri = (name: string) => {
  const formattedName = encodeURIComponent(name);
  return { uri: `https://ui-avatars.com/api/?name=${formattedName}&background=8B4513&color=fff` };
};

interface Feedback {
  id: string;
  userId: string | null;
  userName: string | null;
  isAnonimo: boolean;
  content: string;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
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
  allFeedbacks: Feedback[];
  topFeedback?: Feedback;
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('time');
  const [timeData, setTimeData] = useState<Post[]>([]);
  const [empresaData, setEmpresaData] = useState<Post[]>([]);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [selectedPostContent, setSelectedPostContent] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { colors } = useTheme();

  // Função para buscar os posts do feed
  const fetchFeedPosts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Buscar dados do usuário para obter o empresaId
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const empresaId = userData.empresaId;

      // Buscar posts relacionados à empresa
      const postsQuery = query(
        collection(db, "feedback"),
        where("empresaId", "==", empresaId),
        orderBy("createdAt", "desc")
      );

      // Usar onSnapshot para atualizações em tempo real
      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const posts = snapshot.docs.map(doc => {
          const data = doc.data();
          const allFeedbacks = data.allFeedbacks?.map((feedback: any) => ({
            ...feedback,
            isLiked: false
          })) || [];

          // Determinar o topFeedback
          let topFeedback: Feedback | undefined;
          if (allFeedbacks.length > 0) {
            // Primeiro ordena por número de curtidas (decrescente)
            const sortedByLikes = [...allFeedbacks].sort((a, b) => b.likes - a.likes);
            // Se houver empate no número de curtidas, pega o mais recente
            const maxLikes = sortedByLikes[0].likes;
            const topLikedFeedbacks = sortedByLikes.filter(f => f.likes === maxLikes);
            topFeedback = topLikedFeedbacks.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
          }

          return {
            id: doc.id,
            author: {
              name: data.userName || 'Anônimo',
              avatar: getAvatarUri(data.userName || 'Anônimo'),
            },
            title: data.titulo,
            description: data.descricao,
            image: data.imagem,
            link: data.link,
            likes: 0,
            isLiked: false,
            isFavorite: false,
            comments: allFeedbacks.length,
            allFeedbacks,
            topFeedback
          };
        });

        setTimeData(posts);
        setEmpresaData(posts);
      }, (error) => {
        console.error("Erro ao observar posts:", error);
        Alert.alert("Erro", "Não foi possível carregar os posts em tempo real");
      });

      return unsubscribe;
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      Alert.alert("Erro", "Não foi possível carregar os posts");
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupFeed = async () => {
      unsubscribe = await fetchFeedPosts();
    };

    setupFeed();

    // Limpar o listener quando o componente for desmontado
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Função para lidar com curtidas
  const handleLike = (cardId: string, isFromFeedback = false) => {
    if (activeTab === 'time') {
      setTimeData(prev => prev.map(card => {
        if (isFromFeedback) {
          const updatedFeedbacks = card.allFeedbacks.map(feedback => {
            if (feedback.id === cardId) {
              return {
                ...feedback,
                likes: feedback.isLiked ? feedback.likes - 1 : feedback.likes + 1,
                isLiked: !feedback.isLiked
              };
            }
            return feedback;
          });
          return { ...card, allFeedbacks: updatedFeedbacks };
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
          const updatedFeedbacks = card.allFeedbacks.map(feedback => {
            if (feedback.id === cardId) {
              return {
                ...feedback,
                likes: feedback.isLiked ? feedback.likes - 1 : feedback.likes + 1,
                isLiked: !feedback.isLiked
              };
            }
            return feedback;
          });
          return { ...card, allFeedbacks: updatedFeedbacks };
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
            params: { 
              cardId: tarefa.id,
              cardType: activeTab,
              cardData: JSON.stringify({
                id: tarefa.id,
                author: tarefa.author,
                title: tarefa.title,
                description: tarefa.description,
                image: tarefa.image,
                link: tarefa.link,
                likes: tarefa.likes,
                isLiked: tarefa.isLiked,
                isFavorite: tarefa.isFavorite,
                comments: tarefa.comments,
                allFeedbacks: tarefa.allFeedbacks
              })
            }
          })}
        >
          <View style={[styles.card, { backgroundColor: colors.background50 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.authorContainer}>
                <Image source={tarefa.author.avatar} style={styles.avatar} />
                <Text 
                  style={[styles.authorName, { color: colors.titlePrimary }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {tarefa.title}
                </Text>
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
          {tarefa.topFeedback ? (
            <View style={styles.feedbackContent}>
              <Image 
                source={tarefa.topFeedback.isAnonimo ? 
                  getAvatarUri('Anônimo') : 
                  getAvatarUri(tarefa.topFeedback.userName || 'Usuário')} 
                style={styles.feedbackAvatar} 
              />
              <View style={styles.feedbackTextContainer}>
                <Text style={[styles.feedbackAuthor, { color: colors.textPrimary }]}>
                  {tarefa.topFeedback.isAnonimo ? 'Anônimo' : tarefa.topFeedback.userName}
                </Text>
                <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
                  {tarefa.topFeedback.content}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.feedbackLikeButton}
                onPress={() => handleLike(tarefa.topFeedback!.id, true)}
              >
                <Ionicons 
                  name={tarefa.topFeedback.isLiked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={colors.primary} 
                />
                <Text style={[styles.feedbackLikeCount, { color: colors.primary }]}>
                  {tarefa.topFeedback.likes}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.feedbackContent}>
              <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
                Seja o primeiro a comentar!
              </Text>
            </View>
          )}
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
        postId={selectedPostContent ? timeData.find(post => post.description === selectedPostContent)?.id : undefined}
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
    flex: 1,
    maxWidth: '85%',
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
    flex: 1,
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
  feedbackTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  feedbackAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  feedbackText: {
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