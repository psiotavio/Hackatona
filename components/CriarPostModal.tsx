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
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from "../contexts/ThemeContext";
import { db, auth, storage } from "../services/firebase/firebase.config";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";

const { width } = Dimensions.get("window");

interface CustomUser extends User {
	empresaId?: string;
	nomeEmpresa?: string;
}

interface CustomModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (data: {
		titulo: string;
		descricao: string;
		imagem?: string;
		link?: string;
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
	const [imagem, setImagem] = useState("");
	const [link, setLink] = useState("");
	const [anonimo, setAnonimo] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		if (visible) {
			setAnonimo(false);
			setImagem("");
		}
	}, [visible]);
	
	// Função para selecionar imagem da galeria
	const pickImage = async () => {
		try {
			// Solicitar permissões específicas para galeria de fotos
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			
			if (status !== 'granted') {
				Alert.alert('Permissão negada', 'Desculpe, precisamos de permissão para acessar sua galeria de fotos!');
				return;
			}
			
			// Mostrar um menu de opções para Android
			if (Platform.OS === 'android') {
				Alert.alert(
					'Selecionar imagem',
					'Escolha de onde você quer selecionar a imagem',
					[
						{ 
							text: 'Cancelar', 
							style: 'cancel' 
						},
						{
							text: 'Galeria de Fotos',
							onPress: async () => {
								await launchGallery();
							}
						},
						{
							text: 'Câmera',
							onPress: async () => {
								await launchCamera();
							}
						}
					]
				);
			} else {
				// Para iOS, abrir diretamente a galeria
				await launchGallery();
			}
		} catch (error) {
			console.error('Erro ao selecionar imagem:', error);
			Alert.alert('Erro', 'Não foi possível selecionar a imagem');
			setUploading(false);
		}
	};

	// Função para abrir a galeria de fotos
	const launchGallery = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
				selectionLimit: 1, // Limitar a uma única imagem
			});
			
			if (!result.canceled) {
				await processSelectedImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Erro ao abrir galeria:', error);
			Alert.alert('Erro', 'Não foi possível abrir a galeria de fotos');
		}
	};

	// Função para abrir a câmera
	const launchCamera = async () => {
		try {
			// Verificar permissões da câmera
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Permissão negada', 'Desculpe, precisamos de permissão para acessar sua câmera!');
				return;
			}
			
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});
			
			if (!result.canceled) {
				await processSelectedImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Erro ao abrir câmera:', error);
			Alert.alert('Erro', 'Não foi possível abrir a câmera');
		}
	};

	// Função para processar a imagem selecionada
	const processSelectedImage = async (imageUri: string) => {
		setUploading(true);
		
		try {
			const uploadUrl = await uploadImageAsync(imageUri);
			setImagem(uploadUrl);
		} catch (e) {
			console.error(e);
			Alert.alert('Erro', 'Falha ao fazer upload da imagem');
		} finally {
			setUploading(false);
		}
	};

	// Função para fazer upload da imagem para o Firebase Storage
	const uploadImageAsync = async (uri: string): Promise<string> => {
		// Converter URI para blob
		const blob: Blob = await new Promise<Blob>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.onload = function () {
				resolve(xhr.response as Blob);
			};
			xhr.onerror = function (e) {
				console.log(e);
				reject(new TypeError("Falha na requisição de rede"));
			};
			xhr.responseType = "blob";
			xhr.open("GET", uri, true);
			xhr.send(null);
		});
		
		// Criar referência de arquivo no Storage
		const fileRef = ref(storage, `posts/${new Date().getTime()}`);
		
		// Fazer upload do blob
		await uploadBytes(fileRef, blob);
		
		// Liberar recursos do blob
		if (Platform.OS !== 'web') {
			// Usando URL.revokeObjectURL para liberar o blob
			URL.revokeObjectURL(uri);
		}
		
		// Obter URL de download
		return await getDownloadURL(fileRef);
	};

	// Função para criar feedback no Firestore
	const handleSendFeedback = async (feedbackData: {
		titulo: string;
		descricao: string;
		imagem?: string;
		link?: string;
	}) => {
		try {
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
				titulo: feedbackData.titulo,
				descricao: feedbackData.descricao,
				imagem: feedbackData.imagem || null,
				link: feedbackData.link || null,
				createdAt: new Date(),
				userId: anonimo ? null : user ? user.uid : null,
				userName: anonimo ? null : user ? user.displayName || user.email : null,
				anonimo: anonimo,
				empresaId: empresaId,
				nomeEmpresa: nomeEmpresa,
			});
			console.log("Feedback criado com sucesso!");
		} catch (error) {
			console.error("Erro ao criar feedback:", error);
		}
	};

	const handleSend = () => {
		onSubmit({
			titulo,
			descricao,
			imagem: imagem || undefined,
			link: link || undefined,
		});
		handleSendFeedback({ titulo, descricao, imagem, link });
		setTitulo("");
		setDescricao("");
		setImagem("");
		setLink("");
		onClose();
	};

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View
					style={[styles.content, { backgroundColor: colors.background50 }]}
				>
					<View style={styles.header}>
						<TouchableOpacity style={styles.closeButton} onPress={onClose}>
							<Ionicons name="close" size={28} color={colors.textPrimary} />
						</TouchableOpacity>
					</View>
					<ScrollView
						style={styles.formContainer}
						contentContainerStyle={{ paddingBottom: 32 }}
					>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Título
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.background,
									borderColor: colors.border,
									color: colors.textPrimary,
								},
							]}
							placeholder="Digite o título"
							placeholderTextColor={colors.textSecondary}
							value={titulo}
							onChangeText={setTitulo}
						/>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Descrição
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.background,
									borderColor: colors.border,
									color: colors.textPrimary,
									height: 80,
								},
							]}
							placeholder="Digite a descrição"
							placeholderTextColor={colors.textSecondary}
							value={descricao}
							onChangeText={setDescricao}
							multiline
						/>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Imagem (opicional)
						</Text>
						<TouchableOpacity 
							style={[
								styles.imagePickerButton, 
								{ 
									backgroundColor: colors.background,
									borderColor: colors.border 
								}
							]}
							onPress={pickImage}
							disabled={uploading}
						>
							<Ionicons name="image-outline" size={24} color={colors.primary} />
							<Text style={[styles.imagePickerText, { color: colors.textPrimary }]}>
								{uploading ? "Enviando imagem..." : imagem ? "Trocar imagem" : "Selecionar imagem da galeria"}
							</Text>
						</TouchableOpacity>
						
						{imagem ? (
							<View style={styles.imagePreviewContainer}>
								<Image
									source={{ uri: imagem }}
									style={styles.imagePreview}
									resizeMode="cover"
								/>
								<TouchableOpacity 
									style={styles.removeImageButton}
									onPress={() => setImagem("")}
								>
									<Ionicons name="close-circle" size={24} color={colors.primary} />
								</TouchableOpacity>
							</View>
						) : null}
						
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Link (opcional)
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.background,
									borderColor: colors.border,
									color: colors.textPrimary,
								},
							]}
							placeholder="Link (opcional)"
							placeholderTextColor={colors.textSecondary}
							value={link}
							onChangeText={setLink}
							autoCapitalize="none"
						/>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 8,
								marginBottom: 16,
							}}
						>
							<Switch value={anonimo} onValueChange={setAnonimo} />
							<Text
								style={{
									marginLeft: 8,
									color: colors.textPrimary,
									fontSize: 16,
								}}
							>
								Enviar como anônimo
							</Text>
						</View>
					</ScrollView>
					<TouchableOpacity
						style={[
							styles.button, 
							{ 
								backgroundColor: colors.primary,
								opacity: uploading ? 0.7 : 1
							}
						]}
						onPress={handleSend}
						disabled={uploading}
					>
						<Text style={[styles.buttonText, { color: colors.background }]}>
							{uploading ? "Aguarde..." : "Enviar"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "#E6CCB2",
		padding: 0,
	},
	content: {
		flex: 1,
		width: "100%",
		height: "100%",
		borderRadius: 0,
		padding: 0,
		backgroundColor: "#E6CCB2",
	},
	header: {
		height: 64,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E6CCB2",
		borderBottomWidth: 1,
		borderBottomColor: "#d9c3a3",
		paddingHorizontal: 16,
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
	},
	title: {
		flex: 1,
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		color: "#333",
	},
	closeButton: {
		position: "absolute",
		right: 16,
		top: 16,
		padding: 4,
		zIndex: 20,
	},
	formContainer: {
		flex: 1,
		marginTop: 64,
		marginBottom: 72,
		paddingHorizontal: 20,
		paddingTop: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		marginLeft: 4,
		marginTop: 8,
	},
	input: {
		width: "100%",
		height: 48,
		borderWidth: 1.5,
		borderRadius: 24,
		paddingHorizontal: 20,
		fontSize: 16,
		marginBottom: 8,
	},
	imagePickerButton: {
		width: "100%",
		height: 48,
		borderWidth: 1.5,
		borderRadius: 24,
		paddingHorizontal: 20,
		marginBottom: 16,
		flexDirection: "row",
		alignItems: "center",
	},
	imagePickerText: {
		fontSize: 16,
		marginLeft: 12,
	},
	imagePreviewContainer: {
		position: "relative",
		marginBottom: 16,
	},
	imagePreview: {
		width: "100%",
		height: 200,
		borderRadius: 12,
		backgroundColor: "#eee",
	},
	removeImageButton: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "rgba(255,255,255,0.8)",
		borderRadius: 15,
	},
	button: {
		position: "absolute",
		bottom: 16,
		left: 16,
		right: 16,
		height: 52,
		borderRadius: 26,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		marginBottom: 8,
		elevation: 2,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "bold",
	},
});
