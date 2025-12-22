export interface ActionButtonsProps {
  onForgotten: () => void;
  onRemembered: () => void;
  onKnown: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  testID?: string;
}
