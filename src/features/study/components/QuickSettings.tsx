import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import useReducedMotion from '@/hooks/useReducedMotion';
import type { Deck } from '@/interfaces';
import {
  STUDY_CHAT_BACKEND_KEY_MESSAGE,
  STUDY_CHAT_IMAGE_BACKEND_KEY_MESSAGE,
  type StudyChatModelOption,
} from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SessionSettings {
  studyChatModelId: string;
  studyChatImageModelId: string;
}

export interface QuickSettingsProps {
  visible: boolean;
  onClose: () => void;
  sessionSettings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
  decks: Deck[];
  selectedDeckIds: (string | number)[];
  onSelectDecks: (deckIds: (string | number)[]) => void;
  studyChatModels: StudyChatModelOption[];
  isStudyChatModelsLoading: boolean;
  studyChatModelsError?: string | null;
  studyChatImageModels: StudyChatModelOption[];
  isStudyChatImageModelsLoading: boolean;
  studyChatImageModelsError?: string | null;
  testID?: string;
}

const ModelPicker = ({
  kind,
  visible,
  models,
  loading,
  error,
  selectedId,
  onSelect,
}: {
  kind: 'text' | 'image';
  visible: boolean;
  models: StudyChatModelOption[];
  loading: boolean;
  error: string | null;
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isImage = kind === 'image';
  const selectedLabel =
    models.find((model) => model.id === selectedId)?.label ??
    (isImage ? 'Select an image model' : 'Select a model');

  useEffect(() => {
    if (!visible) setIsOpen(false);
  }, [visible]);

  return (
    <View style={styles.studyChatSection}>
      <Typography variant="heading3">
        {isImage ? 'Image model' : 'Text model'}
      </Typography>
      {loading ? (
        <Typography variant="small" color="muted">
          {isImage ? 'Loading image models…' : 'Loading models…'}
        </Typography>
      ) : models.length === 0 ? (
        <Typography variant="small" color={error ? 'error' : 'muted'}>
          {error ||
            (isImage
              ? STUDY_CHAT_IMAGE_BACKEND_KEY_MESSAGE
              : STUDY_CHAT_BACKEND_KEY_MESSAGE)}
        </Typography>
      ) : (
        <View style={styles.modelPickerSection}>
          <Pressable
            onPress={() => {
              triggerHaptic('selection');
              setIsOpen((current) => !current);
            }}
            style={styles.modelPickerTrigger}
            accessibilityRole="button"
            accessibilityLabel={
              isImage
                ? 'Change study chat image model'
                : 'Change study chat model'
            }
            accessibilityHint={
              isImage
                ? 'Shows the list of available image models.'
                : 'Shows the list of available models.'
            }
            accessibilityState={{ expanded: isOpen }}
          >
            <Typography variant="body" style={styles.modelLabel}>
              {selectedLabel}
            </Typography>
            <AppIcon
              color={theme.colors.mutedForeground}
              name={isOpen ? 'chevronUp' : 'chevronDown'}
              size={18}
            />
          </Pressable>
          {isOpen ? (
            <View style={styles.modelButtons}>
              {models.map((model) => (
                <View key={model.id} style={styles.modelButtonCell}>
                  <Button
                    title={model.label}
                    variant={selectedId === model.id ? 'primary' : 'secondary'}
                    size="lg"
                    fullWidth
                    onPress={() => {
                      triggerHaptic('selection');
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    accessibilityState={{ selected: selectedId === model.id }}
                  />
                </View>
              ))}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export const QuickSettings: React.FC<QuickSettingsProps> = ({
  visible,
  onClose,
  sessionSettings,
  onSettingsChange,
  decks,
  selectedDeckIds,
  onSelectDecks,
  studyChatModels,
  isStudyChatModelsLoading,
  studyChatModelsError = null,
  studyChatImageModels,
  isStudyChatImageModelsLoading,
  studyChatImageModelsError = null,
  testID,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const handleClose = () => {
    triggerHaptic('impact');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={prefersReducedMotion ? 'none' : 'fade'}
      onRequestClose={handleClose}
      testID={testID}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <Pressable
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + theme.spacing.md,
            paddingBottom: insets.bottom + theme.spacing.md,
          },
        ]}
        onPress={handleClose}
        accessible={false}
      >
        <Pressable
          style={styles.panel}
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
          accessible={false}
        >
          <Card variant="raised" padding="none" style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Typography variant="heading2" accessibilityRole="header">
                  Session settings
                </Typography>
              </View>
              <Pressable
                onPress={handleClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close session settings"
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <AppIcon
                  color={theme.colors.foreground}
                  name="close"
                  size={18}
                />
              </Pressable>
            </View>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.body}>
                <View style={styles.deckSection}>
                  <Typography variant="heading3">Decks</Typography>
                  <DecksMultiSelect
                    decks={decks}
                    onSelectDecks={onSelectDecks}
                    selectedDeckIds={selectedDeckIds}
                  />
                </View>

                <ModelPicker
                  kind="text"
                  visible={visible}
                  models={studyChatModels}
                  loading={isStudyChatModelsLoading}
                  error={studyChatModelsError}
                  selectedId={sessionSettings.studyChatModelId}
                  onSelect={(id) =>
                    onSettingsChange({
                      ...sessionSettings,
                      studyChatModelId: id,
                    })
                  }
                />
                <ModelPicker
                  kind="image"
                  visible={visible}
                  models={studyChatImageModels}
                  loading={isStudyChatImageModelsLoading}
                  error={studyChatImageModelsError}
                  selectedId={sessionSettings.studyChatImageModelId}
                  onSelect={(id) =>
                    onSettingsChange({
                      ...sessionSettings,
                      studyChatImageModelId: id,
                    })
                  }
                />
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <Button
                title="Done"
                variant="primary"
                size="lg"
                onPress={handleClose}
                fullWidth
              />
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  panel: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '100%',
  },
  card: {
    maxHeight: '100%',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  headerCopy: {
    flex: 1,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary,
  },
  body: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xxl,
  },
  deckSection: {
    gap: theme.spacing.sm,
  },
  studyChatSection: {
    gap: theme.spacing.sm,
  },
  modelPickerSection: {
    gap: theme.spacing.sm,
  },
  modelPickerTrigger: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modelLabel: {
    flex: 1,
  },
  modelButtons: {
    gap: theme.spacing.sm,
  },
  modelButtonCell: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
});
