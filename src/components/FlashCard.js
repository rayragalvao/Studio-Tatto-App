import { ImageBackground, Text, View } from 'react-native';
import { styles } from '../screens/FlashScreen.styles';

export default function FlashCard({ nome, detalhe, imagem, preco }) {
    return (
        <View style={styles.flashCard}>
            <ImageBackground
                source={imagem}
                style={styles.flashCardImage}
                imageStyle={styles.flashCardPhoto}
                resizeMode="contain"
            >
                <Text style={styles.flashCardPrice}>R${preco}</Text>
            </ImageBackground>
            <View style={styles.flashCardContent}>
                <Text style={styles.flashCardName}>{nome}</Text>
                <Text style={styles.flashCardDetail}>{detalhe}</Text>
            </View>
        </View>
    );
}
