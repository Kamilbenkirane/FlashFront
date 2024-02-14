import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

// Assuming users is an array of user objects
const UsersDropdown = ({ users, onSelectUser }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsVisible(false); // Close the dropdown after selection
    onSelectUser(user);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {selectedUser ? selectedUser.user_name : "Select User"}
        </Text>
      </TouchableOpacity>
      {isVisible && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectUser(item)}
              style={styles.item}
            >
              <Text style={styles.itemText}>{item.user_name}</Text>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
};

export default UsersDropdown;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
  },
  list: {
    maxHeight: 200, // Adjust based on your needs
    borderColor: "#ccc",
    borderWidth: 1,
    marginTop: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    textAlign: "center",
  },
});
