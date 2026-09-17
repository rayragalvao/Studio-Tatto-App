import React, { useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import SplashScreenComponent from './src/screens/SplashScreen';
import Login from './src/screens/Login';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import PerfilUsuarioScreen from './src/screens/PerfilUsuarioScreen';
import AlterarSenhaScreen from './src/screens/AlterarSenhaScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { enableScreens } from 'react-native-screens';
enableScreens();

// Mantém a splash NATIVA visível até a navegação estar pronta
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const onReady = useCallback(() => {
    // Nesse ponto a tela "Splash" (a sua, com o glow vermelho e a logo)
    // já está renderizada por baixo da nativa. Como as duas usam o mesmo
    // fundo e a mesma logo, esconder a nativa agora fica imperceptível.
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer onReady={onReady}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreenComponent} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Main" component={DrawerNavigator} />
              <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} />
              <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
