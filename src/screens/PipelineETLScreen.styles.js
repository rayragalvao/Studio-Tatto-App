import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },

  pageTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
  },

  pageSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(61,220,132,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(61,220,132,0.25)',
    borderRadius: 20,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },

  onlineText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },

  lastExecutionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },

  lastExecutionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(61,220,132,0.10)',
    marginRight: 12,
  },

  lastExecutionInfo: {
    flex: 1,
  },

  lastExecutionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: '700',
  },

  lastExecutionValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
  },

  lastExecutionSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(61,220,132,0.10)',
  },

  successBadgeText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },

  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  scheduleText: {
    color: colors.textMuted,
    fontSize: 9,
  },

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },

  stepHeaderText: {
    flex: 1,
  },

  stepTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  stepSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },

  stepStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  stepStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },

  pipelineCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },

  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  pipelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  pipelineInfo: {
    flex: 1,
    paddingRight: 8,
  },

  pipelineItemTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  pipelineItemDescription: {
    color: colors.textMuted,
    fontSize: 9.5,
    marginTop: 3,
    lineHeight: 14,
  },

  pipelineValue: {
    color: colors.textMuted,
    fontSize: 9,
  },

  itemSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  itemSuccessText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '600',
  },

  rowDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: 47,
  },

  connector: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  connectorLine: {
    width: 1,
    height: 20,
    opacity: 0.4,
  },

  historySection: {
    marginTop: 30,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  historyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  historySubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  historyCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  historyCountText: {
    color: colors.textMuted,
    fontSize: 9,
  },

  historyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },

  table: {
    minWidth: 620,
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },

  tableHeaderText: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
  },

  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },

  tableText: {
    color: colors.textMuted,
    fontSize: 9.5,
  },

  tableId: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },

  colId: {
    width: 60,
  },

  colDate: {
    width: 110,
  },

  colTime: {
    width: 70,
  },

  colDuration: {
    width: 90,
  },

  colRecords: {
    width: 95,
  },

  colStatus: {
    width: 105,
  },

  executionStatus: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  executionSuccess: {
    backgroundColor: 'rgba(61,220,132,0.10)',
  },

  executionError: {
    backgroundColor: 'rgba(255,83,104,0.10)',
  },

  executionStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
});