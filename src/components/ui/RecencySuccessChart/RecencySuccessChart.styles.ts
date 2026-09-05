import type { Theme } from '@/tokens/theme';
import { StyleSheet } from 'react-native';

export const createRecencySuccessChartStyles = (theme: Theme) =>
  StyleSheet.create({
    panel: {
      marginVertical: theme.spacing.sm,
      gap: theme.spacing.lg,
    },
    header: {
      gap: theme.spacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    filterButton: {
      minWidth: 58,
    },
    detailCard: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    detailHeader: {
      gap: 2,
    },
    detailStatsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    detailStat: {
      flex: 1,
      gap: 2,
    },
    chartBlock: {
      gap: theme.spacing.md,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: theme.spacing.sm,
    },
    yAxis: {
      width: 34,
      justifyContent: 'space-between',
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    yAxisLabel: {
      textAlign: 'right',
    },
    plotSurface: {
      flex: 1,
      height: 180,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      overflow: 'hidden',
    },
    axisRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    axisSlot: {
      flex: 1,
      minHeight: 64,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      gap: 2,
    },
    axisLabel: {
      textAlign: 'center',
      width: '100%',
    },
    axisCount: {
      textAlign: 'center',
      width: '100%',
    },
    emptyState: {
      gap: theme.spacing.sm,
    },
    footer: {
      gap: 2,
    },
  });
