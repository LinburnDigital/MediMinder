import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DropdownSelect = ({ options, selectedValue, onSelect, style }) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        onSelect(item);
        setIsOpen(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.dropdownContainer, style]}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsOpen(true)}>
        <Text style={styles.dropdownButtonText}>{selectedValue}</Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={24} color="#ECF0F1" />
      </TouchableOpacity>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownListContainer}>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#3498DB',
    borderRadius: 5,
    backgroundColor: '#2C3E50',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  dropdownButtonText: {
    color: '#ECF0F1',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownListContainer: {
    backgroundColor: '#34495E',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3498DB',
    maxHeight: 150,
    width: '80%',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
  },
  dropdownItemText: {
    color: '#ECF0F1',
    fontSize: 16,
  },
});

export default DropdownSelect;