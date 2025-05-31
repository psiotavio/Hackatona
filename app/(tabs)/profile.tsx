import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Pressable, Animated, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { auth, db } from '@/services/firebase/firebase.config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função utilitária para gerar avatar
const getAvatarUri = (name: string) => ({ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B4513&color=fff` });

// Card reutilizável
function ProfileCard({
  authorName,
  authorAvatar,
  title,
  description,
  likes,
  isLiked,
  comments,
  onLike,
  onComment,
  onShare,
  topFeedback
}: any) {
  const { colors } = useTheme();
  return (
    <View style={profileCardStyles.cardContainer}>
      <View style={profileCardStyles.card}>
        <View style={profileCardStyles.cardHeader}>
          <View style={profileCardStyles.authorContainer}>
            <Image source={authorAvatar} style={profileCardStyles.avatar} />
            <Text style={profileCardStyles.authorName}>{title}</Text>
          </View>
        </View>
        <Text style={profileCardStyles.cardDescription}>{description}</Text>
        <View style={profileCardStyles.cardActions}>
          <TouchableOpacity style={profileCardStyles.actionButton} onPress={onLike}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color="#8B4513" />
            {likes > 0 && <Text style={profileCardStyles.likeCount}>{likes}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={profileCardStyles.actionButton} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={22} color="#8B4513" />
            {comments > 0 && <Text style={profileCardStyles.commentCount}>{comments}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={profileCardStyles.actionButton} onPress={onShare}>
            <Ionicons name="paper-plane-outline" size={22} color="#8B4513" />
          </TouchableOpacity>
        </View>
      </View>
      {topFeedback && (
        <View style={profileCardStyles.feedbackContainer}>
          <View style={profileCardStyles.feedbackContent}>
            <Image source={topFeedback.authorAvatar} style={profileCardStyles.feedbackAvatar} />
            <Text style={profileCardStyles.feedbackText}>{topFeedback.content}</Text>
            <TouchableOpacity style={profileCardStyles.feedbackLikeButton}>
              <Ionicons name={topFeedback.isLiked ? 'heart' : 'heart-outline'} size={18} color="#8B4513" />
              <Text style={profileCardStyles.feedbackLikeCount}>{topFeedback.likes}</Text>
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
    backgroundColor: '#F2E2CE',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: -10,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#F2E2CE',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#333',
  },
  feedbackLikeButton: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackLikeCount: {
    marginLeft: 2,
    fontSize: 10,
    color: '#8B4513',
    fontWeight: '500',
  },
});

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<'posts' | 'feedbacks'>('posts');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/welcome');
        return;
      }

      // Busca dados do usuário
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserData(userData);

      // Busca posts do usuário
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        authorAvatar: getAvatarUri(doc.data().authorName)
      }));
      setPosts(postsData);

      // Busca feedbacks do usuário
      const feedbacksQuery = query(
        collection(db, 'feedbacks'),
        where('authorId', '==', user.uid)
      );
      const feedbacksSnapshot = await getDocs(feedbacksQuery);
      const feedbacksData = feedbacksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        authorAvatar: getAvatarUri(doc.data().authorName)
      }));
      setFeedbacks(feedbacksData);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.removeItem('userType');
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handleTabChange = (nextTab: 'posts' | 'feedbacks') => {
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>  
      <View style={styles.profileHeaderCentered}>
        <Image
          source={userData?.photoURL ? { uri: userData.photoURL } : getAvatarUri(userData?.name || 'Usuário')}
          style={styles.avatarLarge}
        />
        <Text style={[styles.nameCentered, { color: colors.titlePrimary }]}>{userData?.nome || 'Usuário'}</Text>
        <Text style={[styles.companyCentered, { color: colors.textSecondary }]}>{userData?.nomeEmpresa || 'Empresa não informada'}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.editTextButton}>
            <Text style={[styles.editText, { color: colors.textSecondary }]}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.primary }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabRowCentered}>
        <Pressable
          style={[styles.tabButtonCentered, tab === 'posts' && { borderBottomColor: colors.titlePrimary, borderBottomWidth: 2 }]}
          onPress={() => tab !== 'posts' && handleTabChange('posts')}
        >
          <Text style={[styles.tabTextCentered, { color: tab === 'posts' ? colors.titlePrimary : colors.textSecondary }]}>Posts</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButtonCentered, tab === 'feedbacks' && { borderBottomColor: colors.titlePrimary, borderBottomWidth: 2 }]}
          onPress={() => tab !== 'feedbacks' && handleTabChange('feedbacks')}
        >
          <Text style={[styles.tabTextCentered, { color: tab === 'feedbacks' ? colors.titlePrimary : colors.textSecondary }]}>Feedbacks</Text>
        </Pressable>
      </View>
      <Animated.View style={{ opacity: fadeAnim }}>
        {tab === 'posts' ? (
          <>
            <Text style={[styles.sectionTitleCentered, { color: colors.titlePrimary }]}>Meus Posts</Text>
            {posts.length > 0 ? (
              posts.map(post => (
                <ProfileCard key={post.id} {...post} />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Você ainda não tem posts</Text>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitleCentered, { color: colors.titlePrimary }]}>Meus Feedbacks</Text>
            {feedbacks.length > 0 ? (
              feedbacks.map(feedback => (
                <ProfileCard key={feedback.id} {...feedback} />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Você ainda não tem feedbacks</Text>
            )}
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeaderCentered: {
    alignItems: 'center',
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
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  companyCentered: {
    fontSize: 16,
    color: '#bdbdbd',
    marginBottom: 8,
    textAlign: 'center',
  },
  editTextButton: {
    marginBottom: 12,
  },
  editText: {
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#bdbdbd',
  },
  tabRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  tabButtonCentered: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabTextCentered: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitleCentered: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 0,
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
}); 