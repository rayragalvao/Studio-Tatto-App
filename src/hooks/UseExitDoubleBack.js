import { useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Hook: no Android, ao apertar voltar na tela onde este hook está ativo,
// exige um segundo toque em até 2s para realmente sair do app.
// Em telas que NÃO são a raiz (ex: dentro de um Stack com mais telas),
// simplesmente não use este hook — o goBack() padrão já funciona normal.
export function useExitOnDoubleBack() {
  const lastBackPress = useRef(0);

  useFocusEffect(() => {
    const onBackPress = () => {
      const now = Date.now();

      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPress.current = now;

      if (Platform.OS === 'android') {
        ToastAndroid.show('Toque novamente para sair', ToastAndroid.SHORT);
      }

      // retornar true impede o comportamento padrão (fechar o app na hora)
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  });
}