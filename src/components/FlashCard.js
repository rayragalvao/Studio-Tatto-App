import { View, Text } from 'react-native';
import { styles } from '../screens/FlashScreen.styles';

export default function FlashCard({ nome, detalhe, imagem, preco }) {
    return (
        <View style={styles.flashCard}>
            <View style={styles.flashCardImage}>
                <Text style={styles.flashCardPrice}>R${preco}</Text>
            </View>
            <View style={styles.flashCardContent}>
                <Text style={styles.flashCardName}>{nome} {detalhe.toLowerCase()}</Text>
                <Text style={styles.flashCardDetail}>Neotradicional</Text>
            </View>
        </View>
    );
}
