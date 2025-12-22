export interface FilterBarProps {
  subjects: string[];
  selectedSubject: string | null;
  onSubjectSelect: (subject: string | null) => void;
  showSubscribedOnly: boolean;
  onToggleSubscribed: () => void;
  className?: string;
  testID?: string;
}
