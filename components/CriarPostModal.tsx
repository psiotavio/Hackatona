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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { db, auth } from "../services/firebase/firebase.config";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
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
	const [isLoading, setIsLoading] = useState(false);
	const [caracteresRestantes, setCaracteresRestantes] = useState(500);

	useEffect(() => {
		if (visible) {
			setAnonimo(false);
			setTitulo("");
			setDescricao("");
			setImagem("");
			setLink("");
			setCaracteresRestantes(500);
		}
	}, [visible]);

	useEffect(() => {
		setCaracteresRestantes(500 - descricao.length);
	}, [descricao]);

	// Função para criar feedback no Firestore
	const handleSendFeedback = async (feedbackData: {
		titulo: string;
		descricao: string;
		imagem?: string;
		link?: string;
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
		} finally {
			setIsLoading(false);
		}
	};

	const handleSend = () => {
		if (!titulo.trim() || !descricao.trim()) {
			return;
		}
		onSubmit({
			titulo,
			descricao,
			imagem: imagem || undefined,
			link: link || undefined,
		});
		handleSendFeedback({ titulo, descricao, imagem, link });
		onClose();
	};

	const isValid = titulo.trim().length > 0 && descricao.trim().length > 0;

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView 
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<View style={[styles.overlay, { backgroundColor: colors.background }]}>
					<View style={[styles.header, { 
						backgroundColor: colors.background,
						borderBottomColor: colors.border 
					}]}>
						<TouchableOpacity 
							style={styles.closeButton} 
							onPress={onClose}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons name="close" size={28} color={colors.textPrimary} />
						</TouchableOpacity>
						<Text style={[styles.title, { color: colors.textPrimary }]}>
							Nova Publicação
						</Text>
					</View>

					<ScrollView
						style={styles.formContainer}
						contentContainerStyle={styles.formContent}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.textPrimary }]}>
								Título
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: colors.background50,
										borderColor: colors.border,
										color: colors.textPrimary,
									},
								]}
								placeholder="Digite o título"
								placeholderTextColor={colors.textSecondary}
								value={titulo}
								onChangeText={setTitulo}
								maxLength={100}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.textPrimary }]}>
								Descrição
							</Text>
							<TextInput
								style={[
									styles.input,
									styles.textArea,
									{
										backgroundColor: colors.background50,
										borderColor: colors.border,
										color: colors.textPrimary,
									},
								]}
								placeholder="Digite a descrição"
								placeholderTextColor={colors.textSecondary}
								value={descricao}
								onChangeText={setDescricao}
								multiline
								maxLength={500}
								textAlignVertical="top"
							/>
							<Text style={[styles.charCount, { 
								color: caracteresRestantes < 50 ? colors.error : colors.textSecondary 
							}]}>
								{caracteresRestantes} caracteres restantes
							</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.textPrimary }]}>
								Imagem (opcional)
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: colors.background50,
										borderColor: colors.border,
										color: colors.textPrimary,
									},
								]}
								placeholder="URL da imagem"
								placeholderTextColor={colors.textSecondary}
								value={imagem}
								onChangeText={setImagem}
								autoCapitalize="none"
							/>
							{imagem ? (
								<View style={styles.imagePreviewContainer}>
									<Image
										source={{ uri: imagem }}
										style={styles.imagePreview}
										resizeMode="cover"
									/>
									<TouchableOpacity 
										style={[styles.removeImageButton, { backgroundColor: colors.error }]}
										onPress={() => setImagem("")}
									>
										<Ionicons name="close" size={20} color={colors.background} />
									</TouchableOpacity>
								</View>
							) : null}
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.textPrimary }]}>
								Link (opcional)
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: colors.background50,
										borderColor: colors.border,
										color: colors.textPrimary,
									},
								]}
								placeholder="Cole o link aqui"
								placeholderTextColor={colors.textSecondary}
								value={link}
								onChangeText={setLink}
								autoCapitalize="none"
								keyboardType="url"
							/>
						</View>

						<View style={[styles.anonimoContainer, { 
							backgroundColor: colors.background50,
							borderColor: colors.border 
						}]}>
							<View style={styles.anonimoTextContainer}>
								<Ionicons name="eye-off" size={20} color={colors.textPrimary} />
								<Text style={[styles.anonimoText, { color: colors.textPrimary }]}>
									Enviar como anônimo
								</Text>
							</View>
							<Switch 
								value={anonimo} 
								onValueChange={setAnonimo}
								trackColor={{ false: colors.border, true: colors.primary }}
								thumbColor={colors.background}
							/>
						</View>
					</ScrollView>

					<View style={[styles.footer, { 
						backgroundColor: colors.background,
						borderTopColor: colors.border 
					}]}>
						<TouchableOpacity
							style={[
								styles.button,
								{ 
									backgroundColor: isValid ? colors.primary : colors.background50,
									opacity: isValid ? 1 : 0.7
								}
							]}
							onPress={handleSend}
							disabled={!isValid || isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color={colors.background} />
							) : (
								<Text style={[styles.buttonText, { color: colors.background }]}>
									Publicar
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		flex: 1,
	},
	header: {
		height: 94,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 1,
		paddingHorizontal: 16,
		paddingTop: 40,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
	},
	closeButton: {
		position: "absolute",
		right: 16,
		top: 56,
		padding: 4,
		zIndex: 20,
	},
	formContainer: {
		flex: 1,
	},
	formContent: {
		padding: 20,
		paddingBottom: 100,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	input: {
		width: "100%",
		height: 48,
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		fontSize: 16,
	},
	textArea: {
		height: 120,
		paddingTop: 12,
		paddingBottom: 12,
	},
	charCount: {
		fontSize: 12,
		marginTop: 4,
		textAlign: "right",
	},
	imagePreviewContainer: {
		marginTop: 12,
		position: "relative",
	},
	imagePreview: {
		width: "100%",
		height: 200,
		borderRadius: 12,
	},
	removeImageButton: {
		position: "absolute",
		top: 8,
		right: 8,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
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
	anonimoTextContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	anonimoText: {
		fontSize: 16,
	},
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
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
