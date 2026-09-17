import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const fundo = '#1A1313';
const superficie = '#211717';
const borda = '#3B2424';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: fundo },
  bordaCabecalho: { borderBottomWidth: 1, borderBottomColor: borda },
  conteudo: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 },
  titulo: { color: colors.text, fontSize: 16, fontWeight: '700' },
  subtitulo: { color: colors.textMuted, fontSize: 11, marginTop: 5 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(226,168,62,0.10)',
    borderColor: 'rgba(226,168,62,0.28)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  textoAviso: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 18 },
  cartao: {
    backgroundColor: superficie,
    borderColor: borda,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 16,
  },
  campo: { gap: 7 },
  rotulo: { color: colors.textMuted, fontSize: 10, letterSpacing: 0.8 },
  entrada: {
    height: 43,
    color: colors.textMuted,
    backgroundColor: '#281919',
    borderColor: borda,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 12,
    opacity: 0.6,
  },
  botaoDesabilitado: {
    minHeight: 45,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  textoBotao: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
