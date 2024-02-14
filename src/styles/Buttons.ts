import { StyleSheet } from "react-native";

export const rememberedButton = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50", // Green color
    padding: 15,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export const forgotButton = StyleSheet.create({
  button: {
    backgroundColor: "#FF9800", // Orange color
    padding: 15,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export const buttonContainer = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around", // Distribute buttons evenly
  },
});
