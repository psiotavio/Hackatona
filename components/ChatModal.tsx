import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { generateFeedbackQuestions, generateFeedbackAnalysis } from '@/services/openai';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface FeedbackQuestion {
  question: string;
  options: string[];
}

interface FeedbackResponse {
  question: string;
  answer: string;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  postContent?: string;
}

export function ChatModal({ visible, onClose, postContent }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [showLengthOptions, setShowLengthOptions] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (visible && postContent) {
      initializeFeedback();
    }
  }, [visible, postContent]);

  const initializeFeedback = async () => {
    if (!postContent) return;
    
    setIsLoading(true);
    try {
      const feedbackQuestions = await generateFeedbackQuestions(postContent);
      setQuestions(feedbackQuestions);
      setCurrentQuestionIndex(0);
      setResponses([]);
      setMessages([]);
      
      // Adiciona a primeira pergunta
      addMessage(feedbackQuestions[0].question, false);
    } catch (error) {
      console.error('Erro ao inicializar feedback:', error);
      addMessage('Desculpe, ocorreu um erro ao gerar as perguntas.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      isUser,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionSelect = async (option: string) => {
    if (isLoading) return;

    addMessage(option, true);
    
    // Salva a resposta
    const currentQuestion = questions[currentQuestionIndex];
    setResponses(prev => [...prev, {
      question: currentQuestion.question,
      answer: option
    }]);

    // Se for a última pergunta, mostra as opções de tamanho
    if (currentQuestionIndex === questions.length - 1) {
      setShowLengthOptions(true);
      addMessage('Escolha o tamanho do seu feedback:', false);
    } else {
      // Avança para a próxima pergunta
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      addMessage(questions[nextIndex].question, false);
    }
  };

  const handleLengthSelect = async (length: number) => {
    setIsLoading(true);
    try {
      const feedback = await generateFeedbackAnalysis(responses, length);
      addMessage(feedback, false);
      setShowLengthOptions(false);
      // Adiciona o botão de publicar após o feedback
      addMessage('publicar_button', false);
      // Limpa as opções de múltipla escolha
      setQuestions([]);
    } catch (error) {
      console.error('Erro ao gerar feedback:', error);
      addMessage('Desculpe, ocorreu um erro ao gerar o feedback.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    handleOptionSelect(inputText.trim());
    setInputText('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Feedback Criativo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messagesContainer}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage,
                { backgroundColor: message.isUser ? colors.primary : colors.border }
              ]}
            >
              {message.text === 'publicar_button' ? (
                <TouchableOpacity
                  style={[styles.publishButton, { backgroundColor: colors.primary }]}
                  onPress={onClose}
                >
                  <Text style={styles.publishButtonText}>Publicar Feedback</Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    { color: message.isUser ? '#FFFFFF' : colors.textPrimary }
                  ]}
                >
                  {message.text}
                </Text>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.aiMessage, { backgroundColor: colors.border }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </ScrollView>

        {showLengthOptions ? (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleLengthSelect(350)}
              disabled={isLoading}
            >
              <Text style={styles.optionText}>Feedback Detalhado (350 caracteres)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleLengthSelect(200)}
              disabled={isLoading}
            >
              <Text style={styles.optionText}>Feedback Médio (200 caracteres)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleLengthSelect(100)}
              disabled={isLoading}
            >
              <Text style={styles.optionText}>Feedback Curto (100 caracteres)</Text>
            </TouchableOpacity>
          </View>
        ) : questions.length > 0 && currentQuestionIndex < questions.length && (
          <View style={styles.optionsContainer}>
            {questions[currentQuestionIndex]?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: colors.primary }]}
                onPress={() => handleOptionSelect(option)}
                disabled={isLoading}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.border,
              color: colors.textPrimary,
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua resposta..."
            placeholderTextColor={colors.textSecondary}
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              isLoading && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  optionsContainer: {
    padding: 16,
    gap: 8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  optionText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  publishButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 