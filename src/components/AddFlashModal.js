import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { styles } from '../screens/flash/FlashScreen.styles';

export default function AddFlashModal({ visible, onClose, onSave, flashParaEditar }) {
    const [nome, setNome] = useState('');
    const [detalhe, setDetalhe] = useState('');
    const [preco, setPreco] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagemUri, setImagemUri] = useState(null);
    const [imagemOriginal, setImagemOriginal] = useState(null);

    const emEdicao = !!flashParaEditar;

    useEffect(() => {
        if (flashParaEditar) {
            setNome(flashParaEditar.nome ?? '');
            setDetalhe(flashParaEditar.detalhe ?? '');
            setPreco(String(flashParaEditar.preco ?? ''));
            setDescricao(flashParaEditar.descricao ?? '');
            setImagemUri(flashParaEditar.imagem?.uri ?? null);
            setImagemOriginal(flashParaEditar.imagem ?? null);
        }
    }, [flashParaEditar]);

    const limparCampos = () => {
        setNome('');
        setDetalhe('');
        setPreco('');
        setDescricao('');
        setImagemUri(null);
        setImagemOriginal(null);
    };

    const handleFechar = () => {
        limparCampos();
        onClose();
    };

    const escolherImagem = async () => {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para continuar.');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!resultado.canceled) {
            setImagemUri(resultado.assets[0].uri);
        }
    };

    const handleSalvar = () => {
        if (!nome.trim() || !preco.trim() || (!imagemUri && !imagemOriginal)) {
            Alert.alert('Campos obrigatórios', 'Preencha ao menos nome, preço e escolha uma imagem.');
            return;
        }

        const imagemFinal = imagemUri
            ? (imagemUri.startsWith('file') || imagemUri.startsWith('http') ? { uri: imagemUri } : imagemUri)
            : imagemOriginal;

        onSave({
            codigo: emEdicao ? flashParaEditar.codigo : `F-${Date.now()}`,
            nome: nome.trim(),
            detalhe: detalhe.trim(),
            preco: preco.trim(),
            descricao: descricao.trim(),
            imagem: imagemFinal,
            aplicado: flashParaEditar?.aplicado,
        });

        limparCampos();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleFechar}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalName}>{emEdicao ? 'Editar Flash' : 'Novo Flash'}</Text>
                            <TouchableOpacity onPress={handleFechar} hitSlop={10}>
                                <Ionicons name="close" size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.imagePickerBox} onPress={escolherImagem}>
                            {imagemUri ? (
                                <Image
                                    source={typeof imagemUri === 'string' ? { uri: imagemUri } : imagemUri}
                                    style={styles.imagePickerPreview}
                                />
                            ) : (
                                <>
                                    <Ionicons name="image-outline" size={28} color={colors.textMuted} />
                                    <Text style={styles.imagePickerText}>Escolher foto</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nome do flash"
                            placeholderTextColor={colors.textPlaceholder}
                            value={nome}
                            onChangeText={setNome}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Estilo (ex: Old School, Aquarela)"
                            placeholderTextColor={colors.textPlaceholder}
                            value={detalhe}
                            onChangeText={setDetalhe}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Preço (ex: 280)"
                            placeholderTextColor={colors.textPlaceholder}
                            value={preco}
                            onChangeText={setPreco}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.modalInput, styles.modalInputMultiline]}
                            placeholder="Descrição"
                            placeholderTextColor={colors.textPlaceholder}
                            value={descricao}
                            onChangeText={setDescricao}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity style={styles.modalEditButton} onPress={handleSalvar}>
                            <Ionicons name="checkmark" size={16} color={colors.text} />
                            <Text style={styles.modalEditButtonText}>
                                {emEdicao ? 'Salvar alterações' : 'Salvar flash'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}