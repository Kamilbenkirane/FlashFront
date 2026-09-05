import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { resolveAttachmentImageUri } from '@/services/studyChat/resolveAttachmentImageUri';
import type { StudyChatImageAttachment } from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import { BlurView } from 'expo-blur';
import type React from 'react';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StudyChatImageCardProps {
  attachment: StudyChatImageAttachment;
}

export const StudyChatImageCard: React.FC<StudyChatImageCardProps> = ({
  attachment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUri = resolveAttachmentImageUri(
    attachment.imagePath,
    attachment.imageDataUrl,
  );

  return (
    <>
      <Pressable
        onPress={() => setIsExpanded(true)}
        style={({ pressed }) => [
          styles.card,
          pressed ? styles.cardPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${attachment.title}. Open image fullscreen.`}
        accessibilityHint="Shows a larger version of the generated image."
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={attachment.altText}
        />
        <View style={styles.content}>
          <Typography variant="small" color="muted">
            Illustration
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
        onRequestClose={() => setIsExpanded(false)}
      >
        <View style={styles.viewerOverlay} accessibilityViewIsModal>
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={styles.viewerBackdrop}
            onPress={() => setIsExpanded(false)}
            accessibilityRole="button"
            accessibilityLabel="Close fullscreen image"
          />
          <SafeAreaView
            edges={['top', 'right', 'bottom', 'left']}
            style={styles.viewerSafeArea}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={() => setIsExpanded(false)}
              style={styles.viewerCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close fullscreen image"
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
