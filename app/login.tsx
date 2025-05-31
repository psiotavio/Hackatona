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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Implementar lógica de login aqui
    if (email && senha) {
      // Navegue para a tela principal após login bem-sucedido
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    // Voltar para a tela anterior
    router.back();
  };

  const handleEsqueceuSenha = () => {
    // Abrir o modal de recuperação de senha
    setModalVisible(true);
  };

  const handleEnviarRecuperacao = () => {
    // Aqui você implementaria a lógica para enviar o e-mail de recuperação
    if (emailRecuperacao.trim() === '') {
      Alert.alert('Erro', 'Por favor, insira seu e-mail.');
      return;
    }
    
    // Simulação de envio de e-mail
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
    // Navegar para a tela de registro
    // router.push('/registrar');
    console.log('Registrar nova conta');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="auto" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logos/Logo-Brown.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Senha"
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
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={handleEsqueceuSenha}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não possui conta? </Text>
              <TouchableOpacity onPress={handleRegistrar}>
                <Text style={styles.registerLink}>Registre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal para recuperação de senha */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Recuperação de Senha</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalText}>
                  Insira seu e-mail cadastrado para receber as instruções de recuperação de senha.
                </Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Email"
                  value={emailRecuperacao}
                  onChangeText={setEmailRecuperacao}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleEnviarRecuperacao}
                >
                  <Text style={styles.modalButtonText}>Enviar</Text>
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
    backgroundColor: '#fff',
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
    width: 200,
    height: 120,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: 50,
    justifyContent: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: '#8B4513',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#8B4513', // Marrom para combinar com o logo
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#333',
  },
  registerLink: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
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
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalText: {
    marginBottom: 15,
    color: '#555',
    lineHeight: 20,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButton: {
    backgroundColor: '#8B4513',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 