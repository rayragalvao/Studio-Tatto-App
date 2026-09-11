import { ImageBackground, Pressable, Text, View } from 'react-native';
import { styles } from '../screens/FlashScreen.styles';

export default function FlashCard({ nome, detalhe, imagem, preco, aplicado }) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.flashCard,
                pressed && styles.flashCardPressed,
            ]}
        >
            <ImageBackground
                source={imagem}
                style={styles.flashCardImage}
                imageStyle={styles.flashCardPhoto}
                resizeMode="contain"
            >
                {aplicado && (
                    <View style={styles.flashCardAppliedOverlay}>
                        <Text style={styles.flashCardAppliedText}>APLICADO</Text>
                    </View>
                )}
                <Text style={styles.flashCardPrice}>R${preco}</Text>
            </ImageBackground>
            <View style={styles.flashCardContent}>
                <Text style={styles.flashCardName}>{nome}</Text>
                <Text style={styles.flashCardDetail}>{detalhe}</Text>
            </View>
        </Pressable>
    );
}
