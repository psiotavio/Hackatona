import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

export { 
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';    
  
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'welcome', 
};
 
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Componente para gerenciar o redirecionamento baseado em autenticação
function AuthenticationGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // Verifica se o usuário está na rota de autenticação ou protegida
    const inAuthGroup = segments[0] === 'welcome' || 
                       segments[0] === 'login' || 
                       segments[0] === 'register' ||
                       segments[0] === 'pendente';
    
    // Se não estiver autenticado e não estiver nas rotas de autenticação, redirecionar para welcome
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/welcome');
    } 
    // Se estiver autenticado e estiver em uma rota de autenticação, redirecionar para a home
    else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const { currentTheme } = useTheme();
  const navigationTheme = currentTheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar
        barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={navigationTheme.colors.background}
      />  
      <Stack
        initialRouteName="welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: navigationTheme.colors.background,
          },
          headerTintColor: navigationTheme.colors.text,
          headerTitleStyle: {
            color: navigationTheme.colors.text,
          }, 
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="pendente" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="card-details" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="criar-post" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerStyle: {
              backgroundColor: navigationTheme.colors.background,
            },
            headerTintColor: navigationTheme.colors.text,
          }} 
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticationGuard>
          <RootLayoutNav />
        </AuthenticationGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
