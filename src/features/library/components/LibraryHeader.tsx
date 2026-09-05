import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

export const LibraryHeader: React.FC = () => (
  <View style={styles.header}>
    <Typography variant="heading1">Library</Typography>
  </View>
);

const styles = StyleSheet.create({
  header: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg },
});
