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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ChatModal } from '@/components/ChatModal';
import { useTheme } from '@/contexts/ThemeContext';
import { db, auth } from '@/services/firebase/firebase.config';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { observarPontosUsuario, calcularMaximoPontosPorDia } from '@/services/firebase/fetchMaxPoints';
import Header from '../components/Header';

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
  usuarioMarcado?: {
    id: string;
    nome: string;
  };
  userId: string;
  tipo: string;
  empresaId: string;
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('empresa');
  const [timeData, setTimeData] = useState<Post[]>([]);
  const [empresaData, setEmpresaData] = useState<any[]>([]); // Agora será array de usuários
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [selectedPostContent, setSelectedPostContent] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [maximoPontosPorDia, setMaximoPontosPorDia] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const setupUserData = async () => {
      try {
        // Buscar dados do usuário para obter o empresaId
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        
        // Configurar observador de pontos
        const unsubscribe = observarPontosUsuario(user.uid, (novosPontos) => {
          setUserPoints(novosPontos);
        });

        // Calcular máximo de pontos por dia
        const empresaId = userData.tipo === 'empresa' ? user.uid : userData.empresaId;
        if (empresaId) {
          const maximoDiario = await calcularMaximoPontosPorDia(empresaId);
          setMaximoPontosPorDia(maximoDiario);
        }

        return unsubscribe;
      } catch (error) {
        console.error("Erro ao configurar dados do usuário:", error);
      }
    };

    const unsubscribe = setupUserData();

    // Limpar o observador quando o componente for desmontado
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, []);

  // Função para buscar os membros da empresa
  const fetchEmpresaMembers = async (empresaId: string) => {
    try {
      // Buscar clientes aprovados
      const q = query(
        collection(db, "users"),
        where("empresaId", "==", empresaId),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);
      const members = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        avatar: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.data().nome)}&background=8B4513&color=fff` }
      }));

      // Buscar o usuário do tipo empresa
      const empresaDoc = await getDocs(query(
        collection(db, "users"),
        where("tipo", "==", "empresa"),
        where("_id", "==", empresaId)
      ));
      const empresaUser = empresaDoc.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        avatar: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.data().nome)}&background=8B4513&color=fff` }
      }));

      const allMembers = [...members, ...empresaUser];
      setEmpresaData(allMembers);
      console.log("Membros da empresa encontrados (incluindo empresa):", allMembers.length);
    } catch (error) {
      console.error("Erro ao buscar membros da empresa:", error);
      Alert.alert("Erro", "Não foi possível carregar os membros da empresa");
    }
  };

  // Função para buscar os posts do feed
  const fetchFeedPosts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Buscar dados do usuário para obter o empresaId
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      // Se for empresa, usa o próprio uid, senão usa o empresaId
      const empresaId = userData.tipo === 'empresa' ? user.uid : userData.empresaId;

      if (!empresaId) {
        console.log("EmpresaId não encontrado");
        return;
      }

      // Buscar membros da empresa
      await fetchEmpresaMembers(empresaId);

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
          console.log("Post data completo:", {
            id: doc.id,
            ...data,
            empresaId,
            userData
          });

          const allFeedbacks = data.allFeedbacks?.map((feedback: any) => ({
            ...feedback,
            isLiked: false
          })) || [];

          // Determinar o topFeedback
          let topFeedback: Feedback | undefined;
          if (allFeedbacks.length > 0) {
            const sortedByLikes = [...allFeedbacks].sort((a, b) => b.likes - a.likes);
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
            likes: data.likes || 0,
            isLiked: false,
            isFavorite: false,
            comments: allFeedbacks.length,
            allFeedbacks,
            topFeedback,
            usuarioMarcado: data.usuarioMarcado || undefined,
            userId: data.userId,
            tipo: data.tipo,
            empresaId: data.empresaId
          };
        });

        console.log("Total de posts encontrados:", posts.length);
        setTimeData(posts);
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFeedPosts();
    } catch (error) {
      console.error("Erro ao atualizar posts:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupFeed = async () => {
      unsubscribe = await fetchFeedPosts();
    };

    setupFeed();

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
          const updatedFeedbacks = card.allFeedbacks.map((feedback: Feedback) => {
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

  // Seleciona o conjunto de dados correto com base na aba ativa
  const currentData = activeTab === 'empresa' ? timeData : empresaData;

  const renderCard = (item: any, index: number) => {
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

    if (activeTab === 'time') {
      // Renderizar card de membro da empresa
      return (
        <Animated.View 
          key={item.id} 
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
          <View style={[styles.card, { backgroundColor: colors.background50 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.authorContainer}>
                <Image source={item.avatar} style={styles.avatar} />
                <View>
                  <Text 
                    style={[styles.authorName, { color: colors.titlePrimary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.nome}
                  </Text>
                  <Text 
                    style={[styles.authorEmail, { color: colors.textSecondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      );
    }

    // Renderizar card de post (aba Empresa)
    return (
      <Animated.View 
        key={item.id} 
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
              cardId: item.id,
              cardType: activeTab,
              cardData: JSON.stringify({
                id: item.id,
                author: item.author,
                title: item.title,
                description: item.description,
                image: item.image,
                link: item.link,
                likes: item.likes,
                isLiked: item.isLiked,
                isFavorite: item.isFavorite,
                comments: item.comments,
                allFeedbacks: item.allFeedbacks
              })
            }
          })}
        >
          <View style={[styles.card, { backgroundColor: colors.background50 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.authorContainer}>
                <Image source={item.author.avatar} style={styles.avatar} />
                <Text 
                  style={[styles.authorName, { color: colors.titlePrimary }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleFavorite(item.id);
                }}
              >
                <Ionicons 
                  name={item.isFavorite ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            {item.usuarioMarcado && (
              <View style={styles.usuarioMarcadoContainer}>
                <Ionicons name="at" size={16} color={colors.primary} />
                <Text style={[styles.usuarioMarcadoText, { color: colors.primary }]}>
                  {item.usuarioMarcado.nome}
                </Text>
              </View>
            )}
            
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{item.description}</Text>
            
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleLike(item.id);
                }}
              >
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
                {item.likes > 0 && (
                  <Text style={[styles.likeCount, { color: colors.primary }]}>{item.likes}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleComments(item.id);
                }}
              >
                <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
                {item.comments > 0 && (
                  <Text style={[styles.commentCount, { color: colors.primary }]}>{item.comments}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleShare(item);
                }}
              >
                <Ionicons name="paper-plane-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={[styles.feedbackContainer, { backgroundColor: colors.background50 }]}>
          {item.topFeedback ? (
            <View style={styles.feedbackContent}>
              <Image 
                source={item.topFeedback.isAnonimo ? 
                  getAvatarUri('Anônimo') : 
                  getAvatarUri(item.topFeedback.userName || 'Usuário')} 
                style={styles.feedbackAvatar} 
              />
              <View style={styles.feedbackTextContainer}>
                <Text style={[styles.feedbackAuthor, { color: colors.textPrimary }]}>
                  {item.topFeedback.isAnonimo ? 'Anônimo' : item.topFeedback.userName}
                </Text>
                <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
                  {item.topFeedback.content}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.feedbackLikeButton}
                onPress={() => handleLike(item.topFeedback!.id, true)}
              >
                <Ionicons 
                  name={item.topFeedback.isLiked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={colors.primary} 
                />
                <Text style={[styles.feedbackLikeCount, { color: colors.primary }]}>
                  {item.topFeedback.likes}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#2C1810' ? 'light' : 'dark'} />
      <Header  pontos={userPoints} maximoPontosPorDia={maximoPontosPorDia} />
      
      {/* Abas de seleção */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}> 
        <View style={styles.tabsWrapper}>
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
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {currentData.map((item, index) => renderCard(item, index))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  tab: {
    paddingVertical: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
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
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  usuarioMarcadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  usuarioMarcadoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  authorEmail: {
    fontSize: 14,
    marginTop: 2,
  },
}); 