import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { styles } from './SplashScreen.styles';
import { useAuth } from '../../context/AuthContext';

export default function SplashScreen({ navigation }) {
  const { autenticado, carregandoSessao } = useAuth();

  useEffect(() => {
    if (carregandoSessao) return undefined;
    const timer = setTimeout(() => {
      navigation.replace(autenticado ? 'Main' : 'Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [autenticado, carregandoSessao, navigation]);

  return (
    <View style={styles.container}>
      <Svg style={styles.glow} width="500" height="500">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#D70004" stopOpacity="0.35" />
            <Stop offset="60%" stopColor="#D70004" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#D70004" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="500" height="500" fill="url(#glow)" />
      </Svg>

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.logoText}>ORCANA</Text>
      </View>
    </View>
  );
}