// Subject.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { libraryScreenStyles } from '../styles/LibraryScreenStyles';

const Subject = ({ subject, isSelected, onSelect }) => (
  <TouchableOpacity style={libraryScreenStyles.subject} onPress={onSelect}>
    <Text style={libraryScreenStyles.subjectText}>{subject}</Text>
  </TouchableOpacity>
);

export default Subject;
