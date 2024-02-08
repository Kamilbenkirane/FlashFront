import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DecksMultiSelectStyles from "../styles/DecksMultiSelect";

const DecksMultiSelect = ({ decks, onSelectDecks }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedDeckIds, setSelectedDeckIds] = useState([]);

    const handleSelectDeck = (deck) => {
        const isAlreadySelected = selectedDeckIds.includes(deck.deck_id);
        const newSelectedDeckIds = isAlreadySelected
            ? selectedDeckIds.filter(id => id !== deck.deck_id)
            : [...selectedDeckIds, deck.deck_id];

        setSelectedDeckIds(newSelectedDeckIds);
        onSelectDecks(newSelectedDeckIds);
    };

    const getSelectedDecksText = () => {
        if (selectedDeckIds.length === 0) return 'Select Decks';
        const selectedNames = decks.filter(deck => selectedDeckIds.includes(deck.deck_id))
            .map(deck => deck.deck_name);
        return selectedNames.join(', ');
    };

    const subjects = [...new Set(decks.map(deck => deck.subject))];
    const filteredDecks = decks.filter(deck => deck.subject === selectedSubject);

    return (
        <View style={DecksMultiSelectStyles.container}>
            <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={DecksMultiSelectStyles.button}>
                <Text style={DecksMultiSelectStyles.buttonText}>{selectedSubject ? getSelectedDecksText() : 'Select Subject/Decks'}</Text>
            </TouchableOpacity>
            {isVisible && (
                <View>
                    {selectedSubject === null ? (
                        <FlatList
                            data={subjects}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedSubject(item)}
                                    style={DecksMultiSelectStyles.item}
                                >
                                    <Text style={DecksMultiSelectStyles.itemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            style={DecksMultiSelectStyles.list}
                        />
                    ) : (
                        <View>
                            <FlatList
                                data={filteredDecks}
                                keyExtractor={(item) => item.deck_id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectDeck(item)}
                                        style={[
                                            DecksMultiSelectStyles.item,
                                            { backgroundColor: selectedDeckIds.includes(item.deck_id) ? '#D3D3D3' : 'white' }
                                        ]}
                                    >
                                        <Text style={DecksMultiSelectStyles.itemText}>{item.deck_name}</Text>
                                    </TouchableOpacity>
                                )}
                                style={DecksMultiSelectStyles.list}
                            />
                            <TouchableOpacity onPress={() => setSelectedSubject(null)} style={DecksMultiSelectStyles.backButton}>
                                <Text style={DecksMultiSelectStyles.backButtonText}>Back to Subjects</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default DecksMultiSelect;
