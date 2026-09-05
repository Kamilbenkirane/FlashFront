import { theme } from '@/tokens/theme';
import { StyleSheet } from 'react-native';

export const analyticsChartStyles = StyleSheet.create({
  panel: {
    marginVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  panelHeader: {
    gap: theme.spacing.xs,
  },
  panelTitle: {
    textAlign: 'left',
  },
  panelBody: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  emptyMessage: {
    textAlign: 'center',
    maxWidth: 240,
  },
  seriesContent: {
    alignItems: 'flex-end',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
  },
  seriesItem: {
    width: 72,
    alignItems: 'center',
  },
  metricSlot: {
    minHeight: 18,
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  metricLabel: {
    textAlign: 'center',
  },
  plotTrack: {
    width: 28,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: theme.borderRadius.full,
  },
  axisLabel: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  captionSlot: {
    width: '100%',
    minHeight: 30,
    marginTop: 2,
  },
  captionLabel: {
    textAlign: 'center',
  },
  breakdownList: {
    gap: theme.spacing.lg,
  },
  breakdownRow: {
    gap: theme.spacing.sm,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  breakdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  breakdownTitle: {
    flexShrink: 1,
    lineHeight: 20,
  },
  breakdownMetric: {
    textAlign: 'right',
    minWidth: 64,
  },
  breakdownSwatch: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
    marginTop: 5,
  },
  breakdownTrack: {
    width: '100%',
    height: 10,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    backgroundColor: theme.colors.secondary,
  },
  breakdownFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
});
