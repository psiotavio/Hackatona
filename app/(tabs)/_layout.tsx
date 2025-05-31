import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useNavigation, router, usePathname } from 'expo-router';
import { Pressable, AppState, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { user, loading, isAuthenticated } = useAuth();
  const [isEmpresa, setIsEmpresa] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Verificar autenticação e redirecionar se necessário
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, loading]);

  // Função para verificar o tipo de usuário
  const checkUserType = async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const type = await AsyncStorage.getItem('userType');
      
      setIsEmpresa(type === 'empresa');
      setIsLoading(false);
      
      // Redirecionar se necessário
      if (type !== 'empresa' && pathname.includes('/admin')) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Erro ao verificar tipo de usuário:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkUserType();
    }
    
    // Verificar o tipo de usuário quando o aplicativo voltar para o primeiro plano
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && user) {
        checkUserType();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user, pathname]);

  // Configuração comum para todas as abas
  const commonScreenOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.background20,
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
    },
    tabBarIndicatorStyle: {
      height: 30,
      backgroundColor: colors.secondary,
    },
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      color: colors.titlePrimary,
    },
    tabBarHideOnKeyboard: true
  };

  // Tela de carregamento
  if (isLoading || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textPrimary }}>Carregando...</Text>
      </View>
    );
  }

  // Se o usuário não estiver autenticado, não mostrar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Layout para empresa
  if (isEmpresa) {
    return (
      <Tabs screenOptions={commonScreenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="loja"
          options={{
            title: 'Loja',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
          }}
        />
        <Tabs.Screen
          name="criarpost"
          options={{
            title: 'Criar',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      </Tabs>
    );
  }

  // Layout para cliente
  return (
    <Tabs screenOptions={commonScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="loja"
        options={{
          title: 'Loja',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="criarpost"
        options={{
          title: 'Criar',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
