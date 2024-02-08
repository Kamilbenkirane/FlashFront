import {StyleSheet} from "react-native";

const DecksMultiSelectStyles = StyleSheet.create({
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
        maxHeight: 200,
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
    backButton: {
        backgroundColor: '#f0f0f0', // Light grey, adjust as necessary
        padding: 10,
        margin: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#000000', // Black, adjust as necessary
        textAlign: 'center',
    },
    // Add styles for your confirm button here if needed
});

export default DecksMultiSelectStyles;