import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarStrip from '../components/CalendarStrip';
import ConfirmationModal from '../components/ConfirmationModal';

const HomeScreen = ({ medications, setMedications }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [takenMeds, setTakenMeds] = useState({});
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [medicationToToggle, setMedicationToToggle] = useState(null);

  useEffect(() => {
    loadTakenMeds();
  }, []);

  const loadTakenMeds = async () => {
    try {
      const takenMedsData = await AsyncStorage.getItem('takenMeds');
      if (takenMedsData !== null) {
        setTakenMeds(JSON.parse(takenMedsData));
      }
    } catch (error) {
      console.error('Error loading taken meds:', error);
    }
  };

  const saveTakenMeds = async (newTakenMeds) => {
    try {
      await AsyncStorage.setItem('takenMeds', JSON.stringify(newTakenMeds));
    } catch (error) {
      console.error('Error saving taken meds:', error);
    }
  };

  const getDayOfWeek = (date) => {
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    return days[date.getDay()];
  };

  const toggleMedicationTaken = (medicationId) => {
    const currentDate = selectedDate.toDateString();
    const isTaken = takenMeds[currentDate] && takenMeds[currentDate][medicationId];
    
    if (isTaken) {
      setMedicationToToggle(medicationId);
      setIsConfirmationVisible(true);
    } else {
      updateMedicationStatus(medicationId, true);
    }
  };

  const updateMedicationStatus = (medicationId, isTaken) => {
    const currentDate = selectedDate.toDateString();
    const newTakenMeds = { ...takenMeds };
    if (!newTakenMeds[currentDate]) {
      newTakenMeds[currentDate] = {};
    }
    newTakenMeds[currentDate][medicationId] = isTaken;
    setTakenMeds(newTakenMeds);
    saveTakenMeds(newTakenMeds);
  };

  const handleConfirmUntake = () => {
    if (medicationToToggle) {
      updateMedicationStatus(medicationToToggle, false);
    }
    setIsConfirmationVisible(false);
    setMedicationToToggle(null);
  };

  const handleCancelUntake = () => {
    setIsConfirmationVisible(false);
    setMedicationToToggle(null);
  };

  const isMedicationTaken = (medicationId) => {
    const currentDate = selectedDate.toDateString();
    return takenMeds[currentDate] && takenMeds[currentDate][medicationId];
  };

  const filteredMedications = medications.filter(med => {
    if (med.frequency === 'course') {
      // For course medications, check if the selected date is within the course duration
      const courseStartDate = new Date(med.courseStartDate);
      const courseEndDate = new Date(courseStartDate);
      courseEndDate.setDate(courseEndDate.getDate() + med.courseDuration - 1);
      
      return selectedDate >= courseStartDate && selectedDate <= courseEndDate;
    } else {
      // For daily or custom schedules, use the existing logic
      const dayOfWeek = getDayOfWeek(selectedDate);
      return med.days ? med.days.includes(dayOfWeek) : true;
    }
  });

  const renderMedicationItem = ({ item }) => {
    const taken = isMedicationTaken(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.medicationItem,
          taken && styles.medicationItemTaken
        ]}
        onPress={() => toggleMedicationTaken(item.id)}
      >
        <View style={styles.medicationInfo}>
          <Text style={[styles.time, taken && styles.timeTaken]}>{item.time}</Text>
          <View style={styles.nameAndStatus}>
            <Text style={styles.medicationName}>{item.name}</Text>
            {taken && <Text style={styles.takenText}>TAKEN</Text>}
          </View>
          <Text style={styles.medicationDosage}>{item.dosage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CalendarStrip onDateSelect={setSelectedDate} />
      <View style={styles.contentContainer}>
        <Text style={styles.dateText}>{`Today, ${selectedDate.toDateString()}`}</Text>
        <FlatList
          data={filteredMedications}
          keyExtractor={(item) => item.id}
          renderItem={renderMedicationItem}
        />
      </View>
      <ConfirmationModal
        isVisible={isConfirmationVisible}
        onConfirm={handleConfirmUntake}
        onCancel={handleCancelUntake}
        message="Are you sure you want to mark this medication as not taken? This could lead to accidental double dosing."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 20,
  },
  medicationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#34495E',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  medicationItemTaken: {
    backgroundColor: '#27AE60',
  },
  medicationInfo: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#3498DB',
  },
  timeTaken: {
    color: '#006400', // Dark green color for better visibility
  },
  nameAndStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ECF0F1',
    flex: 1, // Allow the name to take up available space
  },
  takenText: {
    fontSize: 18, // Increased font size
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginLeft: 10, // Add some space between the name and TAKEN
  },
  medicationDosage: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 5,
  },
  medicationDosageTaken: {
    fontSize: 14,
    color: '#006400',
    marginTop: 5,
  },
});

export default HomeScreen;