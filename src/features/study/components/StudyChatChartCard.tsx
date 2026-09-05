import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import useReducedMotion from '@/hooks/useReducedMotion';
import { resolveAttachmentImageUri } from '@/services/studyChat/resolveAttachmentImageUri';
import type { StudyChatChartAttachment } from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StudyChatChartCardProps {
  attachment: StudyChatChartAttachment;
}

export const StudyChatChartCard: React.FC<StudyChatChartCardProps> = ({
  attachment,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUri = resolveAttachmentImageUri(
    attachment.imagePath,
    attachment.imageDataUrl,
  );

  const openExpandedView = () => {
    setIsExpanded(true);
  };

  const closeExpandedView = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <Pressable
        onPress={openExpandedView}
        style={({ pressed }) => [
          styles.card,
          pressed ? styles.cardPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${attachment.title}. ${attachment.summary}. ${attachment.altText}. Open chart fullscreen.`}
        accessibilityHint="Shows a larger version of the chart."
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={attachment.altText}
        />
        <View style={styles.content}>
          <View style={styles.attachmentHeader}>
            <Typography variant="caption" color="primary">
              {attachment.chartType}
            </Typography>
            <View style={styles.expandHint}>
              <Typography variant="caption" color="muted">
                View
              </Typography>
              <AppIcon
                name="chevronRight"
                size={16}
                color={theme.colors.mutedForeground}
              />
            </View>
          </View>
          <Typography variant="body" style={styles.title}>
            {attachment.title}
          </Typography>
          <Typography variant="body">{attachment.summary}</Typography>
          {attachment.caption ? (
            <Typography variant="caption" color="muted">
              {attachment.caption}
            </Typography>
          ) : null}
        </View>
      </Pressable>

      <Modal
        visible={isExpanded}
        transparent
        animationType={prefersReducedMotion ? 'none' : 'fade'}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeExpandedView}
      >
        <View style={styles.viewerOverlay} accessibilityViewIsModal>
          <Pressable
            style={styles.viewerBackdrop}
            onPress={closeExpandedView}
            accessible={false}
          />
          <SafeAreaView
            edges={['top', 'right', 'bottom', 'left']}
            style={styles.viewerSafeArea}
            pointerEvents="box-none"
          >
            <View style={styles.viewerHeader}>
              <View style={styles.viewerTitle}>
                <Typography variant="heading3">{attachment.title}</Typography>
              </View>
              <Pressable
                onPress={closeExpandedView}
                style={styles.viewerCloseButton}
                accessibilityRole="button"
                accessibilityLabel="Close fullscreen chart"
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <AppIcon
                  name="close"
                  size={20}
                  color={theme.colors.foreground}
                />
              </Pressable>
            </View>
            <View style={styles.viewerImageContainer} pointerEvents="none">
              <Image
                source={{ uri: imageUri }}
                style={styles.viewerImage}
                resizeMode="contain"
                accessibilityRole="image"
                accessibilityLabel={attachment.altText}
              />
            </View>
            {attachment.caption ? (
              <Typography
                variant="caption"
                color="muted"
                style={styles.viewerCaption}
              >
                {attachment.caption}
              </Typography>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    aspectRatio: 1.35,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  attachmentHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.fontFamily.semibold,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  viewerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  viewerSafeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  viewerTitle: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  viewerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  viewerImageContainer: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCaption: {
    paddingVertical: theme.spacing.md,
  },
});
