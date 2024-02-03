import {StyleSheet} from "react-native";

export const flashcardStyles = StyleSheet.create({
    flashcard: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#1973b8',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        textAlign: 'center',
        margin: 10,
        height: 300, // Example height
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', // Ensures content is centered horizontally
    },
    flashcardHeader: { // pour le h2
        marginBottom: 10,
        color: '#333',
        fontSize: 50, // Vous pouvez ajuster la taille de la police selon vos besoins
    },
    flashcardText: { // pour le p
        color: '#666',
        fontSize: 30, // Vous pouvez ajuster la taille de la police selon vos besoins
        textAlign: 'center', // Center text horizontally
    },
    streakCircle: {
        position: 'absolute',
        top: -10,
        left: -10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#4CAF50',
        color: 'black',
        textAlign: 'center',
        lineHeight: 30, // Peut nécessiter un ajustement
        fontSize: 30,
    },
    timeSinceReview: {
        position: 'absolute',
        top: -10,
        right: -10,
        padding: 5,
        backgroundColor: '#FF9800',
        color: 'white',
        textAlign: 'center',
        borderRadius: 15,
        fontSize: 12,
    },
    popupScore: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: '#2196F3',
        color: 'white',
        padding: 5,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 14,
    },
});

