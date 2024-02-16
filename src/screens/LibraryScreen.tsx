import { View, Text } from 'react-native';
import React, { useState } from 'react';
import useDeckLibrary from '../hooks/useDeckLibrary';
import { libraryScreenStyles } from '../styles/LibraryScreenStyles';
import Subject from '../components/Subject';
import Deck from '../components/Deck';
import useUsers from '../hooks/useUsers';
import UsersDropdown from '../components/UsersDropdown';

const LibraryScreen = () => {
  const users = useUsers(); // Custom hook to fetch users
  const [user, setUser] = useState(null);
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

  return (
    <View style={libraryScreenStyles.container}>
      <Text style={libraryScreenStyles.title}>Library Screen</Text>
      <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      {Object.entries(decksBySubject).map(([subject, decks]) => (
        <View key={subject}>
          <Subject
            subject={subject}
            isSelected={selectedSubject === subject}
            onSelect={() =>
              setSelectedSubject(selectedSubject === subject ? null : subject)
            }
          />
          {selectedSubject === subject &&
            decks.map((deck) => <Deck key={deck.id} user={user} deck={deck} />)}
        </View>
      ))}
    </View>
  );
};
export default LibraryScreen;
