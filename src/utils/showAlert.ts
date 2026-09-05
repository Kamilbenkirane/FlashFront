import { Alert, type AlertButton, Platform } from 'react-native';

/** Keep native confirmations on iOS/Android and browser dialogs on web. */
export const showAlert = (
  title: string,
  message: string,
  buttons?: AlertButton[],
) => {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  if (buttons && buttons.length > 1) {
    const accepted = window.confirm(`${title}\n\n${message}`);
    const action = buttons.find((button) =>
      accepted ? button.style !== 'cancel' : button.style === 'cancel',
    );
    action?.onPress?.();
  } else {
    window.alert(`${title}\n\n${message}`);
    buttons?.[0]?.onPress?.();
  }
};
