import { ActivityIndicator, Modal, ScrollView, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { styles } from '../screens/flash/FlashScreen.styles';

export default function FlashDetailModal({
  flash, visible, onClose, onEdit, onToggleAplicado, onDelete,
  salvando, erro, confirmandoExclusao, onPedirExclusao, onCancelarExclusao,
}) {
  if (!flash) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { maxHeight: '90%' }]}>
          <ScrollView>
            <ImageBackground source={flash.imagem} style={styles.modalImageWrapper}
              imageStyle={flash.aplicado ? { opacity: 0.35 } : undefined}
              resizeMode="cover">
              <TouchableOpacity style={styles.modalCloseButton} disabled={salvando}
                onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.modalCodeBadge}>
                <Text style={styles.modalCodeText}>{flash.codigo}</Text>
              </View>
            </ImageBackground>

            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalName}>{flash.nome}</Text>
                  <Text style={styles.modalDetail}>{flash.detalhe}</Text>
                </View>
                <Text style={styles.modalPrice}>R$ {flash.preco}</Text>
              </View>

              <Text style={{
                color: flash.aplicado ? '#bbb' : colors.success,
                fontWeight: '700', marginBottom: 12,
              }}>
                {flash.aplicado ? 'Já utilizado' : 'Disponível'}
              </Text>

              {!!flash.descricao && (
                <Text style={styles.modalDescription}>{flash.descricao}</Text>
              )}

              {!!erro && (
                <Text style={{ color: colors.danger, marginBottom: 12 }}>{erro}</Text>
              )}

              {confirmandoExclusao ? (
                <View>
                  <Text style={[styles.modalDescription, { marginBottom: 12 }]}>
                    Excluir "{flash.nome}" do catálogo? Esta ação não pode ser desfeita.
                  </Text>
                  <TouchableOpacity style={[styles.modalEditButton, { backgroundColor: colors.danger }]}
                    disabled={salvando} onPress={() => onDelete(flash)}>
                    <Text style={styles.modalEditButtonText}>Sim, excluir flash</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalEditButton, { marginTop: 10 }]}
                    disabled={salvando} onPress={onCancelarExclusao}>
                    <Text style={styles.modalEditButtonText}>Voltar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity style={styles.modalEditButton}
                    disabled={salvando} onPress={() => onEdit(flash)}>
                    <Ionicons name="pencil" size={16} color={colors.text} />
                    <Text style={styles.modalEditButtonText}>Editar flash</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.modalEditButton, { marginTop: 10 }]}
                    disabled={salvando} onPress={() => onToggleAplicado(flash)}>
                    <Ionicons name={flash.aplicado ? 'refresh-outline' : 'checkmark-done-outline'}
                      size={16} color={colors.text} />
                    <Text style={styles.modalEditButtonText}>
                      {flash.aplicado ? 'Marcar como disponível' : 'Marcar como utilizado'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalEditButton, { marginTop: 10, backgroundColor: colors.danger }]}
                    disabled={salvando} onPress={onPedirExclusao}>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={[styles.modalEditButtonText, { color: '#fff' }]}>Excluir flash</Text>
                  </TouchableOpacity>
                </View>
              )}

              {salvando && <ActivityIndicator style={{ marginTop: 12 }} color={colors.info} />}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}