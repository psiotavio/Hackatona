import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const router = useRouter();
  const { colors, currentTheme } = useTheme();

  const handleLogin = () => {
    if (email && senha) {
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  const handleEsqueceuSenha = () => {
    setModalVisible(true);
  };

  const handleEnviarRecuperacao = () => {
    if (emailRecuperacao.trim() === '') {
      Alert.alert('Erro', 'Por favor, insira seu e-mail.');
      return;
    }
    
    Alert.alert(
      'E-mail enviado',
      'Um link de recuperação foi enviado para o seu e-mail.',
      [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            setEmailRecuperacao('');
          },
        },
      ]
    );
  };

  const handleRegistrar = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={currentTheme === 'dark' ? require('../assets/images/logos/logoVertical-light.png') : require('../assets/images/logos/logoVertical-Brown.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background50,
                borderColor: colors.border,
                color: colors.textPrimary
              }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={[styles.passwordContainer, { 
              backgroundColor: colors.background50,
              borderColor: colors.border
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.textPrimary }]}
                placeholder="Senha"
                placeholderTextColor={colors.textSecondary}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Ionicons 
                  name={mostrarSenha ? "eye-off" : "eye"} 
                  size={24} 
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={handleEsqueceuSenha}
              style={styles.forgotPasswordLink}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { color: colors.background }]}>Entrar</Text>
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.textPrimary }]}>Não possui conta? </Text>
              <TouchableOpacity onPress={handleRegistrar}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Registre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.background50 }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Recuperação de Senha</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                  Insira seu e-mail cadastrado para receber as instruções de recuperação de senha.
                </Text>
                
                <TextInput
                  style={[styles.modalInput, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={emailRecuperacao}
                  onChangeText={setEmailRecuperacao}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleEnviarRecuperacao}
                >
                  <Text style={[styles.modalButtonText, { color: colors.background }]}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 24,
    marginBottom: 8,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: 48,
    justifyContent: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 16,
    lineHeight: 22,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  modalButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 