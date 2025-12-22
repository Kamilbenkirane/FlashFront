export interface SessionSettings {
  autoAdvance: boolean;
  studyMode: 'normal' | 'quick';
  cardsPerSession: number;
}

export interface QuickSettingsProps {
  visible: boolean;
  onClose: () => void;
  sessionSettings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
  testID?: string;
}
