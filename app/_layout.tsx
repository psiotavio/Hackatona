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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (loading) return;

    // Verificar se já mostrou a tela de boas-vindas ao usuário
    const checkWelcomeScreen = async () => {
      try {
        if (!initialized) {
          const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
          
          // Se é a primeira inicialização ou o usuário não está autenticado,
          // redirecionar para a tela de boas-vindas
          if (!hasSeenWelcome || !user) {
            if (!hasSeenWelcome) {
              await AsyncStorage.setItem('hasSeenWelcome', 'true');
            }
            
            // Verificar se não está já nas telas permitidas sem autenticação
            const inAuthGroup = 
              segments[0] === 'welcome' || 
              segments[0] === 'login' || 
              segments[0] === 'register';
            
            if (!inAuthGroup) {
              router.replace('/welcome');
            }
          } else if (segments[0] !== '(tabs)' && !segments[0]?.includes('card-details')) {
            // Se está autenticado e não está nas tabs, redirecionar para as tabs
            router.replace('/(tabs)');
          }
          
          setInitialized(true);
        }
      } catch (error) {
        console.error("Erro ao verificar status de autenticação:", error);
      }
    };
    
    checkWelcomeScreen();
  }, [user, loading, segments, initialized]);
  
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
