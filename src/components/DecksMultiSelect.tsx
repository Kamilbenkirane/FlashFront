import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const DecksMultiSelect = ({ decks, onSelectDecks }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedDeckIds, setSelectedDeckIds] = useState([]); // Now tracking multiple selections

    const handleSelectDeck = (deck) => {
        const isAlreadySelected = selectedDeckIds.includes(deck.deck_id);
        let newSelectedDeckIds;

        if (isAlreadySelected) {
            // If already selected, remove it from the selections
            newSelectedDeckIds = selectedDeckIds.filter(id => id !== deck.deck_id);
        } else {
            // Otherwise, add it to the selections
            newSelectedDeckIds = [...selectedDeckIds, deck.deck_id];
        }

        setSelectedDeckIds(newSelectedDeckIds);
        onSelectDecks(newSelectedDeckIds); // Pass the array of selected IDs back up
    };

    // Optional: A function to generate a display text based on selected decks
    const getSelectedDecksText = () => {
        if (selectedDeckIds.length === 0) return 'Select Decks';
        // Find deck names based on selected IDs and join them
        const selectedNames = decks.filter(deck => selectedDeckIds.includes(deck.deck_id))
            .map(deck => deck.deck_name);
        return selectedNames.join(', ');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.button}>
                <Text style={styles.buttonText}>{getSelectedDecksText()}</Text>
            </TouchableOpacity>
            {isVisible && (
                <FlatList
                    data={decks}
                    keyExtractor={(item) => item.deck_id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSelectDeck(item)}
                            style={[
                                styles.item,
                                { backgroundColor: selectedDeckIds.includes(item.deck_id) ? '#D3D3D3' : 'white' }
                            ]}
                        >
                            <Text style={styles.itemText}>{item.deck_name}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.list}
                />
            )}
        </View>
    );
};

export default DecksMultiSelect;

const styles = StyleSheet.create({
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
