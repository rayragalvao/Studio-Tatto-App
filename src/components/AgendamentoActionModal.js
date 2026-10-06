import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { styles } from './AgendamentoActionModal.styles';

export default function AgendamentoActionModal({ action, onClose, onConfirm }) {
  if (!action) return null;

  const isCancel = action.type === 'cancelar';
  const isConclude = action.type === 'concluir';
  const isConfirmedCancellation = isCancel && action.item.status === 'confirmado';
  const title = isCancel
    ? `${isConfirmedCancellation ? 'Cancelar' : 'Negar'} agendamento?`
    : isConclude ? 'Concluir agendamento?' : 'Confirmar agendamento?';
  const message = isCancel
    ? `O horário de ${action.item.nome} será marcado como cancelado.`
    : isConclude
      ? `Você vai registrar os detalhes da sessão de ${action.item.nome} na próxima tela.`
      : `O agendamento de ${action.item.nome} será movido para confirmados.`;
  const confirmLabel = isCancel ? (isConfirmedCancellation ? 'Cancelar' : 'Negar') : isConclude ? 'Continuar' : 'Confirmar';
  const confirmColor = isCancel ? colors.danger : isConclude ? colors.info : colors.success;
  const icon = isCancel
    ? 'close-circle-outline'
    : isConclude
      ? 'checkmark-done-outline'
      : 'checkmark-circle-outline';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={24} color={confirmColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={styles.primaryText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
