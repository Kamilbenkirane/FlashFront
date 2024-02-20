import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useUser } from '../context/UserContext';
import UsersDropdownStyles from '../styles/UsersDropdown';

const UsersDropdown = ({ users, onSelectUser }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user, setUser } = useUser();

  const handleSelectUser = (selectedUser) => {
    setUser(selectedUser);
    setIsVisible(false); // Close the dropdown after selection
    onSelectUser(selectedUser);
  };

  return (
    <View style={UsersDropdownStyles.container}>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={UsersDropdownStyles.button}
      >
        <Text style={UsersDropdownStyles.buttonText}>
          {user ? user.user_name : 'Select User'}
        </Text>
      </TouchableOpacity>
      {isVisible && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectUser(item)}
              style={UsersDropdownStyles.item}
            >
              <Text style={UsersDropdownStyles.itemText}>{item.user_name}</Text>
            </TouchableOpacity>
          )}
          style={UsersDropdownStyles.list}
        />
      )}
    </View>
  );
};

export default UsersDropdown;