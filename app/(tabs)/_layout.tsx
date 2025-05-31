import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useNavigation, router, usePathname } from 'expo-router';
import { Pressable, AppState, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const [isEmpresa, setIsEmpresa] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Função para verificar o tipo de usuário
  const checkUserType = async () => {
    try {
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
    checkUserType();
    
    // Verificar o tipo de usuário quando o aplicativo voltar para o primeiro plano
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkUserType();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [pathname]);

  // Configuração comum para todas as abas
  const commonScreenOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
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
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
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
            tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
          }}
        />
        <Tabs.Screen
          name="criarpost"
          options={{
            title: 'Criar',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
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
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="criarpost"
        options={{
          title: 'Criar',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
