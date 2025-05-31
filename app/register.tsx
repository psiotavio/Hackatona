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
	ActivityIndicator,
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

// Definir interface para os dados da empresa
interface EmpresaData {
	id: string;
	nomeEmpresa: string;
	[key: string]: any; // Permite propriedades adicionais
}

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
	const [empresas, setEmpresas] = useState<EmpresaData[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaData | null>(null);
	const [loadingEmpresas, setLoadingEmpresas] = useState(false);

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

	// Carregar todas as empresas quando o tipo for alterado para 'cliente'
	useEffect(() => {
		if (tipo === 'cliente') {
			fetchAllEmpresas();
		}
	}, [tipo]);

	// Função para buscar todas as empresas no Firebase
	const fetchAllEmpresas = async () => {
		setLoadingEmpresas(true);
		try {
			const q = query(
				collection(db, "users"),
				where("tipo", "==", "empresa")
			);

			const querySnapshot = await getDocs(q);
			const empresasList = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				nomeEmpresa: doc.data().nomeEmpresa || 'Empresa sem nome',
				...doc.data(),
			})).sort((a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa));
			
			setEmpresas(empresasList);
		} catch (error) {
			console.error("Erro ao buscar empresas:", error);
			Alert.alert("Erro", "Não foi possível carregar a lista de empresas");
		} finally {
			setLoadingEmpresas(false);
		}
	};

	const handleSelectEmpresa = (empresa: EmpresaData) => {
		setSelectedEmpresa(empresa);
		setShowDropdown(false);
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
					tipo === "empresa" ? nomeEmpresa : selectedEmpresa?.nomeEmpresa || '',
				empresaId: tipo === "cliente" ? selectedEmpresa?.id : null,
				status: tipo === "cliente" ? "pending" : "approved",
				dataCriacao: new Date().toISOString(),
				pontos: 0, // Adicionando o campo pontos com valor inicial 0
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
						<>
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: colors.textPrimary }]}>
									Selecione sua empresa
								</Text>
								<TouchableOpacity 
									style={[
										styles.dropdownButton, 
										{ 
											backgroundColor: colors.background50,
											borderColor: colors.border,
											borderBottomWidth: showDropdown ? 0 : 1.5
										}
									]}
									onPress={() => setShowDropdown(!showDropdown)}
								>
									<Text 
										style={[
											styles.dropdownButtonText, 
											{ 
												color: selectedEmpresa ? colors.textPrimary : colors.textSecondary 
											}
										]}
										numberOfLines={1}
									>
										{selectedEmpresa ? selectedEmpresa.nomeEmpresa : "Selecione a empresa"}
									</Text>
									<Ionicons 
										name={showDropdown ? "chevron-up" : "chevron-down"} 
										size={20} 
										color={colors.textSecondary} 
									/>
								</TouchableOpacity>
							</View>
							
							{showDropdown && (
								<View 
									style={{
										width: "100%",
										marginBottom: 16,
										marginTop: -1.5,
										borderWidth: 1,
										borderTopWidth: 0,
										borderColor: colors.border,
										borderBottomLeftRadius: 12,
										borderBottomRightRadius: 12,
										backgroundColor: colors.background50,
										overflow: "hidden",
										shadowColor: "#000",
										shadowOffset: { width: 2, height: 2 },
										shadowOpacity: 0.25,
										shadowRadius: 3.84,
										elevation: 5,
									}}
								>
									{loadingEmpresas ? (
										<View style={styles.loadingContainer}>
											<ActivityIndicator size="small" color={colors.primary} />
											<Text style={[styles.loadingText, { color: colors.textSecondary }]}>
												Carregando empresas...
											</Text>
										</View>
									) : empresas.length > 0 ? (
										<FlatList
											data={empresas}
											keyExtractor={(item) => item.id}
											renderItem={({ item }) => (
												<TouchableOpacity
													style={[
														styles.dropdownItem,
														selectedEmpresa?.id === item.id && {
															backgroundColor: colors.primary + '20'
														}
													]}
													onPress={() => handleSelectEmpresa(item)}
												>
													<Text
														style={[
															styles.dropdownItemText,
															{ color: colors.textPrimary },
															selectedEmpresa?.id === item.id && {
																fontWeight: 'bold',
																color: colors.primary
															}
														]}
													>
														{item.nomeEmpresa}
													</Text>
												</TouchableOpacity>
											)}
											scrollEnabled={empresas.length > 3}
											nestedScrollEnabled={true}
											style={[
												styles.flatList,
												{ height: Math.min(empresas.length * 50, 150) }
											]}
										/>
									) : (
										<Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
											Nenhuma empresa encontrada
										</Text>
									)}
								</View>
							)}
						</>
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
								setSelectedEmpresa(null);
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
		position: 'relative',
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
	dropdownButton: {
		width: "100%",
		height: 48,
		borderWidth: 1.5,
		borderRadius: 24,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	dropdownButtonText: {
		fontSize: 16,
		flex: 1,
	},
	dropdownItem: {
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(0,0,0,0.1)",
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "transparent",
	},
	dropdownItemText: {
		fontSize: 16,
		flex: 1,
	},
	loadingContainer: {
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		marginTop: 8,
		fontSize: 14,
	},
	noResultsText: {
		padding: 20,
		textAlign: "center",
		fontSize: 14,
	},
	flatList: {
		width: "100%",
	},
});
