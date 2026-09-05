import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import type React from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { analyticsChartStyles as styles } from './styles';

interface AnalyticsPanelProps {
  title: string;
  children: ReactNode;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  title,
  children,
}) => {
  return (
    <Card variant="default" padding="lg" style={styles.panel}>
      <View style={styles.panelHeader}>
        <Typography variant="heading3" style={styles.panelTitle}>
          {title}
        </Typography>
      </View>
      <View style={styles.panelBody}>{children}</View>
    </Card>
  );
};
