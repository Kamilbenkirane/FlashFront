import { StyleSheet } from 'react-native';

export const libraryScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subject: {
    backgroundColor: '#ddd',
    padding: 10,
    marginVertical: 5,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deck: {
    backgroundColor: '#eee',
    padding: 10,
    marginLeft: 20,
    marginVertical: 5,
    flexDirection: 'row', // added this to align deck name and tick/cross in the same row
    justifyContent: 'space-between', // added this to put some space between deck name and tick/cross
  },
  deckText: {
    fontSize: 16,
  },
  tickCrossContainer: {
    flexDirection: 'row',
  },
  tickStyle: {
    color: 'green',
    fontSize: 20,
  },
  crossStyle: {
    color: 'red',
    fontSize: 20,
  },
});
