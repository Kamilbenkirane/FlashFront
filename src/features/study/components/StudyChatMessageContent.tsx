import { MathText } from '@/components/ui/MathText';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet } from 'react-native';

interface StudyChatMessageContentProps {
  content: string;
  isStreaming?: boolean;
}

export const StudyChatMessageContent: React.FC<
  StudyChatMessageContentProps
> = ({ content, isStreaming = false }) => {
  return (
    <MathText
      content={content}
      textColor={theme.colors.foreground}
      fontSize={theme.typography.body.fontSize}
      lineHeight={theme.typography.body.lineHeight + 2}
      textAlign="left"
      verticalAlign="top"
      fillContainer={false}
      layoutMode="auto"
      disablePointerEvents={false}
      hideFromAccessibility={false}
      style={styles.content}
      renderKey={isStreaming ? undefined : content}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    minWidth: 0,
  },
});
