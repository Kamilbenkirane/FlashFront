import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import type { Deck } from '@/interfaces';
import {
  STUDY_CHAT_BACKEND_KEY_MESSAGE,
  STUDY_CHAT_IMAGE_BACKEND_KEY_MESSAGE,
  type StudyChatModelOption,
} from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isImageModelPickerOpen, setIsImageModelPickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsModelPickerOpen(false);
      setIsImageModelPickerOpen(false);
    }
  }, [visible]);

  const selectedModelLabel = useMemo(() => {
    const selectedModel = studyChatModels.find(
      (model) => model.id === sessionSettings.studyChatModelId,
    );
    return selectedModel?.label ?? 'Select a model';
  }, [sessionSettings.studyChatModelId, studyChatModels]);

  const selectedImageModelLabel = useMemo(() => {
    const selectedModel = studyChatImageModels.find(
      (model) => model.id === sessionSettings.studyChatImageModelId,
    );
    return selectedModel?.label ?? 'Select an image model';
  }, [sessionSettings.studyChatImageModelId, studyChatImageModels]);

  const handleSettingChange = (
    key: string,
    value: boolean | string | number,
  ) => {
    triggerHaptic('selection');
    onSettingsChange({ ...sessionSettings, [key]: value });
  };

  const handleModelPickerToggle = () => {
    triggerHaptic('selection');
    setIsModelPickerOpen((currentValue) => !currentValue);
  };

  const handleImageModelPickerToggle = () => {
    triggerHaptic('selection');
    setIsImageModelPickerOpen((currentValue) => !currentValue);
  };

  const handleModelSelect = (modelId: string) => {
    handleSettingChange('studyChatModelId', modelId);
    setIsModelPickerOpen(false);
  };

  const handleImageModelSelect = (modelId: string) => {
    handleSettingChange('studyChatImageModelId', modelId);
    setIsImageModelPickerOpen(false);
  };

  const handleClose = () => {
    triggerHaptic('impact');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID={testID}
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={styles.panel}
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <Card variant="raised" padding="none" style={styles.card}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Typography variant="heading3">Quick Settings</Typography>
                <Pressable
                  onPress={handleClose}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close quick settings"
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <AppIcon
                    color={theme.colors.mutedForeground}
                    name="close"
                    size={18}
                  />
                </Pressable>
              </View>

              <View style={styles.body}>
                <View style={styles.studyChatSection}>
                  <View style={styles.studyChatHeader}>
                    <Typography variant="body">
                      Study chat text model
                    </Typography>
                    <Typography variant="small" color="muted">
                      {selectedModelLabel}
                    </Typography>
                  </View>
                  <Typography variant="small" color="muted">
                    Pick the model used for card follow-up questions on this
                    screen.
                  </Typography>
                  {isStudyChatModelsLoading ? (
                    <Typography variant="small" color="muted">
                      Loading study chat models...
                    </Typography>
                  ) : studyChatModels.length === 0 ? (
                    <Typography
                      variant="small"
                      color={studyChatModelsError ? 'error' : 'muted'}
                    >
                      {studyChatModelsError || STUDY_CHAT_BACKEND_KEY_MESSAGE}
                    </Typography>
                  ) : (
                    <View style={styles.modelPickerSection}>
                      <Pressable
                        onPress={handleModelPickerToggle}
                        style={styles.modelPickerTrigger}
                        accessibilityRole="button"
                        accessibilityLabel="Change study chat model"
                        accessibilityHint="Shows the list of available models."
                        accessibilityState={{ expanded: isModelPickerOpen }}
                      >
                        <View style={styles.modelPickerCopy}>
                          <Typography variant="body">
                            {selectedModelLabel}
                          </Typography>
                          <Typography variant="small" color="muted">
                            {isModelPickerOpen
                              ? 'Choose a different model'
                              : 'Tap to change'}
                          </Typography>
                        </View>
                        <AppIcon
                          color={theme.colors.mutedForeground}
                          name={isModelPickerOpen ? 'chevronUp' : 'chevronDown'}
                          size={18}
                        />
                      </Pressable>

                      {isModelPickerOpen ? (
                        <View style={styles.modelButtons}>
                          {studyChatModels.map((model) => (
                            <View key={model.id} style={styles.modelButtonCell}>
                              <Button
                                title={model.label}
                                variant={
                                  sessionSettings.studyChatModelId === model.id
                                    ? 'primary'
                                    : 'secondary'
                                }
                                size="sm"
                                fullWidth
                                onPress={() => handleModelSelect(model.id)}
                                accessibilityState={{
                                  selected:
                                    sessionSettings.studyChatModelId ===
                                    model.id,
                                }}
                              />
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>

                <View style={styles.studyChatSection}>
                  <View style={styles.studyChatHeader}>
                    <Typography variant="body">
                      Study chat image model
                    </Typography>
                    <Typography variant="small" color="muted">
                      {selectedImageModelLabel}
                    </Typography>
                  </View>
                  <Typography variant="small" color="muted">
                    Pick the model used when study chat generates an image.
                  </Typography>
                  {isStudyChatImageModelsLoading ? (
                    <Typography variant="small" color="muted">
                      Loading study chat image models...
                    </Typography>
                  ) : studyChatImageModels.length === 0 ? (
                    <Typography
                      variant="small"
                      color={studyChatImageModelsError ? 'error' : 'muted'}
                    >
                      {studyChatImageModelsError ||
                        STUDY_CHAT_IMAGE_BACKEND_KEY_MESSAGE}
                    </Typography>
                  ) : (
                    <View style={styles.modelPickerSection}>
                      <Pressable
                        onPress={handleImageModelPickerToggle}
                        style={styles.modelPickerTrigger}
                        accessibilityRole="button"
                        accessibilityLabel="Change study chat image model"
                        accessibilityHint="Shows the list of available image models."
                        accessibilityState={{
                          expanded: isImageModelPickerOpen,
                        }}
                      >
                        <View style={styles.modelPickerCopy}>
                          <Typography variant="body">
                            {selectedImageModelLabel}
                          </Typography>
                          <Typography variant="small" color="muted">
                            {isImageModelPickerOpen
                              ? 'Choose a different image model'
                              : 'Tap to change'}
                          </Typography>
                        </View>
                        <AppIcon
                          color={theme.colors.mutedForeground}
                          name={
                            isImageModelPickerOpen ? 'chevronUp' : 'chevronDown'
                          }
                          size={18}
                        />
                      </Pressable>

                      {isImageModelPickerOpen ? (
                        <View style={styles.modelButtons}>
                          {studyChatImageModels.map((model) => (
                            <View key={model.id} style={styles.modelButtonCell}>
                              <Button
                                title={model.label}
                                variant={
                                  sessionSettings.studyChatImageModelId ===
                                  model.id
                                    ? 'primary'
                                    : 'secondary'
                                }
                                size="sm"
                                fullWidth
                                onPress={() => handleImageModelSelect(model.id)}
                                accessibilityState={{
                                  selected:
                                    sessionSettings.studyChatImageModelId ===
                                    model.id,
                                }}
                              />
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>

                <View style={styles.deckSection}>
                  <View style={styles.deckSectionHeader}>
                    <Typography variant="body">Manage decks</Typography>
                    <Typography variant="small" color="muted">
                      {selectedDeckIds.length} selected
                    </Typography>
                  </View>
                  <Typography variant="small" color="muted">
                    Add or remove decks for this study session without leaving
                    the page.
                  </Typography>
                  <DecksMultiSelect
                    decks={decks}
                    onSelectDecks={onSelectDecks}
                    selectedDeckIds={selectedDeckIds}
                  />
                </View>
              </View>

              <View style={styles.footer}>
                <Button
                  title="Done"
                  variant="primary"
                  size="lg"
                  onPress={handleClose}
                  fullWidth
                />
              </View>
            </ScrollView>
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
    padding: theme.spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
  },
  card: {
    maxHeight: '100%',
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
  },
  closeButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  body: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  deckSection: {
    gap: theme.spacing.sm,
  },
  deckSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  studyChatSection: {
    gap: theme.spacing.sm,
  },
  studyChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modelPickerCopy: {
    flex: 1,
    gap: 2,
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
  },
});
