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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { db, auth } from "../services/firebase/firebase.config";
import { addDoc, collection } from "firebase/firestore";

const { width } = Dimensions.get("window");

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

	useEffect(() => {
		if (visible) setAnonimo(false);
	}, [visible]);

	// Função para criar feedback no Firestore
	const handleSendFeedback = async (feedbackData: {
		titulo: string;
		descricao: string;
		imagem?: string;
		link?: string;
	}) => {
		try {
			const user = auth.currentUser;
			await addDoc(collection(db, "feedback"), {
				titulo: feedbackData.titulo,
				descricao: feedbackData.descricao,
				imagem: feedbackData.imagem || null,
				link: feedbackData.link || null,
				createdAt: new Date(),
				userId: anonimo ? null : user ? user.uid : null,
				userName: anonimo ? null : user ? user.displayName || user.email : null,
				anonimo: anonimo,
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
							Imagem (opcional, URL)
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
							placeholder="URL da imagem (opcional)"
							placeholderTextColor={colors.textSecondary}
							value={imagem}
							onChangeText={setImagem}
						/>
						{imagem ? (
							<Image
								source={{ uri: imagem }}
								style={styles.imagePreview}
								resizeMode="contain"
							/>
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
						style={[styles.button, { backgroundColor: colors.primary }]}
						onPress={handleSend}
					>
						<Text style={[styles.buttonText, { color: colors.background }]}>
							Enviar
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
	imagePreview: {
		width: "100%",
		height: 120,
		borderRadius: 12,
		marginBottom: 8,
		marginTop: 4,
		backgroundColor: "#eee",
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
