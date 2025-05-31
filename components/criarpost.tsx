import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

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

	const handleSend = () => {
		onSubmit({
			titulo,
			descricao,
			imagem: imagem || undefined,
			link: link || undefined,
		});
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
			<View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
				<View
					style={[styles.content, { backgroundColor: colors.background50 }]}
				>
					<View style={styles.header}>
						<Text style={[styles.title, { color: colors.textPrimary }]}>
							Novo Modal
						</Text>
						<TouchableOpacity onPress={onClose}>
							<Ionicons name="close" size={24} color={colors.textPrimary} />
						</TouchableOpacity>
					</View>
					<ScrollView>
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
						<TouchableOpacity
							style={[styles.button, { backgroundColor: colors.primary }]}
							onPress={handleSend}
						>
							<Text style={[styles.buttonText, { color: colors.background }]}>
								Enviar
							</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	content: {
		borderRadius: 20,
		padding: 24,
		width: "100%",
		maxWidth: 400,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
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
		width: "100%",
		height: 52,
		borderRadius: 26,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		marginBottom: 8,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "bold",
	},
});
