import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 4, lineHeight: 18 },
  pendingBadge: {
    backgroundColor: 'rgba(226,168,62,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: { color: colors.warning, fontSize: 10, fontWeight: '700' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: colors.text },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  clientName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  dateLabel: { color: colors.textMuted, fontSize: 10 },

  styleBadge: {
    backgroundColor: 'rgba(159,18,20,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  styleBadgeText: { color: colors.text, fontSize: 10, fontWeight: '600' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },

  description: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },

  scheduledRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  scheduledText: { color: colors.warning, fontSize: 12, fontWeight: '600' },

  aiBar: {
    backgroundColor: 'rgba(34,184,207,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,184,207,0.25)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  aiBarTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  aiLabel: { color: colors.info, fontSize: 12, fontWeight: '700' },
  aiPrice: { color: colors.info, fontSize: 14, fontWeight: '800' },
  aiSeparator: { color: colors.textMuted, fontSize: 12 },
  aiDuration: { color: colors.textMuted, fontSize: 12 },
  aiConfidence: { color: colors.textPlaceholder, fontSize: 10, marginTop: 6 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: { fontSize: 12, fontWeight: '700' },

  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
  },
  emptyText: { color: colors.textMuted, fontSize: 13 },
});
