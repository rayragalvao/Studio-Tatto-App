import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { styles as base } from './EscanearNotaModal.styles';

export const styles = StyleSheet.create({
  ...base,
  modalBox: { ...base.modalBox, maxWidth: 440 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipAtivo: { borderColor: '#00D3F2', backgroundColor: 'rgba(23,166,171,0.25)' },
  chipText: { color: colors.textMuted, fontSize: 12 },
  chipTextAtivo: { color: '#00D3F2', fontWeight: '700' },
  modoRow: { flexDirection: 'row', gap: 6 },
  modoBotao: { flex: 1, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  modoBotaoAtivo: { borderColor: '#00D3F2', backgroundColor: 'rgba(23,166,171,0.25)' },
  modoTexto: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  modoTextoAtivo: { color: '#00D3F2', fontWeight: '700' },
  atualText: { color: colors.text, fontSize: 14 },
  previewText: { color: '#00D3F2', fontSize: 13, fontWeight: '700' },
});
