import { View, Text, FlatList } from 'react-native';
import React, { useState } from 'react';
import useDeckLibrary from '../hooks/useDeckLibrary';
import { libraryScreenStyles } from '../styles/LibraryScreenStyles';
import Subject from '../components/Subject';
import Deck from '../components/Deck';
import useUsers from '../hooks/useUsers';
import UsersDropdown from '../components/UsersDropdown';
import { useUser } from '../context/UserContext';
import useSubscribedDecks from '../hooks/useSubscribedDecks';

const LibraryScreen = () => {
  const users = useUsers(); // Custom hook to fetch users
  const { user, setUser } = useUser();
  const SubscribedDecks = useSubscribedDecks(user);
  const library = useDeckLibrary();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleUserSelect = (selectedUser = null) => {
    setUser(selectedUser);
  };
  const groupBySubject = (library) => {
    return library.reduce((groupedDecks, deck) => {
      (groupedDecks[deck.subject] = groupedDecks[deck.subject] || []).push(
        deck,
      );
      return groupedDecks;
    }, {});
  };
  const decksBySubject = groupBySubject(library);

  const renderItem = ({ item: [subject, decks] }) => (
    <View key={subject}>
      <Subject
        subject={subject}
        isSelected={selectedSubject === subject}
        onSelect={() =>
          setSelectedSubject(selectedSubject === subject ? null : subject)
        }
      />
      {selectedSubject === subject &&
        decks.map((deck, index) => (
          <Deck
            key={deck.id + '-' + index}
            deck={deck}
            decks={SubscribedDecks}
          />
        ))}
    </View>
  );

  return (
    <View style={[libraryScreenStyles.container, { flex: 1 }]}>
      <Text style={libraryScreenStyles.title}>Library Screen</Text>
      <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      <View style={{ flex: 1 }}>
        <FlatList
          data={Object.entries(decksBySubject)}
          renderItem={renderItem}
          keyExtractor={(item) => item[0]}
        />
      </View>
    </View>
  );
};

export default LibraryScreen;
