import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from "../contexts/ThemeContext";
import { db, auth, storage } from "../services/firebase/firebase.config";
import { addDoc, collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";

const { width } = Dimensions.get("window");

interface CustomUser extends User {
  empresaId?: string;
  nomeEmpresa?: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar: any;
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    link?: string;
    usuarioMarcado?: {
      id: string;
      nome: string;
    };
  }) => void;
}

export default function CriarPost({
  visible,
  onClose,
  onSubmit,
}: CustomModalProps) {
  const { colors } = useTheme();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [link, setLink] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [caracteresRestantes, setCaracteresRestantes] = useState(500);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showUsuariosDropdown, setShowUsuariosDropdown] = useState(false);
  const [usuarioMarcado, setUsuarioMarcado] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (visible) {
      setAnonimo(false);
      setTitulo("");
      setDescricao("");
      setLink("");
      setCaracteresRestantes(500);
      setUsuarioMarcado(null);
      setSearchTerm("");
      fetchUsuarios();
    }
  }, [visible]);

  const fetchUsuarios = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const empresaId = userData.tipo === 'empresa' ? user.uid : userData.empresaId;

      if (!empresaId) return;

      const q = query(
        collection(db, "users"),
        where("empresaId", "==", empresaId),
        where("status", "==", "approved")
      );

      const querySnapshot = await getDocs(q);
      const usuariosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        email: doc.data().email,
        avatar: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.data().nome)}&background=8B4513&color=fff` }
      }));

      setUsuarios(usuariosList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de usuários");
    }
  };

  useEffect(() => {
    setCaracteresRestantes(500 - descricao.length);
  }, [descricao]);

  const handleDescricaoChange = (text: string) => {
    // Verifica se o texto começa com "eu", "eu ", "eu acho", "eu acho que", etc.
    const primeiraPessoaRegex = /^(eu|eu\s|eu\sacho|eu\sacho\sque)/i;
    if (!primeiraPessoaRegex.test(text) && text.length > 0) {
      Alert.alert(
        "Atenção",
        "O feedback deve ser escrito em primeira pessoa. Comece com 'eu' ou 'eu acho'."
      );
      return;
    }

    // Se o texto exceder o limite, corta na última palavra completa
    if (text.length > 500) {
      const ultimaPalavra = text.slice(0, 500).lastIndexOf(' ');
      if (ultimaPalavra !== -1) {
        setDescricao(text.slice(0, ultimaPalavra));
        setCaracteresRestantes(500 - ultimaPalavra);
      }
    } else {
      setDescricao(text);
      setCaracteresRestantes(500 - text.length);
    }
  };

  const handleSendFeedback = async ({
    titulo,
    descricao,
    link,
    usuarioMarcado,
  }: {
    titulo: string;
    descricao: string;
    link?: string;
    usuarioMarcado?: {
      id: string;
      nome: string;
    };
  }) => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      let empresaId = null;
      let nomeEmpresa = null;

      if (user && !anonimo) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          empresaId = userData.empresaId || null;
          nomeEmpresa = userData.nomeEmpresa || null;
        }
      }

      await addDoc(collection(db, "feedback"), {
        titulo,
        descricao,
        link: link || null,
        createdAt: new Date(),
        userId: anonimo ? null : user?.uid || null,
        userName: anonimo ? null : user?.displayName || user?.email,
        anonimo,
        empresaId,
        nomeEmpresa,
        usuarioMarcado: usuarioMarcado || null,
      });
    } catch (error) {
      console.error("Erro ao criar feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!titulo.trim() || !descricao.trim()) return;

    onSubmit({ 
      titulo, 
      descricao, 
      link,
      usuarioMarcado: usuarioMarcado ? {
        id: usuarioMarcado.id,
        nome: usuarioMarcado.nome
      } : undefined
    });
    handleSendFeedback({ 
      titulo, 
      descricao, 
      link,
      usuarioMarcado: usuarioMarcado ? {
        id: usuarioMarcado.id,
        nome: usuarioMarcado.nome
      } : undefined
    });
    onClose();
  };

  const isValid = titulo.trim().length > 0 && descricao.trim().length > 0;

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Nova Publicação</Text>
          </View>

          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Título</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background50, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Digite o título"
                placeholderTextColor={colors.textSecondary}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background50, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Comece com 'eu' ou 'eu acho'..."
                placeholderTextColor={colors.textSecondary}
                value={descricao}
                onChangeText={handleDescricaoChange}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: caracteresRestantes < 50 ? colors.error : colors.textSecondary }]}>
                {caracteresRestantes} caracteres restantes
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Marcar Usuário (opcional)</Text>
              <TouchableOpacity
                style={[styles.usuarioSelector, { backgroundColor: colors.background50, borderColor: colors.border }]}
                onPress={() => setShowUsuariosDropdown(!showUsuariosDropdown)}
              >
                <Text style={[styles.usuarioSelectorText, { color: usuarioMarcado ? colors.textPrimary : colors.textSecondary }]}>
                  {usuarioMarcado ? usuarioMarcado.nome : "Selecione um usuário"}
                </Text>
                <Ionicons name={showUsuariosDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {showUsuariosDropdown && (
                <View style={[styles.dropdownContainer, { backgroundColor: colors.background50, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Buscar usuário..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                  <FlatList
                    data={filteredUsuarios}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.usuarioItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setUsuarioMarcado(item);
                          setShowUsuariosDropdown(false);
                          setSearchTerm("");
                        }}
                      >
                        <Text style={[styles.usuarioItemText, { color: colors.textPrimary }]}>{item.nome}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.usuariosList}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Link (opcional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background50, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Cole o link aqui"
                placeholderTextColor={colors.textSecondary}
                value={link}
                onChangeText={setLink}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={[styles.anonimoContainer, { backgroundColor: colors.background50, borderColor: colors.border }]}>
              <View style={styles.anonimoTextContainer}>
                <Ionicons name="eye-off" size={20} color={colors.textPrimary} />
                <Text style={[styles.anonimoText, { color: colors.textPrimary }]}>Enviar como anônimo</Text>
              </View>
              <Switch value={anonimo} onValueChange={setAnonimo} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.background} />
            </View>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: isValid ? colors.primary : colors.background50, opacity: isValid ? 1 : 0.7 }]}
              onPress={handleSend}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  header: {
    height: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: { fontSize: 18, fontWeight: "600" },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 56,
    padding: 4,
    zIndex: 20,
  },
  formContent: { padding: 20, paddingBottom: 100 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: { height: 120, paddingTop: 12, paddingBottom: 12 },
  charCount: { fontSize: 12, marginTop: 4, textAlign: "right" },
  usuarioSelector: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  usuarioSelectorText: {
    fontSize: 16,
  },
  dropdownContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 1000,
    maxHeight: 200,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    margin: 8,
    paddingHorizontal: 12,
  },
  usuariosList: {
    maxHeight: 150,
  },
  usuarioItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  usuarioItemText: {
    fontSize: 16,
  },
  anonimoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  anonimoTextContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  anonimoText: { fontSize: 16 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
