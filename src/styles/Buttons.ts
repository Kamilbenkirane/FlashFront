import { StyleSheet } from 'react-native';

export const rememberedButton = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50', // Green color
    padding: 15,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export const forgotButton = StyleSheet.create({
  button: {
    backgroundColor: '#FF9800', // Orange color
    padding: 15,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export const buttonContainer = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute buttons evenly
  },
});

export const knownButton = StyleSheet.create({
  //it's a circle button
  button: {
    backgroundColor: '#2196F3', // Blue color
    padding: 15,
    borderRadius: 50,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export const optionsButton = StyleSheet.create({
  button: {
    position: 'absolute', // Position the button on the screen
    bottom: 20, // 20 points from the bottom
    right: 20, // 20 points from the right
    backgroundColor: 'white', // White color background
    padding: 10,
    borderRadius: 25, // Half of the height and width to create a circle
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: 'black', // Black color text
    fontWeight: 'bold', // Bold text
    fontSize: 16, // Set font size if necessary
  },
});
