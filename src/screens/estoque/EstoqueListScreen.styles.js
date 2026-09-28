import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 16, marginTop: 2 },

  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(23, 166, 171, 0.3)',
    borderWidth: 1,
    borderColor: '#00D3F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 15,
  },
  scanButtonText: { color: '#00D3F2', fontSize: 14, fontWeight: '700' },
  notesToggle: { alignSelf: 'flex-start', paddingVertical: 5 },
  notesToggleText: { color: '#00D3F2', fontSize: 13, fontWeight: '700' },
  notesCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 12, paddingHorizontal: 12 },
  noteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  noteName: { color: colors.text, fontSize: 13, flex: 1 },
  noteRemove: { color: '#ff7878', fontSize: 13, fontWeight: '700', paddingLeft: 16 },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterLabel: { fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  statusBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  itemInfo: { flex: 1 },
  itemMaterial: { color: colors.text, fontSize: 16, fontWeight: '700' },
  itemDetail: { color: colors.textMuted, fontSize: 14, marginTop: 4 },

  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemQtd: { color: colors.text, fontSize: 17, fontWeight: '800' },
  itemUnidade: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },

  reposicaoBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  reposicaoBadgeText: { fontSize: 13, fontWeight: '700' },

  divider: { height: 1, backgroundColor: colors.cardBorder },

  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
