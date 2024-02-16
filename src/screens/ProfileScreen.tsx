import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import UsersDropdown from '../components/UsersDropdown';
import useUsers from '../hooks/useUsers';
import useSubscribedDecks from '../hooks/useSubscribedDecks';

const ProfileScreen = () => {
  const users = useUsers(); // Custom hook to fetch users
  const [user, setUser] = useState(null);
  const decks = useSubscribedDecks(user?.user_id); // Fetch decks for the selected user

  const handleUserSelect = (selectedUser = null) => {
    setUser(selectedUser);
  };

  useEffect(() => {
    // Fetch user data here and set it using setUser
  }, []);

  return (
    <View>
      <Text>Profile Screen</Text>
      <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      {user && (
        <View>
          <Text>{`User ID: ${user.user_id}`}</Text>
          <Text>{`User Name: ${user.user_name}`}</Text>
          <Text>{`Subscription Date: ${user.subscription_date}`}</Text>
          <Text>{`Subscribed Decks: ${decks?.length}`}</Text>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;
