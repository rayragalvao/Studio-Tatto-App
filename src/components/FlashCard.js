import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { styles } from '../screens/flash/FlashScreen.styles';

export default function FlashCard({
  nome, detalhe, imagem, preco, aplicado = false, onPress,
}) {
  return (
    <TouchableOpacity
      style={[styles.flashCard, aplicado && visual.cardUtilizado]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${nome}, ${aplicado ? 'já utilizado' : 'disponível'}`}
    >
      <ImageBackground
        source={imagem}
        style={[styles.flashCardImage, aplicado && visual.fundoUtilizado]}
        imageStyle={[styles.flashCardPhoto, aplicado && visual.fotoUtilizada]}
        resizeMode="contain"
      >
        {aplicado && (
          <>
            <View pointerEvents="none" style={visual.camadaCinza} />
            <View style={visual.selo}>
              <Text style={visual.textoSelo}>✓ Já utilizado</Text>
            </View>
          </>
        )}
        <Text style={styles.flashCardPrice}>R$ {preco}</Text>
      </ImageBackground>

      <View style={styles.flashCardContent}>
        <Text style={[styles.flashCardName, aplicado && visual.nomeUtilizado]}>
          {nome}
        </Text>
        <Text style={styles.flashCardDetail}>{detalhe}</Text>
      </View>
    </TouchableOpacity>
  );
}

const visual = StyleSheet.create({
  cardUtilizado: {
    backgroundColor: '#303030',
    borderColor: '#606060',
  },
  fundoUtilizado: {
    backgroundColor: '#777777',
  },
  fotoUtilizada: {
    opacity: 0.35,
  },
  camadaCinza: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(100, 100, 100, 0.35)',
  },
  selo: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
    backgroundColor: '#383838',
    borderColor: '#aaaaaa',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  textoSelo: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  nomeUtilizado: {
    color: '#cccccc',
  },
});