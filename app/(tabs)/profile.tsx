import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'posts' | 'feedbacks'>('posts');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>  
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.titlePrimary }]}>Otávio Cunha</Text>
          </View>
          <Text style={[styles.company, { color: colors.textSecondary }]}>Empresa XPTO / Empresa XPTO</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}> 
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, tab === 'posts' && { backgroundColor: colors.primary20 }]}
          onPress={() => setTab('posts')}
        >
          <Text style={[styles.tabText, { color: tab === 'posts' ? colors.primary : colors.textPrimary }]}>Posts</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === 'feedbacks' && { backgroundColor: colors.primary20 }]}
          onPress={() => setTab('feedbacks')}
        >
          <Text style={[styles.tabText, { color: tab === 'feedbacks' ? colors.primary : colors.textPrimary }]}>Feedbacks</Text>
        </Pressable>
      </View>

      {tab === 'posts' ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.titlePrimary }]}>Meus Posts</Text>
          <View style={[styles.feedbackCard, { backgroundColor: colors.background50 }]}> 
            <View style={styles.feedbackHeader}>
              <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.feedbackAvatar} />
              <View>
                <Text style={[styles.feedbackTitle, { color: colors.titlePrimary }]}>Post Exemplo</Text>
                <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>Compartilhei um novo dashboard!</Text>
              </View>
            </View>
            <View style={styles.feedbackActions}>
              <Text style={styles.icon}>♡</Text>
              <Text style={styles.icon}>💬</Text>
              <Text style={styles.icon}>🔄</Text>
              <Text style={styles.icon}>↗</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.titlePrimary }]}>Meus Feedbacks</Text>
          <View style={[styles.feedbackCard, { backgroundColor: colors.background50 }]}> 
            <View style={styles.feedbackHeader}>
              <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.feedbackAvatar} />
              <View>
                <Text style={[styles.feedbackTitle, { color: colors.titlePrimary }]}>Teste Lorem Ipsum</Text>
                <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>Fiz uma tela de dashboard</Text>
              </View>
            </View>
            <View style={styles.feedbackActions}>
              <Text style={styles.icon}>♡</Text>
              <Text style={styles.icon}>💬</Text>
              <Text style={styles.icon}>🔄</Text>
              <Text style={styles.icon}>↗</Text>
            </View>
          </View>
          <View style={[styles.commentBox, { backgroundColor: colors.background50 }]}> 
            <Text style={[styles.commentText, { color: colors.textPrimary }]}>Super interessante!</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  company: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  feedbackCard: {
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 12,
    marginBottom: 18,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedbackText: {
    fontSize: 16,
    marginTop: 2,
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  icon: {
    fontSize: 28,
    color: '#6B4F3B',
  },
  commentBox: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 32,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  commentText: {
    fontSize: 20,
    fontWeight: '500',
  },
}); 