import { Modal, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { styles } from '../screens/FlashScreen.styles';

export default function FlashDetailModal({ flash, visible, onClose, onEdit }) {
    if (!flash) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <ImageBackground source={flash.imagem} style={styles.modalImageWrapper} resizeMode="cover">
                        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose} hitSlop={10}>
                            <Ionicons name="close" size={18} color={colors.text} />
                        </TouchableOpacity>
                        {flash.codigo && (
                            <View style={styles.modalCodeBadge}>
                                <Text style={styles.modalCodeText}>{flash.codigo}</Text>
                            </View>
                        )}
                    </ImageBackground>

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeaderRow}>
                            <View>
                                <Text style={styles.modalName}>{flash.nome}</Text>
                                <Text style={styles.modalDetail}>{flash.detalhe}</Text>
                            </View>
                            <Text style={styles.modalPrice}>R$ {flash.preco}</Text>
                        </View>

                        {flash.descricao && (
                            <Text style={styles.modalDescription}>{flash.descricao}</Text>
                        )}

                        <TouchableOpacity style={styles.modalEditButton} onPress={() => onEdit(flash)}>
                            <Ionicons name="pencil" size={16} color={colors.text} />
                            <Text style={styles.modalEditButtonText}>Editar flash</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}