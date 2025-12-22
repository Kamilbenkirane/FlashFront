import type React from 'react';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import type { User, UsersDropdownProps } from '../interfaces';
import { Typography } from './ui/Typography';

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

  const styles = StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },
    button: {
      backgroundColor: theme.colors.primary[500],
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    },
    list: {
      maxHeight: 200,
      backgroundColor: theme.colors.neutral[50],
      borderColor: theme.colors.neutral[200],
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.xs,
      ...theme.shadows.md,
    },
    item: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
      backgroundColor: theme.colors.neutral[50],
    },
    itemLast: {
      borderBottomWidth: 0,
    },
  });

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
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
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
          )}
          style={styles.list}
        />
      )}
    </View>
  );
};

export default UsersDropdown;
