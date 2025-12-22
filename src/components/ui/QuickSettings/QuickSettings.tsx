import type React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { triggerHaptic } from '../../../utils/haptics';
import { Button } from '../Button';
import { Card } from '../Card';
import { Typography } from '../Typography';
import type { QuickSettingsProps } from './QuickSettings.types';

export const QuickSettings: React.FC<QuickSettingsProps> = ({
  visible,
  onClose,
  sessionSettings,
  onSettingsChange,
  testID,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const handleSettingChange = (
    key: string,
    value: boolean | string | number,
  ) => {
    triggerHaptic('selection');
    onSettingsChange({ ...sessionSettings, [key]: value });
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
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={handleClose}
      >
        <Pressable
          className="w-[90%] max-w-[400px]"
          onPress={(e) => e.stopPropagation()}
        >
          <Card className="p-0">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
              <Typography variant="heading3">Quick Settings</Typography>
              <Pressable onPress={handleClose} className="p-2">
                <Typography variant="body" className="text-neutral-500">
                  ✕
                </Typography>
              </Pressable>
            </View>

            {/* Settings Content */}
            <View className="p-4">
              {/* Theme Toggle */}
              <View className="flex-row justify-between items-center py-3">
                <Typography variant="body">Dark Mode</Typography>
                <Button
                  title={isDark ? 'On' : 'Off'}
                  variant={isDark ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={toggleTheme}
                  className="min-w-[60px]"
                />
              </View>

              {/* Auto-advance Setting */}
              <View className="flex-row justify-between items-center py-3">
                <Typography variant="body">Auto-advance</Typography>
                <Button
                  title={sessionSettings.autoAdvance ? 'On' : 'Off'}
                  variant={
                    sessionSettings.autoAdvance ? 'primary' : 'secondary'
                  }
                  size="sm"
                  onPress={() =>
                    handleSettingChange(
                      'autoAdvance',
                      !sessionSettings.autoAdvance,
                    )
                  }
                  className="min-w-[60px]"
                />
              </View>

              {/* Study Mode Setting */}
              <View className="flex-row justify-between items-center py-3">
                <Typography variant="body">Study Mode</Typography>
                <View className="flex-row gap-2">
                  <Button
                    title="Normal"
                    variant={
                      sessionSettings.studyMode === 'normal'
                        ? 'primary'
                        : 'secondary'
                    }
                    size="sm"
                    onPress={() => handleSettingChange('studyMode', 'normal')}
                    className="min-w-[60px]"
                  />
                  <Button
                    title="Quick"
                    variant={
                      sessionSettings.studyMode === 'quick'
                        ? 'primary'
                        : 'secondary'
                    }
                    size="sm"
                    onPress={() => handleSettingChange('studyMode', 'quick')}
                    className="min-w-[60px]"
                  />
                </View>
              </View>

              {/* Cards per session */}
              <View className="flex-row justify-between items-center py-3">
                <Typography variant="body">Cards per session</Typography>
                <View className="flex-row gap-2">
                  {[10, 20, 50].map((count) => (
                    <Button
                      key={count}
                      title={count.toString()}
                      variant={
                        sessionSettings.cardsPerSession === count
                          ? 'primary'
                          : 'secondary'
                      }
                      size="sm"
                      onPress={() =>
                        handleSettingChange('cardsPerSession', count)
                      }
                      className="min-w-[50px]"
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="p-4 border-t border-neutral-200 dark:border-neutral-700">
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
