import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
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
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    // Carregar o tipo de usuário do AsyncStorage
    const loadUserType = async () => {
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);
    };
    loadUserType();
  }, []);

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
  };

  // Se o tipo de usuário ainda não foi carregado, não renderiza nada
  if (!userType) {
    return null;
  }

  return (
    <Tabs screenOptions={commonScreenOptions}>
      {userType === 'empresa' ? (
        // Navegação para empresa
        <>
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Administração',
              tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
            }}
          />
        </>
      ) : (
        // Navegação para cliente
        <>
          <Tabs.Screen
            name="index"
            options={{
              headerShown: false,
              title: 'Feed',
              tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            }}
          />
          <Tabs.Screen
            name="two"
            options={{
              title: 'UI',
              tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
            }}
          />
        </>
      )}
    </Tabs>
  );
}
