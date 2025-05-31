import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Pressable, Animated, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { auth, db } from '@/services/firebase/firebase.config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observarPontosUsuario, calcularMaximoPontosPorDia } from '@/services/firebase/fetchMaxPoints';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

// Função utilitária para gerar avatar
const getAvatarUri = (name: string) => ({
	uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
		name
	)}&background=8B4513&color=fff`,
});

// Card reutilizável
function ProfileCard({
	authorName,
	authorAvatar,
	title,
	description,
	content,
	likes,
	isLiked,
	comments,
	onLike,
	onComment,
	onShare,
	topFeedback,
	userName,
	isAnonimo,
}: any) {
	const { colors } = useTheme();
	return (
		<View style={[profileCardStyles.cardContainer]}>
			<View
				style={[
					profileCardStyles.card,
					{ backgroundColor: colors.background50 },
				]}
			>
				<View style={profileCardStyles.cardHeader}>
					<View style={profileCardStyles.authorContainer}>
						<Image source={authorAvatar} style={profileCardStyles.avatar} />
						<View>
							<Text
								style={[
									profileCardStyles.authorName,
									{ color: colors.textPrimary },
								]}
							>
								{title}
							</Text>
							<Text
								style={[
									profileCardStyles.authorSubtitle,
									{ color: colors.textSecondary },
								]}
							>
								{isAnonimo ? "Anônimo" : userName}
							</Text>
						</View>
					</View>
				</View>
				<Text
					style={[
						profileCardStyles.cardDescription,
						{ color: colors.textSecondary },
					]}
				>
					{description}
				</Text>
				<Text
					style={[profileCardStyles.cardContent, { color: colors.textPrimary }]}
				>
					{content}
				</Text>
				<View style={profileCardStyles.cardActions}>
					<TouchableOpacity
						style={profileCardStyles.actionButton}
						onPress={onLike}
					>
						<Ionicons
							name={isLiked ? "heart" : "heart-outline"}
							size={24}
							color={colors.primary}
						/>
						{likes > 0 && (
							<Text
								style={[profileCardStyles.likeCount, { color: colors.primary }]}
							>
								{likes}
							</Text>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						style={profileCardStyles.actionButton}
						onPress={onComment}
					>
						<Ionicons
							name="chatbubble-outline"
							size={22}
							color={colors.primary}
						/>
						{comments > 0 && (
							<Text
								style={[
									profileCardStyles.commentCount,
									{ color: colors.primary },
								]}
							>
								{comments}
							</Text>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						style={profileCardStyles.actionButton}
						onPress={onShare}
					>
						<Ionicons
							name="paper-plane-outline"
							size={22}
							color={colors.primary}
						/>
					</TouchableOpacity>
				</View>
			</View>
			{topFeedback && (
				<View
					style={[
						profileCardStyles.feedbackContainer,
						{ backgroundColor: colors.background50 },
					]}
				>
					<View style={profileCardStyles.feedbackContent}>
						<Image
							source={topFeedback.authorAvatar}
							style={profileCardStyles.feedbackAvatar}
						/>
						<Text
							style={[
								profileCardStyles.feedbackText,
								{ color: colors.textPrimary },
							]}
						>
							{topFeedback.content}
						</Text>
						<TouchableOpacity style={profileCardStyles.feedbackLikeButton}>
							<Ionicons
								name={topFeedback.isLiked ? "heart" : "heart-outline"}
								size={18}
								color={colors.primary}
							/>
							<Text
								style={[
									profileCardStyles.feedbackLikeCount,
									{ color: colors.primary },
								]}
							>
								{topFeedback.likes}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
}

const profileCardStyles = StyleSheet.create({
	cardContainer: {
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	card: {
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	authorContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		marginRight: 10,
	},
	authorName: {
		fontSize: 16,
		fontWeight: "600",
	},
	authorSubtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	cardDescription: {
		fontSize: 14,
		marginBottom: 16,
	},
	cardActions: {
		flexDirection: "row",
		justifyContent: "flex-start",
	},
	actionButton: {
		marginRight: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	likeCount: {
		marginLeft: 4,
		fontSize: 12,
		fontWeight: "500",
	},
	commentCount: {
		marginLeft: 4,
		fontSize: 12,
		fontWeight: "500",
	},
	feedbackContainer: {
		marginTop: -10,
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 12,
		padding: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	feedbackContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	feedbackAvatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		marginRight: 8,
	},
	feedbackText: {
		flex: 1,
		fontSize: 13,
	},
	feedbackLikeButton: {
		padding: 4,
		flexDirection: "row",
		alignItems: "center",
	},
	feedbackLikeCount: {
		marginLeft: 2,
		fontSize: 10,
		fontWeight: "500",
	},
	cardContent: {
		fontSize: 14,
		marginBottom: 16,
		lineHeight: 20,
	},
});

export default function ProfileScreen() {
	const { colors, themeMode, setThemeMode } = useTheme();
	const router = useRouter();
	const [tab, setTab] = useState<'posts' | 'feedbacks' | 'public'>('posts');
	const fadeAnim = useRef(new Animated.Value(1)).current;
	const qrCodeRef = useRef<any>(null);
	const [userData, setUserData] = useState<any>(null);
	const [posts, setPosts] = useState<any[]>([]);
	const [feedbacks, setFeedbacks] = useState<any[]>([]);
	const [publicQuestions, setPublicQuestions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
	const [isPublicQuestionModalVisible, setIsPublicQuestionModalVisible] = useState(false);
	const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
	const [isEmpresa, setIsEmpresa] = useState(false);
	const [userPoints, setUserPoints] = useState(0);
	const [maximoPontosPorDia, setMaximoPontosPorDia] = useState<number>(0);
	const [newQuestion, setNewQuestion] = useState('');
	const [qrCodeValue, setQrCodeValue] = useState('');
	const [showQRCode, setShowQRCode] = useState(false);
	const [themeModalVisible, setThemeModalVisible] = useState(false);
	const { logout } = useAuth();

	useEffect(() => {
		fetchUserData();
		checkUserType();
	}, []);

	const checkUserType = async () => {
		try {
			const type = await AsyncStorage.getItem("userType");
			setIsEmpresa(type === "empresa");
		} catch (error) {
			console.error("Erro ao verificar tipo de usuário:", error);
		}
	};

	const carregarSolicitacoes = async () => {
		try {
			const user = auth.currentUser;
			if (!user) return;

			const q = query(
				collection(db, "users"),
				where("tipo", "==", "cliente"),
				where("status", "==", "pending"),
				where("empresaId", "==", user.uid)
			);

			const querySnapshot = await getDocs(q);
			const solicitacoesList = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				dataSolicitacao: new Date(doc.data().dataCriacao).toLocaleDateString(),
				avatar: getAvatarUri(doc.data().nome),
			}));

			setSolicitacoes(solicitacoesList);
		} catch (error) {
			console.error("Erro ao carregar solicitações:", error);
			Alert.alert("Erro", "Não foi possível carregar as solicitações.");
		}
	};

	const handleAprovar = async (usuario: any) => {
		try {
			await updateDoc(doc(db, "users", usuario.id), {
				status: "approved",
			});

			setSolicitacoes((prev) => prev.filter((s) => s.id !== usuario.id));
			Alert.alert("Sucesso", `${usuario.nome} foi aprovado com sucesso.`);
		} catch (error) {
			console.error("Erro ao aprovar usuário:", error);
			Alert.alert("Erro", "Não foi possível aprovar o usuário.");
		}
	};

	const handleRecusar = async (usuario: any) => {
		Alert.alert(
			"Recusar solicitação",
			`Tem certeza que deseja recusar a solicitação de ${usuario.nome}?`,
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Recusar",
					style: "destructive",
					onPress: async () => {
						try {
							await updateDoc(doc(db, "users", usuario.id), {
								status: "rejected",
							});

							setSolicitacoes((prev) =>
								prev.filter((s) => s.id !== usuario.id)
							);
							Alert.alert("Sucesso", `${usuario.nome} foi recusado.`);
						} catch (error) {
							console.error("Erro ao recusar usuário:", error);
							Alert.alert("Erro", "Não foi possível recusar o usuário.");
						}
					},
				},
			]
		);
	};

	const fetchUserData = async () => {
		try {
			const user = auth.currentUser;
			if (!user) {
				router.replace("/welcome");
				return;
			}

			// Busca dados do usuário
			const userDoc = await getDoc(doc(db, "users", user.uid));
			const userData = userDoc.data();
			setUserData(userData);

			// Configurar observador de pontos
			const unsubscribePoints = observarPontosUsuario(
				user.uid,
				(novosPontos) => {
					setUserPoints(novosPontos);
				}
			);

			// Calcular máximo de pontos por dia
			const empresaId =
				userData?.tipo === "empresa" ? user.uid : userData?.empresaId;
			if (empresaId) {
				const maximoDiario = await calcularMaximoPontosPorDia(empresaId);
				setMaximoPontosPorDia(maximoDiario);
			}

			// Configurar observador de posts
			const postsQuery = query(
				collection(db, "feedback"),
				where("userId", "==", user.uid),
				orderBy("createdAt", "desc")
			);

			const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
				const postsData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
					authorAvatar: getAvatarUri(doc.data().userName || "Anônimo"),
					content: doc.data().content,
					description: doc.data().descricao,
					title: doc.data().titulo,
					userName: doc.data().userName,
					isAnonimo: doc.data().isAnonimo,
				}));
				setPosts(postsData);
			});

			// Configurar observador de feedbacks
			const feedbacksQuery = query(
				collection(db, "allFeedbacks"),
				where("userId", "==", user.uid),
				orderBy("createdAt", "desc")
			);

			const unsubscribeFeedbacks = onSnapshot(feedbacksQuery, (snapshot) => {
				const feedbacksData = snapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						id: doc.id,
						...data,
						authorAvatar: getAvatarUri(data.userName || "Anônimo"),
						content: data.content,
						description: data.descricao || "",
						title: data.titulo || "",
						userName: data.userName,
						isAnonimo: data.isAnonimo,
						likes: data.likes || 0,
						comments: data.comments || 0,
						isLiked: data.isLiked || false,
					};
				});
				setFeedbacks(feedbacksData);
			});

			// Limpar observadores quando o componente for desmontado
			return () => {
				if (unsubscribePoints) unsubscribePoints();
				if (unsubscribePosts) unsubscribePosts();
				if (unsubscribeFeedbacks) unsubscribeFeedbacks();
			};
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
			Alert.alert(
				"Erro",
				"Não foi possível carregar seus dados. Tente novamente."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			// Exibir confirmação
			Alert.alert(
				"Logout",
				"Tem certeza que deseja sair?",
				[
					{ text: "Cancelar", style: "cancel" },
					{ 
						text: "Sair", 
						onPress: async () => {
							await logout();
						},
						style: 'destructive'
					}
				]
			);
		} catch (error) {
			console.error('Erro ao fazer logout:', error);
			Alert.alert(
				"Erro",
				"Não foi possível fazer logout. Tente novamente."
			);
		}
	};

	const handleTabChange = (nextTab: "posts" | "feedbacks" | "public") => {
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 180,
			useNativeDriver: true,
		}).start(() => {
			setTab(nextTab);
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 180,
				useNativeDriver: true,
			}).start();
		});
	};

	const handleCreatePublicQuestion = async () => {
		if (!newQuestion.trim()) {
			Alert.alert("Erro", "Por favor, digite uma pergunta.");
			return;
		}

		try {
			const user = auth.currentUser;
			if (!user) return;

			const questionData = {
				question: newQuestion.trim(),
				createdAt: new Date(),
				userId: user.uid,
				empresaId: user.uid,
				empresaName: userData?.nome || "Empresa",
				responses: [],
				qrCodeId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			};

			const docRef = await addDoc(
				collection(db, "publicQuestions"),
				questionData
			);
			setQrCodeValue(`https://hackabomba.netlify.app/?id=${docRef.id}`);
			setShowQRCode(true);
			setNewQuestion("");
			setIsPublicQuestionModalVisible(false);
		} catch (error) {
			console.error("Erro ao criar pergunta pública:", error);
			Alert.alert("Erro", "Não foi possível criar a pergunta.");
		}
	};

	const handleSaveQRCode = async () => {
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("Erro", "Permissão para salvar arquivos é necessária.");
				return;
			}

			const qrCodeData = await new Promise<string>((resolve) => {
				if (qrCodeRef.current) {
					qrCodeRef.current.toDataURL((data: string) => resolve(data));
				}
			});

			const fileUri = FileSystem.documentDirectory + "qrcode.png";
			await FileSystem.writeAsStringAsync(fileUri, qrCodeData, {
				encoding: FileSystem.EncodingType.Base64,
			});

			await MediaLibrary.saveToLibraryAsync(fileUri);
			Alert.alert("Sucesso", "QR Code salvo na galeria!");
			setShowQRCode(false);
		} catch (error) {
			console.error("Erro ao salvar QR Code:", error);
			Alert.alert("Erro", "Não foi possível salvar o QR Code.");
		}
	};

	const handleShareQRCode = async () => {
		try {
			const qrCodeData = await new Promise<string>((resolve) => {
				if (qrCodeRef.current) {
					qrCodeRef.current.toDataURL((data: string) => resolve(data));
				}
			});

			const fileUri = FileSystem.documentDirectory + "qrcode.png";
			await FileSystem.writeAsStringAsync(fileUri, qrCodeData, {
				encoding: FileSystem.EncodingType.Base64,
			});

			await Sharing.shareAsync(fileUri);
			setShowQRCode(false);
		} catch (error) {
			console.error("Erro ao compartilhar QR Code:", error);
			Alert.alert("Erro", "Não foi possível compartilhar o QR Code.");
		}
	};

	useEffect(() => {
		if (isEmpresa) {
			const publicQuestionsQuery = query(
				collection(db, "publicQuestions"),
				where("empresaId", "==", auth.currentUser?.uid),
				orderBy("createdAt", "desc")
			);

			const unsubscribePublicQuestions = onSnapshot(
				publicQuestionsQuery,
				(snapshot) => {
					const questionsData = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
						createdAt: doc.data().createdAt.toDate(),
					}));
					setPublicQuestions(questionsData);
				}
			);

			return () => {
				if (unsubscribePublicQuestions) unsubscribePublicQuestions();
			};
		}
	}, [isEmpresa]);

	if (loading) {
		return (
			<View
				style={[
					styles.container,
					{
						backgroundColor: colors.background,
						justifyContent: "center",
						alignItems: "center",
					},
				]}
			>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.profileHeaderCentered}>
				<Image
					source={
						userData?.photoURL
							? { uri: userData.photoURL }
							: getAvatarUri(userData?.name || "Usuário")
					}
					style={styles.avatarLarge}
				/>
				<Text style={[styles.nameCentered, { color: colors.titlePrimary }]}>
					{userData?.nome || "Usuário"}
				</Text>
				<Text style={[styles.companyCentered, { color: colors.textSecondary }]}>
					{userData?.nomeEmpresa || "Empresa não informada"}
				</Text>
				<View
					style={[
						styles.pointsContainer,
						{ backgroundColor: colors.background50 },
					]}
				>
					<Ionicons name="trophy" size={20} color={colors.warning} />
					<View>
						<Text style={[styles.pointsText, { color: colors.textPrimary }]}>
							{userPoints.toLocaleString()} pontos
						</Text>
						<Text
							style={[
								styles.maximoDiarioTexto,
								{ color: colors.textSecondary },
							]}
						>
							Máximo diário:{" "}
							<Text style={{ color: colors.success, fontWeight: "bold" }}>
								{maximoPontosPorDia.toLocaleString()} pts
							</Text>
						</Text>
					</View>
				</View>
				<View style={styles.buttonRow}>
					<TouchableOpacity style={styles.editTextButton}>
						<Text style={[styles.editText, { color: colors.textSecondary }]}>
							Editar
						</Text>
					</TouchableOpacity>
					{isEmpresa && (
						<TouchableOpacity
							style={[styles.adminButton, { backgroundColor: colors.primary }]}
							onPress={() => {
								setIsAdminModalVisible(true);
								carregarSolicitacoes();
							}}
						>
							<Ionicons
								name="cog-outline"
								size={20}
								color={colors.background}
							/>
							<Text style={[styles.adminText, { color: colors.background }]}>
								Admin
							</Text>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={[styles.logoutButton, { backgroundColor: colors.primary }]}
						onPress={handleLogout}
					>
						<Ionicons
							name="log-out-outline"
							size={20}
							color={colors.background}
						/>
						<Text style={[styles.logoutText, { color: colors.background }]}>
							Sair
						</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.tabRowCentered}>
				<Pressable
					style={[
						styles.tabButtonCentered,
						tab === "posts" && {
							borderBottomColor: colors.titlePrimary,
							borderBottomWidth: 2,
						},
					]}
					onPress={() => tab !== "posts" && handleTabChange("posts")}
				>
					<Text
						style={[
							styles.tabTextCentered,
							{
								color:
									tab === "posts" ? colors.titlePrimary : colors.textSecondary,
							},
						]}
					>
						Posts
					</Text>
				</Pressable>
				<Pressable
					style={[
						styles.tabButtonCentered,
						tab === "feedbacks" && {
							borderBottomColor: colors.titlePrimary,
							borderBottomWidth: 2,
						},
					]}
					onPress={() => tab !== "feedbacks" && handleTabChange("feedbacks")}
				>
					<Text
						style={[
							styles.tabTextCentered,
							{
								color:
									tab === "feedbacks"
										? colors.titlePrimary
										: colors.textSecondary,
							},
						]}
					>
						Feedbacks
					</Text>
				</Pressable>
				{isEmpresa && (
					<Pressable
						style={[
							styles.tabButtonCentered,
							tab === "public" && {
								borderBottomColor: colors.titlePrimary,
								borderBottomWidth: 2,
							},
						]}
						onPress={() => tab !== "public" && handleTabChange("public")}
					>
						<Text
							style={[
								styles.tabTextCentered,
								{
									color:
										tab === "public"
											? colors.titlePrimary
											: colors.textSecondary,
								},
							]}
						>
							Público
						</Text>
					</Pressable>
				)}
			</View>
			<Animated.View style={{ opacity: fadeAnim }}>
				{tab === "posts" ? (
					<>
						<Text
							style={[
								styles.sectionTitleCentered,
								{ color: colors.titlePrimary },
							]}
						>
							Meus Posts
						</Text>
						{posts.length > 0 ? (
							posts.map((post) => <ProfileCard key={post.id} {...post} />)
						) : (
							<Text style={[styles.emptyText, { color: colors.textSecondary }]}>
								Você ainda não tem posts
							</Text>
						)}
					</>
				) : tab === "feedbacks" ? (
					<>
						<Text
							style={[
								styles.sectionTitleCentered,
								{ color: colors.titlePrimary },
							]}
						>
							Meus Feedbacks
						</Text>
						{feedbacks.length > 0 ? (
							feedbacks.map((feedback) => (
								<ProfileCard key={feedback.id} {...feedback} />
							))
						) : (
							<Text style={[styles.emptyText, { color: colors.textSecondary }]}>
								Você ainda não tem feedbacks
							</Text>
						)}
					</>
				) : (
					<>
						<Text
							style={[
								styles.sectionTitleCentered,
								{ color: colors.titlePrimary },
							]}
						>
							Perguntas Públicas
						</Text>
						{publicQuestions.length > 0 ? (
							publicQuestions.map((question, index) => (
								<TouchableOpacity
									key={question.id}
									style={[
										styles.publicQuestionCard,
										{ backgroundColor: colors.background50 },
									]}
									onPress={() =>
										router.push(`/public-question?id=${question.id}`)
									}
								>
									<Text
										style={[styles.questionText, { color: colors.textPrimary }]}
									>
										{question.question}
									</Text>
									<Text
										style={[
											styles.responsesCount,
											{ color: colors.textSecondary },
										]}
									>
										{question.responses?.length || 0} respostas
									</Text>
									{question.responses?.length > 0 && (
										<View
											style={[
												styles.lastResponse,
												{ backgroundColor: colors.background },
											]}
										>
											<Text
												style={[
													styles.lastResponseText,
													{ color: colors.textSecondary },
												]}
											>
												Última resposta:{" "}
												{question.responses[question.responses.length - 1]
													.isAnonimo
													? "Anônimo"
													: question.responses[question.responses.length - 1]
															.userName || "Usuário"}
											</Text>
										</View>
									)}
									<Text
										style={[
											styles.questionDate,
											{ color: colors.textSecondary },
										]}
									>
										{new Date(question.createdAt).toLocaleDateString()}
									</Text>
								</TouchableOpacity>
							))
						) : (
							<Text style={[styles.emptyText, { color: colors.textSecondary }]}>
								Você ainda não tem perguntas públicas
							</Text>
						)}
					</>
				)}
			</Animated.View>

			{isEmpresa && (
				<TouchableOpacity
					style={[styles.floatingButton, { backgroundColor: colors.primary }]}
					onPress={() => setIsPublicQuestionModalVisible(true)}
				>
					<Ionicons name="add" size={24} color={colors.background} />
				</TouchableOpacity>
			)}

			{/* Modal de Admin */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={isAdminModalVisible}
				onRequestClose={() => setIsAdminModalVisible(false)}
			>
				<View
					style={[
						styles.modalContainer,
						{ backgroundColor: "rgba(0, 0, 0, 0.5)" },
					]}
				>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: colors.background },
						]}
					>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: colors.titlePrimary }]}>
								Solicitações Pendentes
							</Text>
							<TouchableOpacity
								onPress={() => setIsAdminModalVisible(false)}
								style={styles.closeButton}
							>
								<Ionicons name="close" size={24} color={colors.textSecondary} />
							</TouchableOpacity>
						</View>

						<ScrollView style={{ maxHeight: 400 }}>
							{solicitacoes.length === 0 ? (
								<Text
									style={[
										styles.semSolicitacoes,
										{ color: colors.textSecondary },
									]}
								>
									Não há solicitações pendentes no momento.
								</Text>
							) : (
								solicitacoes.map((solicitacao) => (
									<View
										key={solicitacao.id}
										style={[
											styles.solicitacaoContainer,
											{ backgroundColor: colors.background50 },
										]}
									>
										<View style={styles.solicitacaoHeader}>
											<Image
												source={solicitacao.avatar}
												style={styles.solicitacaoAvatar}
											/>
											<View style={styles.solicitacaoInfo}>
												<Text
													style={[
														styles.solicitacaoNome,
														{ color: colors.titlePrimary },
													]}
												>
													{solicitacao.nome}
												</Text>
												<Text
													style={[
														styles.solicitacaoEmail,
														{ color: colors.textSecondary },
													]}
												>
													{solicitacao.email}
												</Text>
												<Text
													style={[
														styles.solicitacaoData,
														{ color: colors.textSecondary },
													]}
												>
													Solicitação: {solicitacao.dataSolicitacao}
												</Text>
											</View>
										</View>

										<View style={styles.acaoContainer}>
											<TouchableOpacity
												style={[
													styles.botaoAprovar,
													{ backgroundColor: colors.success },
												]}
												onPress={() => handleAprovar(solicitacao)}
											>
												<Ionicons
													name="checkmark-circle-outline"
													size={22}
													color={colors.background}
												/>
												<Text
													style={[
														styles.botaoTexto,
														{ color: colors.background },
													]}
												>
													Aprovar
												</Text>
											</TouchableOpacity>

											<TouchableOpacity
												style={[
													styles.botaoRecusar,
													{ backgroundColor: colors.error },
												]}
												onPress={() => handleRecusar(solicitacao)}
											>
												<Ionicons
													name="close-circle-outline"
													size={22}
													color={colors.background}
												/>
												<Text
													style={[
														styles.botaoTexto,
														{ color: colors.background },
													]}
												>
													Recusar
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								))
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Modal de Pergunta Pública */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={isPublicQuestionModalVisible}
				onRequestClose={() => setIsPublicQuestionModalVisible(false)}
			>
				<View
					style={[
						styles.modalContainer,
						{ backgroundColor: "rgba(0, 0, 0, 0.5)" },
					]}
				>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: colors.background },
						]}
					>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: colors.titlePrimary }]}>
								Nova Pergunta Pública
							</Text>
							<TouchableOpacity
								onPress={() => setIsPublicQuestionModalVisible(false)}
								style={styles.closeButton}
							>
								<Ionicons name="close" size={24} color={colors.textSecondary} />
							</TouchableOpacity>
						</View>

						<TextInput
							style={[
								styles.questionInput,
								{
									backgroundColor: colors.background50,
									color: colors.textPrimary,
									borderColor: colors.border,
								},
							]}
							placeholder="Digite sua pergunta..."
							placeholderTextColor={colors.textSecondary}
							value={newQuestion}
							onChangeText={setNewQuestion}
							multiline
							numberOfLines={4}
						/>

						<TouchableOpacity
							style={[
								styles.createButton,
								{
									backgroundColor: newQuestion.trim()
										? colors.primary
										: colors.border,
									opacity: newQuestion.trim() ? 1 : 0.7,
								},
							]}
							onPress={handleCreatePublicQuestion}
							disabled={!newQuestion.trim()}
						>
							<Text
								style={[styles.createButtonText, { color: colors.background }]}
							>
								Criar Pergunta
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Modal de QR Code */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={showQRCode}
				onRequestClose={() => setShowQRCode(false)}
			>
				<View
					style={[
						styles.modalContainer,
						{ backgroundColor: "rgba(0, 0, 0, 0.5)" },
					]}
				>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: colors.background },
						]}
					>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: colors.titlePrimary }]}>
								QR Code da Pergunta
							</Text>
							<TouchableOpacity
								onPress={() => setShowQRCode(false)}
								style={styles.closeButton}
							>
								<Ionicons name="close" size={24} color={colors.textSecondary} />
							</TouchableOpacity>
						</View>

						<View style={styles.qrCodeContainer}>
							<QRCode
								value={qrCodeValue}
								size={200}
								backgroundColor={colors.background}
								color={colors.textPrimary}
								getRef={(ref) => (qrCodeRef.current = ref)}
							/>
						</View>

						<View style={styles.qrCodeActions}>
							<TouchableOpacity
								style={[
									styles.qrCodeButton,
									{ backgroundColor: colors.primary },
								]}
								onPress={handleSaveQRCode}
							>
								<Ionicons
									name="save-outline"
									size={24}
									color={colors.background}
								/>
								<Text
									style={[
										styles.qrCodeButtonText,
										{ color: colors.background },
									]}
								>
									Salvar
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.qrCodeButton,
									{ backgroundColor: colors.primary },
								]}
								onPress={handleShareQRCode}
							>
								<Ionicons
									name="share-outline"
									size={24}
									color={colors.background}
								/>
								<Text
									style={[
										styles.qrCodeButtonText,
										{ color: colors.background },
									]}
								>
									Compartilhar
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Modal de seleção de tema */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={themeModalVisible}
				onRequestClose={() => setThemeModalVisible(false)}
			>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
					<View style={{ backgroundColor: colors.background, borderRadius: 16, padding: 24, minWidth: 260 }}>
						<Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.titlePrimary, marginBottom: 16 }}>Escolha o tema</Text>
						<TouchableOpacity
							style={[styles.themeOption, themeMode === 'light' && { borderColor: colors.primary, backgroundColor: colors.background50 }]}
							onPress={() => { setThemeMode('light'); setThemeModalVisible(false); }}
						>
							<Ionicons name="sunny" size={22} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />
							<Text style={[styles.themeOptionText, { color: themeMode === 'light' ? colors.primary : colors.textSecondary }]}>Claro</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.themeOption, themeMode === 'dark' && { borderColor: colors.primary, backgroundColor: colors.background50 }]}
							onPress={() => { setThemeMode('dark'); setThemeModalVisible(false); }}
						>
							<Ionicons name="moon" size={22} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />
							<Text style={[styles.themeOptionText, { color: themeMode === 'dark' ? colors.primary : colors.textSecondary }]}>Escuro</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.themeOption, themeMode === 'system' && { borderColor: colors.primary, backgroundColor: colors.background50 }]}
							onPress={() => { setThemeMode('system'); setThemeModalVisible(false); }}
						>
							<Ionicons name="desktop-outline" size={22} color={themeMode === 'system' ? colors.primary : colors.textSecondary} />
							<Text style={[styles.themeOptionText, { color: themeMode === 'system' ? colors.primary : colors.textSecondary }]}>Sistema</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setThemeModalVisible(false)} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
							<Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Fechar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 70,
		flex: 1,
	},
	profileHeaderCentered: {
		alignItems: "center",
		marginTop: 32,
		marginBottom: 16,
	},
	avatarLarge: {
		width: 90,
		height: 90,
		borderRadius: 45,
		marginBottom: 16,
	},
	nameCentered: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
		textAlign: "center",
	},
	companyCentered: {
		fontSize: 16,
		marginBottom: 8,
		textAlign: "center",
	},
	editTextButton: {
		marginBottom: 12,
	},
	editText: {
		fontSize: 16,
		textAlign: "center",
		textDecorationLine: "underline",
	},
	tabRowCentered: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 10,
		marginTop: 5,
	},
	tabButtonCentered: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 2,
		borderBottomColor: "transparent",
	},
	tabTextCentered: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
	},
	sectionTitleCentered: {
		fontSize: 20,
		fontWeight: "bold",
		marginLeft: 0,
		marginBottom: 20,
		marginTop: 10,
		textAlign: "center",
	},
	buttonRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginLeft: 16,
	},
	logoutText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "500",
	},
	emptyText: {
		textAlign: "center",
		fontSize: 16,
		marginTop: 20,
	},
	adminButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginLeft: 16,
	},
	adminText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "500",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "90%",
		maxHeight: "80%",
		borderRadius: 12,
		padding: 20,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	closeButton: {
		padding: 4,
	},
	solicitacoesList: {
		flex: 1,
	},
	semSolicitacoes: {
		textAlign: "center",
		fontSize: 16,
		marginTop: 20,
	},
	solicitacaoContainer: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	solicitacaoHeader: {
		flexDirection: "row",
		marginBottom: 12,
	},
	solicitacaoAvatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
	},
	solicitacaoInfo: {
		flex: 1,
		justifyContent: "center",
	},
	solicitacaoNome: {
		fontSize: 16,
		fontWeight: "bold",
	},
	solicitacaoEmail: {
		fontSize: 14,
	},
	solicitacaoData: {
		fontSize: 12,
		marginTop: 4,
	},
	acaoContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 8,
	},
	botaoAprovar: {
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		marginRight: 8,
		justifyContent: "center",
	},
	botaoRecusar: {
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		marginLeft: 8,
		justifyContent: "center",
	},
	botaoTexto: {
		fontWeight: "bold",
		marginLeft: 8,
	},
	pointsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		marginBottom: 12,
	},
	pointsText: {
		fontSize: 16,
		fontWeight: "600",
	},
	maximoDiarioTexto: {
		fontSize: 13,
		marginTop: 2,
	},
	floatingButton: {
		position: "absolute",
		right: 20,
		bottom: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	publicQuestionCard: {
		marginHorizontal: 16,
		marginBottom: 16,
		padding: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	questionText: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	responsesCount: {
		fontSize: 14,
		marginBottom: 4,
	},
	questionDate: {
		fontSize: 12,
	},
	questionInput: {
		marginTop: 16,
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		minHeight: 100,
		textAlignVertical: "top",
	},
	createButton: {
		marginTop: 16,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	createButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	qrCodeContainer: {
		alignItems: "center",
		padding: 20,
	},
	qrCodeActions: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
	qrCodeButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		minWidth: 120,
		justifyContent: "center",
	},
	qrCodeButtonText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "600",
	},
	responseFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 8,
	},
	responseAuthor: {
		fontSize: 12,
		fontStyle: "italic",
	},
	lastResponse: {
		padding: 8,
		borderRadius: 8,
		marginTop: 8,
	},
	lastResponseText: {
		fontSize: 12,
		fontStyle: "italic",
	},
	themeSelectorCard: {
		marginHorizontal: 20,
		marginTop: 24,
		marginBottom: 12,
		padding: 16,
		borderRadius: 16,
		backgroundColor: '#fff1',
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 2,
	},
	themeSelectorTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	themeSelectorRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	themeOption: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: 'transparent',
		borderRadius: 12,
		paddingVertical: 10,
		marginHorizontal: 4,
		backgroundColor: 'transparent',
	},
	themeOptionText: {
		marginLeft: 8,
		fontSize: 15,
		fontWeight: '500',
	},
	logoutButtonBig: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 20,
		marginTop: 16,
		paddingVertical: 14,
		borderRadius: 16,
		elevation: 1,
	},
	logoutButtonText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: 'bold',
	},
});
