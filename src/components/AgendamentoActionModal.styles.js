import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 19, fontWeight: '800' },
  message: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  secondaryText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 11,
  },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
