import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Pressable,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function RegisterScreen() {
	const [nome, setNome] = useState("");
	const [nomeEmpresa, setNomeEmpresa] = useState("");
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [repetirSenha, setRepetirSenha] = useState("");
	const [cpfCnpj, setCpfCnpj] = useState("");
	const [tipo, setTipo] = useState("empresa");
	const [showSenha, setShowSenha] = useState(false);
	const [showRepetirSenha, setShowRepetirSenha] = useState(false);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Cadastro</Text>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>Nome</Text>
				<TextInput
					style={styles.input}
					value={nome}
					onChangeText={setNome}
					placeholder=""
					placeholderTextColor="#7c5a3a"
				/>
			</View>
			{tipo === "empresa" && (
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Nome da empresa</Text>
					<TextInput
						style={styles.input}
						value={nome}
						onChangeText={setNome}
						placeholder=""
						placeholderTextColor="#7c5a3a"
					/>
				</View>
			)}
			<View style={styles.inputGroup}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					value={email}
					onChangeText={setEmail}
					placeholder=""
					placeholderTextColor="#7c5a3a"
					keyboardType="email-address"
					autoCapitalize="none"
				/>
			</View>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>Senha</Text>
				<View style={styles.passwordContainer}>
					<TextInput
						style={[styles.input, { flex: 1 }]}
						value={senha}
						onChangeText={setSenha}
						placeholder=""
						placeholderTextColor="#7c5a3a"
						secureTextEntry={!showSenha}
					/>
					<TouchableOpacity
						onPress={() => setShowSenha((v) => !v)}
						style={styles.eyeIcon}
					>
						<FontAwesome
							name={showSenha ? "eye" : "eye-slash"}
							size={22}
							color="#7c5a3a"
						/>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>Repetir Senha</Text>
				<View style={styles.passwordContainer}>
					<TextInput
						style={[styles.input, { flex: 1 }]}
						value={repetirSenha}
						onChangeText={setRepetirSenha}
						placeholder=""
						placeholderTextColor="#7c5a3a"
						secureTextEntry={!showRepetirSenha}
					/>
					<TouchableOpacity
						onPress={() => setShowRepetirSenha((v) => !v)}
						style={styles.eyeIcon}
					>
						<FontAwesome
							name={showRepetirSenha ? "eye" : "eye-slash"}
							size={22}
							color="#7c5a3a"
						/>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>{tipo === "empresa" ? "CNPJ" : "CPF"}</Text>
				<TextInput
					style={styles.input}
					value={cpfCnpj}
					onChangeText={setCpfCnpj}
					placeholder=""
					placeholderTextColor="#7c5a3a"
					keyboardType="numeric"
				/>
			</View>
			<View style={styles.radioGroup}>
				<Pressable
					style={styles.radioOption}
					onPress={() => setTipo("empresa")}
				>
					<View style={styles.radioCircle}>
						{tipo === "empresa" && <View style={styles.radioDot} />}
					</View>
					<Text style={styles.radioLabel}>Empresa</Text>
				</Pressable>
				<Pressable
					style={styles.radioOption}
					onPress={() => setTipo("cliente")}
				>
					<View style={styles.radioCircle}>
						{tipo === "cliente" && <View style={styles.radioDot} />}
					</View>
					<Text style={styles.radioLabel}>Cliente</Text>
				</Pressable>
			</View>
			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Cadastrar</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#EDE0D4",
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
	},
	title: {
		fontSize: 40,
		fontWeight: "bold",
		color: "#5C2E07",
		marginBottom: 24,
		textAlign: "center",
		fontFamily: "serif",
	},
	inputGroup: {
		width: "90%",
		marginBottom: 12,
	},
	label: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#5C2E07",
		marginBottom: 4,
		marginLeft: 4,
	},
	input: {
		width: "100%",
		height: 40,
		borderColor: "#5C2E07",
		borderWidth: 1.5,
		borderRadius: 8,
		backgroundColor: "#F8F3ED",
		paddingHorizontal: 12,
		fontSize: 16,
		color: "#5C2E07",
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		position: "relative",
	},
	eyeIcon: {
		position: "absolute",
		right: 12,
		padding: 4,
	},
	radioGroup: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "90%",
		marginBottom: 18,
		marginTop: 2,
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 24,
	},
	radioCircle: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#5C2E07",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 6,
		backgroundColor: "#EDE0D4",
	},
	radioDot: {
		height: 10,
		width: 10,
		borderRadius: 5,
		backgroundColor: "#5C2E07",
	},
	radioLabel: {
		fontSize: 16,
		color: "#5C2E07",
		fontWeight: "bold",
	},
	button: {
		width: "90%",
		height: 48,
		backgroundColor: "#583101",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 22,
		fontWeight: "bold",
	},
});
