import type React from 'react';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import type { User, UsersDropdownProps } from '../interfaces';
import { createDropdownStyles } from './dropdownStyles';
import { Typography } from './ui/Typography/Typography';

const UsersDropdown: React.FC<UsersDropdownProps> = ({
  users,
  onSelectUser,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user, setUser } = useUser();
  const { theme } = useTheme();

  const handleSelectUser = (selectedUser: User | null) => {
    setUser(selectedUser);
    setIsVisible(false); // Close the dropdown after selection
    onSelectUser(selectedUser);
  };

  const styles = createDropdownStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={styles.button}
      >
        <Typography
          variant="body"
          color="neutral"
          style={{ color: '#ffffff', textAlign: 'center' }}
        >
          {user ? user.user_name : 'Select User'}
        </Typography>
      </TouchableOpacity>
      {isVisible && (
        <ScrollView style={styles.list}>
          {users.map((item, index) => (
            <TouchableOpacity
              key={item.user_id.toString()}
              onPress={() => handleSelectUser(item)}
              style={[
                styles.item,
                index === users.length - 1 && styles.itemLast,
              ]}
            >
              <Typography
                variant="body"
                color="neutral"
                style={{ textAlign: 'center' }}
              >
                {item.user_name}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default UsersDropdown;
