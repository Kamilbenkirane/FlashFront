import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { resolveAttachmentImageUri } from '@/services/studyChat/resolveAttachmentImageUri';
import type { StudyChatChartAttachment } from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import { BlurView } from 'expo-blur';
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
        accessibilityLabel={`${attachment.title}. Open chart fullscreen.`}
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
          <Typography variant="small" color="muted">
            {attachment.chartType}
          </Typography>
          <Typography variant="body" style={styles.title}>
            {attachment.title}
          </Typography>
          <Typography variant="small">{attachment.summary}</Typography>
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
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeExpandedView}
      >
        <View style={styles.viewerOverlay} accessibilityViewIsModal>
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={styles.viewerBackdrop}
            onPress={closeExpandedView}
            accessibilityRole="button"
            accessibilityLabel="Close fullscreen chart"
          />
          <SafeAreaView
            edges={['top', 'right', 'bottom', 'left']}
            style={styles.viewerSafeArea}
            pointerEvents="box-none"
          >
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
                color={theme.colors.primaryForeground}
              />
            </Pressable>
            <View style={styles.viewerImageContainer} pointerEvents="none">
              <Image
                source={{ uri: imageUri }}
                style={styles.viewerImage}
                resizeMode="contain"
                accessibilityRole="image"
                accessibilityLabel={attachment.altText}
              />
            </View>
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
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  image: {
    width: '100%',
    aspectRatio: 1.35,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fontFamily.semibold,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  viewerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  viewerSafeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  viewerCloseButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
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
});
