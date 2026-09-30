type ProgressBarColor = 'primary' | 'success' | 'warning' | 'error';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  progress: number;
  total: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  testID?: string;
}
