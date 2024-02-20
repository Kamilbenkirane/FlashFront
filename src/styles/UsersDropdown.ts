import { StyleSheet } from 'react-native';

const UsersDropdownStyles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  list: {
    maxHeight: 200, // Adjust based on your needs
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    textAlign: 'center',
  },
});

export default UsersDropdownStyles;
