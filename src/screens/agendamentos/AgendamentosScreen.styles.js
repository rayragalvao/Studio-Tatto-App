import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4, lineHeight: 18 },
  pendingBadge: {
    backgroundColor: 'rgba(226,168,62,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: { color: colors.warning, fontSize: 13, fontWeight: '700' },

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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
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
  },
  cardHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  clientName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  styleBadge: {
    backgroundColor: 'rgba(159,18,20,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  styleBadgeText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scheduleText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 19, marginTop: 10 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionButtonWrapper: { flex: 1 },
  actionButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 11,
    paddingHorizontal: 10,
  },
  actionButtonText: { fontSize: 13, fontWeight: '700' },

  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: colors.textMuted, fontSize: 13 },
});
