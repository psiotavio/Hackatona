import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/services/firebase/firebase.config';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, query, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { ChatModal } from '@/components/ChatModal';

export default function PublicQuestionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const qrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "publicQuestions", id as string), (doc) => {
      if (doc.exists()) {
        setQuestion({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        });
      } else {
        Alert.alert('Erro', 'Pergunta não encontrada');
        router.back();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) {
      Alert.alert('Erro', 'Por favor, digite uma resposta.');
      return;
    }

    try {
      setSubmitting(true);
      const responseData = {
        content: newResponse.trim(),
        createdAt: new Date(),
        isAnonimo: true,
      };

      await updateDoc(doc(db, "publicQuestions", id as string), {
        responses: arrayUnion(responseData)
      });

      setNewResponse('');
      Alert.alert('Sucesso', 'Resposta enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      Alert.alert('Erro', 'Não foi possível enviar sua resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveQRCode = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para salvar arquivos é necessária.');
        return;
      }

      const qrCodeData = await new Promise<string>((resolve) => {
        if (qrCodeRef.current) {
          qrCodeRef.current.toDataURL((data: string) => resolve(data));
        }
      });

      const fileUri = FileSystem.documentDirectory + 'qrcode.png';
      await FileSystem.writeAsStringAsync(fileUri, qrCodeData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Sucesso', 'QR Code salvo na galeria!');
      setShowQRCode(false);
    } catch (error) {
      console.error('Erro ao salvar QR Code:', error);
      Alert.alert('Erro', 'Não foi possível salvar o QR Code.');
    }
  };

  const handleShareQRCode = async () => {
    try {
      const qrCodeData = await new Promise<string>((resolve) => {
        if (qrCodeRef.current) {
          qrCodeRef.current.toDataURL((data: string) => resolve(data));
        }
      });

      const fileUri = FileSystem.documentDirectory + 'qrcode.png';
      await FileSystem.writeAsStringAsync(fileUri, qrCodeData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
      setShowQRCode(false);
    } catch (error) {
      console.error('Erro ao compartilhar QR Code:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o QR Code.');
    }
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    try {
      setSubmitting(true);
      const responseData = {
        content: feedback,
        createdAt: new Date(),
        isAnonimo: true,
        isAIFeedback: true
      };

      await updateDoc(doc(db, "publicQuestions", id as string), {
        responses: arrayUnion(responseData)
      });

      Alert.alert('Sucesso', 'Feedback enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      Alert.alert('Erro', 'Não foi possível enviar seu feedback.');
    } finally {
      setSubmitting(false);
      setShowChatModal(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.questionCard, { backgroundColor: colors.background50 }]}>
          <View style={styles.questionHeader}>
            <View style={styles.questionInfo}>
              <Text style={[styles.questionText, { color: colors.textPrimary }]}>
                {question?.question}
              </Text>
              <Text style={[styles.empresaName, { color: colors.textSecondary }]}>
                {question?.empresaName}
              </Text>
              <Text style={[styles.questionDate, { color: colors.textSecondary }]}>
                {question?.createdAt.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.qrCodeButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowQRCode(true)}
              >
                <Ionicons name="qr-code-outline" size={24} color={colors.background} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowChatModal(true)}
              >
                <Ionicons name="chatbubble-outline" size={24} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.responsesContainer}>
          <Text style={[styles.responsesTitle, { color: colors.titlePrimary }]}>
            Respostas ({question?.responses?.length || 0})
          </Text>

          {question?.responses?.length > 0 ? (
            question.responses.map((response: any, index: number) => (
              <View key={index} style={[styles.responseCard, { backgroundColor: colors.background50 }]}>
                <Text style={[styles.responseText, { color: colors.textPrimary }]}>
                  {response.content}
                </Text>
                <View style={styles.responseFooter}>
                  <Text style={[styles.responseDate, { color: colors.textSecondary }]}>
                    {new Date(response.createdAt.toDate()).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.responseAuthor, { color: colors.textSecondary }]}>
                    {response.isAnonimo ? 'Anônimo' : response.userName || 'Usuário'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Seja o primeiro a responder!
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: colors.background50 }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background,
            color: colors.textPrimary,
            borderColor: colors.border
          }]}
          placeholder="Digite sua resposta..."
          placeholderTextColor={colors.textSecondary}
          value={newResponse}
          onChangeText={setNewResponse}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: newResponse.trim() ? colors.primary : colors.border,
            opacity: newResponse.trim() ? 1 : 0.7
          }]}
          onPress={handleSubmitResponse}
          disabled={!newResponse.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Ionicons name="send" size={24} color={colors.background} />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de QR Code */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQRCode}
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.titlePrimary }]}>
                QR Code da Pergunta
              </Text>
              <TouchableOpacity
                onPress={() => setShowQRCode(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeContainer}>
              <QRCode
                value={`https://hackabomba.netlify.app/?id=${id}`}
                size={200}
                backgroundColor={colors.background}
                color={colors.textPrimary}
                getRef={(ref) => (qrCodeRef.current = ref)}
              />
            </View>

            <View style={styles.qrCodeActions}>
              <TouchableOpacity
                style={[styles.qrCodeButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveQRCode}
              >
                <Ionicons name="save-outline" size={24} color={colors.background} />
                <Text style={[styles.qrCodeButtonText, { color: colors.background }]}>
                  Salvar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qrCodeButton, { backgroundColor: colors.primary }]}
                onPress={handleShareQRCode}
              >
                <Ionicons name="share-outline" size={24} color={colors.background} />
                <Text style={[styles.qrCodeButtonText, { color: colors.background }]}>
                  Compartilhar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Chat com IA */}
      <ChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        postContent={question?.question}
        postId={id as string}
        onFeedbackSubmit={handleFeedbackSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  questionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionInfo: {
    flex: 1,
    marginRight: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  empresaName: {
    fontSize: 14,
    marginBottom: 4,
  },
  questionDate: {
    fontSize: 12,
  },
  responsesContainer: {
    padding: 16,
  },
  responsesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  responseCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  responseText: {
    fontSize: 16,
    marginBottom: 8,
  },
  responseDate: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  qrCodeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  qrCodeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  qrCodeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  responseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseAuthor: {
    fontSize: 12,
  },
}); 