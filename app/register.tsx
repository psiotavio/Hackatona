import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Pressable,
	Dimensions,
	Image,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
	FlatList,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { auth, db } from "../services/firebase/firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
	doc,
	setDoc,
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
	const router = useRouter();
	const { colors, currentTheme } = useTheme();
	const [nome, setNome] = useState("");
	const [nomeEmpresa, setNomeEmpresa] = useState("");
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [repetirSenha, setRepetirSenha] = useState("");
	const [cpfCnpj, setCpfCnpj] = useState("");
	const [tipo, setTipo] = useState("empresa");
	const [showSenha, setShowSenha] = useState(false);
	const [showRepetirSenha, setShowRepetirSenha] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [empresas, setEmpresas] = useState<any[]>([]);
	const [showResults, setShowResults] = useState(false);
	const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);

	const formatCNPJ = (value: string) => {
		let cnpj = value.replace(/\D/g, "");
		cnpj = cnpj.slice(0, 14);

		cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2");
		cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
		cnpj = cnpj.replace(/\.(\d{3})(\d)/, ".$1/$2");
		cnpj = cnpj.replace(/(\d{4})(\d)/, "$1-$2");

		return cnpj;
	};

	const formatCPF = (value: string) => {
		return value
			.replace(/\D/g, "")
			.replace(/(\d{3})(\d)/, "$1.$2")
			.replace(/(\d{3})(\d)/, "$1.$2")
			.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
	};

	useEffect(() => {
		const searchEmpresas = async () => {
			if (searchQuery.length < 2) {
				setEmpresas([]);
				return;
			}

			try {
				const q = query(
					collection(db, "users"),
					where("tipo", "==", "empresa"),
					where("nomeEmpresa", ">=", searchQuery),
					where("nomeEmpresa", "<=", searchQuery + "\uf8ff")
				);

				const querySnapshot = await getDocs(q);
				const empresasList = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setEmpresas(empresasList);
			} catch (error) {
				console.error("Erro ao buscar empresas:", error);
			}
		};

		searchEmpresas();
	}, [searchQuery]);

	const handleSelectEmpresa = (empresa: any) => {
		setSelectedEmpresa(empresa);
		setNomeEmpresa(empresa.nomeEmpresa);
		setSearchQuery(empresa.nomeEmpresa);
		setShowResults(false);
	};

	const handleBack = () => {
		router.push("/welcome");
	};

	const handleRegister = async () => {
		if (
			!nome ||
			!email ||
			!senha ||
			!repetirSenha ||
			!cpfCnpj ||
			(tipo === "empresa" && !nomeEmpresa) ||
			(tipo === "cliente" && !selectedEmpresa)
		) {
			Alert.alert("Erro", "Por favor, preencha todos os campos.");
			return;
		}
		if (senha !== repetirSenha) {
			Alert.alert("Erro", "As senhas não coincidem.");
			return;
		}
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				senha
			);
			const user = userCredential.user;

			// Criar documento do usuário no Firestore
			await setDoc(doc(db, "users", user.uid), {
				nome,
				email,
				cpfCnpj,
				tipo,
				nomeEmpresa:
					tipo === "empresa" ? nomeEmpresa : selectedEmpresa.nomeEmpresa,
				empresaId: tipo === "cliente" ? selectedEmpresa.id : null,
				status: tipo === "cliente" ? "pending" : "approved",
				dataCriacao: new Date().toISOString(),
			});

			if (tipo === "cliente") {
				router.replace("/pendente");
			} else {
				router.replace("/(tabs)");
			}
		} catch (error: any) {
			let message = "Erro ao registrar. Tente novamente.";
			if (error.code === "auth/email-already-in-use") {
				message = "Este e-mail já está em uso.";
			} else if (error.code === "auth/invalid-email") {
				message = "E-mail inválido.";
			} else if (error.code === "auth/weak-password") {
				message = "A senha deve ter pelo menos 6 caracteres.";
			}
			Alert.alert("Erro", message);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<TouchableOpacity style={styles.backButton} onPress={handleBack}>
				<Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
			</TouchableOpacity>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.logoContainer}>
					<Image
						source={
							currentTheme === "dark"
								? require("../assets/images/logos/logoVertical-light.png")
								: require("../assets/images/logos/logoVertical-Brown.png")
						}
						style={styles.logo}
						resizeMode="contain"
					/>
				</View>

				<Text style={[styles.title, { color: colors.textPrimary }]}>
					Cadastro
				</Text>

				<View style={styles.formContainer}>
					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Nome
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
							value={nome}
							onChangeText={setNome}
							placeholder="Digite seu nome"
							placeholderTextColor={colors.textSecondary}
						/>
					</View>

					{tipo === "empresa" ? (
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.textPrimary }]}>
								Nome da empresa
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
								value={nomeEmpresa}
								onChangeText={setNomeEmpresa}
								placeholder="Digite o nome da empresa"
								placeholderTextColor={colors.textSecondary}
							/>
						</View>
					) : (
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.textPrimary }]}>
								Empresa
							</Text>
							<View style={styles.searchContainer}>
								<TextInput
									style={[
										styles.searchInput,
										{
											backgroundColor: colors.background50,
											borderColor: colors.border,
											color: colors.textPrimary,
										},
									]}
									value={searchQuery}
									onChangeText={(text) => {
										setSearchQuery(text);
										setShowResults(true);
									}}
									placeholder="Busque sua empresa"
									placeholderTextColor={colors.textSecondary}
									onFocus={() => setShowResults(true)}
								/>
								{showResults && empresas.length > 0 && (
									<View
										style={[
											styles.resultsContainer,
											{ backgroundColor: colors.background50 },
										]}
									>
										<FlatList
											data={empresas}
											keyExtractor={(item) => item.id}
											renderItem={({ item }) => (
												<TouchableOpacity
													style={styles.resultItem}
													onPress={() => handleSelectEmpresa(item)}
												>
													<Text
														style={[
															styles.resultText,
															{ color: colors.textPrimary },
														]}
													>
														{item.nomeEmpresa}
													</Text>
												</TouchableOpacity>
											)}
										/>
									</View>
								)}
							</View>
						</View>
					)}

					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Email
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
							value={email}
							onChangeText={setEmail}
							placeholder="Digite seu email"
							placeholderTextColor={colors.textSecondary}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Senha
						</Text>
						<View
							style={[
								styles.passwordContainer,
								{
									backgroundColor: colors.background50,
									borderColor: colors.border,
								},
							]}
						>
							<TextInput
								style={[styles.passwordInput, { color: colors.textPrimary }]}
								value={senha}
								onChangeText={setSenha}
								placeholder="Digite sua senha"
								placeholderTextColor={colors.textSecondary}
								secureTextEntry={!showSenha}
							/>
							<TouchableOpacity
								onPress={() => setShowSenha((v) => !v)}
								style={styles.eyeIcon}
							>
								<FontAwesome
									name={showSenha ? "eye" : "eye-slash"}
									size={22}
									color={colors.textSecondary}
								/>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							Repetir Senha
						</Text>
						<View
							style={[
								styles.passwordContainer,
								{
									backgroundColor: colors.background50,
									borderColor: colors.border,
								},
							]}
						>
							<TextInput
								style={[styles.passwordInput, { color: colors.textPrimary }]}
								value={repetirSenha}
								onChangeText={setRepetirSenha}
								placeholder="Confirme sua senha"
								placeholderTextColor={colors.textSecondary}
								secureTextEntry={!showRepetirSenha}
							/>
							<TouchableOpacity
								onPress={() => setShowRepetirSenha((v) => !v)}
								style={styles.eyeIcon}
							>
								<FontAwesome
									name={showRepetirSenha ? "eye" : "eye-slash"}
									size={22}
									color={colors.textSecondary}
								/>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.textPrimary }]}>
							{tipo === "empresa" ? "CNPJ" : "CPF"}
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
							value={cpfCnpj}
							onChangeText={(text) => {
								if (tipo === "empresa") {
									const onlyNumbers = text.replace(/\D/g, "").slice(0, 14);
									setCpfCnpj(formatCNPJ(onlyNumbers));
								} else {
									const onlyNumbers = text.replace(/\D/g, "").slice(0, 11);
									setCpfCnpj(formatCPF(onlyNumbers));
								}
							}}
							placeholder={`Digite seu ${tipo === "empresa" ? "CNPJ" : "CPF"}`}
							placeholderTextColor={colors.textSecondary}
							keyboardType="numeric"
							maxLength={tipo === "empresa" ? 18 : 14}
						/>
					</View>

					<View style={styles.radioGroup}>
						<Pressable
							style={styles.radioOption}
							onPress={() => {
								setTipo("empresa");
								setCpfCnpj("");
							}}
						>
							<View
								style={[styles.radioCircle, { borderColor: colors.primary }]}
							>
								{tipo === "empresa" && (
									<View
										style={[
											styles.radioDot,
											{ backgroundColor: colors.primary },
										]}
									/>
								)}
							</View>
							<Text style={[styles.radioLabel, { color: colors.textPrimary }]}>
								Empresa
							</Text>
						</Pressable>
						<Pressable
							style={styles.radioOption}
							onPress={() => {
								setTipo("cliente");
								setCpfCnpj("");
							}}
						>
							<View
								style={[styles.radioCircle, { borderColor: colors.primary }]}
							>
								{tipo === "cliente" && (
									<View
										style={[
											styles.radioDot,
											{ backgroundColor: colors.primary },
										]}
									/>
								)}
							</View>
							<Text style={[styles.radioLabel, { color: colors.textPrimary }]}>
								Cliente
							</Text>
						</Pressable>
					</View>

					<TouchableOpacity
						style={[styles.button, { backgroundColor: colors.primary }]}
						onPress={handleRegister}
					>
						<Text style={[styles.buttonText, { color: colors.background }]}>
							Cadastrar
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 24,
		paddingTop: 80,
	},
	backButton: {
		position: "absolute",
		top: 40,
		left: 20,
		zIndex: 10,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 24,
	},
	logo: {
		width: width * 0.4,
		height: width * 0.4,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 24,
		textAlign: "center",
		fontFamily: "serif",
	},
	formContainer: {
		width: "100%",
		alignItems: "center",
	},
	inputGroup: {
		width: "100%",
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		marginLeft: 4,
	},
	input: {
		width: "100%",
		height: 48,
		borderWidth: 1.5,
		borderRadius: 24,
		paddingHorizontal: 20,
		fontSize: 16,
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		position: "relative",
		borderWidth: 1.5,
		borderRadius: 24,
	},
	passwordInput: {
		flex: 1,
		height: 48,
		paddingHorizontal: 20,
		fontSize: 16,
	},
	eyeIcon: {
		position: "absolute",
		right: 16,
		padding: 4,
	},
	radioGroup: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		marginBottom: 24,
		marginTop: 8,
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 24,
	},
	radioCircle: {
		height: 24,
		width: 24,
		borderRadius: 12,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	radioDot: {
		height: 12,
		width: 12,
		borderRadius: 6,
	},
	radioLabel: {
		fontSize: 16,
		fontWeight: "600",
	},
	button: {
		width: "100%",
		height: 52,
		borderRadius: 26,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		marginBottom: 24,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "bold",
	},
	searchContainer: {
		width: "100%",
		position: "relative",
		zIndex: 1,
	},
	searchInput: {
		width: "100%",
		height: 48,
		borderWidth: 1.5,
		borderRadius: 24,
		paddingHorizontal: 20,
		fontSize: 16,
	},
	resultsContainer: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		maxHeight: 200,
		borderRadius: 12,
		marginTop: 4,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	resultItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	resultText: {
		fontSize: 16,
	},
});
