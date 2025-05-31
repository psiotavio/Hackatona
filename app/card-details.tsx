import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase/firebase.config';

// Função para gerar avatar com as iniciais do nome
const getAvatarUri = (name: string) => {
  const formattedName = encodeURIComponent(name);
  return { uri: `https://ui-avatars.com/api/?name=${formattedName}&background=8B4513&color=fff` };
};

interface Feedback {
  id: string;
  author?: {
    name: string;
    avatar: any;
  };
  nome?: string | null;
  isAnonimo?: boolean;
  content: string;
  likes: number;
  isLiked: boolean;
  userId?: string | null;
  createdAt?: Date;
}

interface Post {
  id: string;
  author?: {
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
  topFeedback?: Feedback;
  allFeedbacks: Feedback[];
  nome?: string | null;
  userId?: string | null;
  empresaId?: string;
  nomeEmpresa?: string;
  createdAt?: Date;
}

export default function CardDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const { cardId, cardType, cardData } = params;
  
  const [card, setCard] = useState<Post | null>(null);
  const [newFeedback, setNewFeedback] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (cardData) {
      try {
        const parsedData = JSON.parse(cardData as string);
        console.log("Dados do card recebidos:", parsedData);
        
        const fetchUserData = async () => {
          try {
            // Processar feedbacks
            const processedFeedbacks = await Promise.all(parsedData.allFeedbacks.map(async (feedback: any) => {
              let nome = 'Anônimo';
              
              if (!feedback.isAnonimo && feedback.userId) {
                try {
                  const userDocRef = await getDoc(doc(db, "users", feedback.userId));
                  if (userDocRef.exists()) {
                    const userData = userDocRef.data();
                    nome = userData.nome || 'Usuário';
                  }
                } catch (error) {
                  console.error("Erro ao buscar dados do usuário:", error);
                }
              }

              return {
                ...feedback,
                nome,
                isLiked: false
              };
            }));

            // Processar autor do post
            let nomeAutor = 'Anônimo';

            if (!parsedData.isAnonimo && parsedData.userId) {
              try {
                const authorDocRef = await getDoc(doc(db, "users", parsedData.userId));
                if (authorDocRef.exists()) {
                  const authorData = authorDocRef.data();
                  nomeAutor = authorData.nome || 'Usuário';
                }
              } catch (error) {
                console.error("Erro ao buscar dados do autor:", error);
              }
            }

            const updatedCard = {
              ...parsedData,
              nome: nomeAutor,
              allFeedbacks: processedFeedbacks
            };

            console.log("Card atualizado com sucesso:", updatedCard);
            setCard(updatedCard);
          } catch (error) {
            console.error("Erro ao processar dados do card:", error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do post');
            router.back();
          }
        };

        fetchUserData();
      } catch (error) {
        console.error('Erro ao parsear dados do card:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do post');
        router.back();
      }
    } else {
      Alert.alert('Erro', 'Post não encontrado');
      router.back();
    }
  }, [cardData]);

  const handleLike = (feedbackId: string) => {
    if (!card) return;
    
    const updatedFeedbacks = card.allFeedbacks.map(feedback => {
      if (feedback.id === feedbackId) {
        const newLikes = feedback.isLiked ? feedback.likes - 1 : feedback.likes + 1;
        return { ...feedback, likes: newLikes, isLiked: !feedback.isLiked };
      }
      return feedback;
    });
    
    setCard({ ...card, allFeedbacks: updatedFeedbacks });
  };

  const handleCardLike = () => {
    if (!card) return;
    
    const newLikes = card.isLiked ? card.likes - 1 : card.likes + 1;
    setCard({ ...card, likes: newLikes, isLiked: !card.isLiked });
  };

  const handleCardFavorite = () => {
    if (!card) return;
    
    setCard({ ...card, isFavorite: !card.isFavorite });
  };

  const handleShare = async (isCard = true, feedback: Feedback | null = null) => {
    try {
      if (!card) return;
      
      let message = '';
      let title = '';
      
      if (isCard) {
        // Compartilhar o card
        message = `${card.title}: ${card.description}`;
        if (card.link) {
          message += `\n\nSaiba mais: ${card.link}`;
        }
        title = `Compartilhar post de ${card.author?.name || 'Usuário'}`;
      } else if (feedback) {
        // Compartilhar um feedback específico
        const authorName = feedback.author?.name || feedback.nome || 'Anônimo';
        message = `Comentário de ${authorName} sobre o post "${card.title}":\n\n"${feedback.content}"`;
        title = `Compartilhar comentário`;
      }
      
      const result = await Share.share({
        message,
        title,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Compartilhado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar este conteúdo');
    }
  };

  const handleReport = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setReportModalVisible(true);
  };

  const submitReport = () => {
    if (!selectedFeedback || !reportReason.trim()) {
      Alert.alert('Erro', 'Por favor, informe o motivo da denúncia');
      return;
    }
    
    // Aqui você implementaria a lógica para enviar a denúncia
    Alert.alert(
      'Denúncia enviada',
      'Agradecemos sua denúncia. Nossa equipe irá analisar o conteúdo reportado.'
    );
    
    setReportModalVisible(false);
    setReportReason('');
    setSelectedFeedback(null);
  };

  const submitFeedback = () => {
    if (!card || !newFeedback.trim()) return;
    
    const user = { name: 'Você', avatar: getAvatarUri('Você') };
    
    const newFeedbackObj: Feedback = {
      id: `new-${Date.now()}`,
      content: newFeedback.trim(),
      likes: 0,
      isLiked: false,
      author: user,
      isAnonimo: false,
      nome: 'Você',
      userId: 'current-user', // Idealmente, deveria ser o ID do usuário atual
      createdAt: new Date()
    };
    
    setCard({
      ...card,
      comments: card.comments + 1,
      allFeedbacks: [newFeedbackObj, ...card.allFeedbacks]
    });
    
    setNewFeedback('');
    
    // Aqui você poderia adicionar uma chamada para salvar o feedback no Firebase
  };

  if (!card) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textPrimary }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.titlePrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.titlePrimary }]}>Detalhes do Post</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Card principal */}
        <View style={[styles.cardContainer, { backgroundColor: colors.background50 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.authorContainer}>
              <Image 
                source={card.author?.avatar || getAvatarUri('Usuário')} 
                style={styles.avatar} 
              />
              <Text 
                style={[styles.authorName, { color: colors.titlePrimary }]}
                numberOfLines={2}
              >
                {card.title}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={handleCardFavorite}
            >
              <Ionicons 
                name={card.isFavorite ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.cardDescription, { color: colors.textPrimary }]}>{card.description}</Text>
          
          {/* Imagem (se existir) */}
          {card.image && (
            <Image 
              source={{ uri: card.image }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}
          
          {/* Link (se existir) */}
          {card.link && (
            <TouchableOpacity 
              style={[styles.linkContainer, { backgroundColor: colors.primary + '20' }]}
              onPress={() => {
                // Aqui você implementaria a lógica para abrir o link
                Alert.alert('Link', `Abrir ${card.link} no navegador?`);
              }}
            >
              <Ionicons name="link-outline" size={18} color={colors.primary} />
              <Text 
                style={[styles.linkText, { color: colors.primary }]} 
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {card.link}
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCardLike}
            >
              <Ionicons 
                name={card.isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={colors.primary} 
              />
              {card.likes > 0 && (
                <Text style={[styles.actionCount, { color: colors.primary }]}>{card.likes}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
              {card.comments > 0 && (
                <Text style={[styles.actionCount, { color: colors.primary }]}>{card.comments}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShare()}
            >
              <Ionicons name="paper-plane-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Seção de comentários */}
        <View style={styles.feedbackSection}>
          <Text style={[styles.sectionTitle, { color: colors.titlePrimary }]}>Comentários</Text>
          
          {/* Input para novo comentário */}
          <View style={styles.newFeedbackContainer}>
            <TextInput
              style={[
                styles.feedbackInput,
                { 
                  backgroundColor: colors.background, 
                  color: colors.textPrimary,
                  borderColor: colors.border 
                }
              ]}
              placeholder="Adicione um comentário..."
              placeholderTextColor={colors.textSecondary}
              value={newFeedback}
              onChangeText={setNewFeedback}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: newFeedback.trim() ? colors.primary : colors.border,
                  opacity: newFeedback.trim() ? 1 : 0.7 
                }
              ]}
              onPress={submitFeedback}
              disabled={!newFeedback.trim()}
            >
              <Ionicons name="send" size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
          
          {/* Lista de comentários */}
          {card.allFeedbacks.map((feedback, index) => (
            <View 
              key={feedback.id} 
              style={[
                styles.feedbackItem, 
                { backgroundColor: colors.background }
              ]}
            >
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackAuthor}>
                  <Image 
                    source={getAvatarUri(feedback.nome || 'Anônimo')} 
                    style={styles.feedbackAvatar} 
                  />
                  <Text 
                    style={[styles.feedbackAuthorName, { color: colors.titlePrimary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {feedback.nome || 'Anônimo'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => handleReport(feedback)}
                >
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.feedbackContent, { color: colors.textPrimary }]}>
                {feedback.content}
              </Text>
              
              <View style={styles.feedbackActions}>
                <TouchableOpacity 
                  style={styles.feedbackAction}
                  onPress={() => handleLike(feedback.id)}
                >
                  <Ionicons 
                    name={feedback.isLiked ? "heart" : "heart-outline"} 
                    size={18} 
                    color={colors.primary} 
                  />
                  {feedback.likes > 0 && (
                    <Text style={[styles.feedbackCount, { color: colors.primary }]}>
                      {feedback.likes}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.feedbackAction}
                  onPress={() => handleShare(false, feedback)}
                >
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Modal de denúncia */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.titlePrimary }]}>
              Denunciar comentário
            </Text>
            
            <Text style={[styles.modalLabel, { color: colors.textPrimary }]}>
              Por que você está denunciando este comentário?
            </Text>
            
            <TextInput
              style={[
                styles.reportInput,
                { 
                  backgroundColor: colors.background50, 
                  color: colors.textPrimary,
                  borderColor: colors.border 
                }
              ]}
              placeholder="Descreva o motivo da denúncia..."
              placeholderTextColor={colors.textSecondary}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={{ color: colors.textPrimary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={submitReport}
              >
                <Text style={{ color: colors.background }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    margin: 16,
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
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: '85%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  bookmarkButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  linkText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
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
  actionCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newFeedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  feedbackInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '90%',
  },
  feedbackAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  feedbackAuthorName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  feedbackContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  feedbackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  feedbackCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  reportInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
}); 