import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownSelect from '../components/DropdownSelect';
import ConfirmationModal from '../components/ConfirmationModal';
import NotificationService from '../Notificationservice';

const DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
const PILL_COUNTS = [1, 2, 3];
const UNITS = ['mg', 'ml', 'cc'];

const AddMedicationForm = ({ onAddMedication }) => {
  const [newMedName, setNewMedName] = useState('');
  const [pillCount, setPillCount] = useState(1);
  const [dosageAmount, setDosageAmount] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [newMedTime, setNewMedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [isCourse, setIsCourse] = useState(false);
  const [courseDuration, setCourseDuration] = useState('');
  const [courseStartDate, setCourseStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setNewMedName('');
    setPillCount(1);
    setDosageAmount('');
    setDosageUnit('mg');
    setNewMedTime(new Date());
    setFrequency('daily');
    setSelectedDays([]);
    setIsCourse(false);
    setCourseDuration('');
    setCourseStartDate(new Date());
  };

  const addMedication = (newMed) => {
    if (newMedName && dosageAmount) {
      let medicationDays;
      if (frequency === 'daily') {
        medicationDays = DAYS;
      } else if (isCourse) {
        const startDate = new Date(courseStartDate);
        medicationDays = [];
        for (let i = 0; i < parseInt(courseDuration); i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          medicationDays.push(currentDate.toISOString().split('T')[0]);
        }
      } else {
        medicationDays = selectedDays;
      }
  
      const newMed = {
        id: Date.now().toString(),
        name: newMedName,
        dosage: `${pillCount} ${pillCount === 1 ? 'Pill' : 'Pills'}, ${dosageAmount}${dosageUnit}`,
        time: newMedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        frequency: isCourse ? 'course' : frequency,
        days: medicationDays,
        courseStartDate: isCourse ? courseStartDate.toISOString() : null,
        courseDuration: isCourse ? parseInt(courseDuration) : null,
      };
      onAddMedication(newMed);
      resetForm();
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || newMedTime;
    setShowTimePicker(Platform.OS === 'ios');
    setNewMedTime(currentTime);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || courseStartDate;
    setShowDatePicker(Platform.OS === 'ios');
    setCourseStartDate(currentDate);
  };

  return (
    <View style={styles.addMedicationContainer}>
      <Text style={styles.title}>Add New Medication</Text>
      <TextInput
        style={styles.input}
        placeholder="Medication Name"
        placeholderTextColor="#BDC3C7"
        value={newMedName}
        onChangeText={setNewMedName}
      />
      <View style={styles.dosageContainer}>
        <DropdownSelect
          options={PILL_COUNTS}
          selectedValue={pillCount}
          onSelect={setPillCount}
          style={styles.pillCountDropdown}
        />
        <TextInput
          style={styles.dosageInput}
          placeholder="Dosage"
          placeholderTextColor="#BDC3C7"
          value={dosageAmount}
          onChangeText={setDosageAmount}
          keyboardType="numeric"
        />
        <DropdownSelect
          options={UNITS}
          selectedValue={dosageUnit}
          onSelect={setDosageUnit}
          style={styles.unitDropdown}
        />
      </View>
      <View style={styles.timeFrequencyContainer}>
        <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.timeButtonText}>
            {newMedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        <View style={styles.frequencyContainer}>
          <TouchableOpacity
            style={[styles.frequencyButton, frequency === 'daily' && styles.selectedFrequency]}
            onPress={() => {
              setFrequency('daily');
              setIsCourse(false);
            }}
          >
            <Text style={styles.frequencyButtonText}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.frequencyButton, frequency === 'custom' && !isCourse && styles.selectedFrequency]}
            onPress={() => {
              setFrequency('custom');
              setIsCourse(false);
            }}
          >
            <Text style={styles.frequencyButtonText}>Custom</Text>
          </TouchableOpacity>
          <View style={styles.courseContainer}>
          <Text style={styles.courseText}>Course</Text>
            <Switch
              value={isCourse}
              onValueChange={(value) => {
                setIsCourse(value);
                if (value) {
                  setFrequency('course');
                } else {
                  setFrequency('daily');
                }
              }}
            />

          </View>
        </View>
      </View>
      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={newMedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
      
      {frequency === 'custom' && !isCourse && (
        <View style={styles.daysContainer}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDays.includes(day) && styles.selectedDay]}
              onPress={() => toggleDay(day)}
            >
              <Text style={styles.dayButtonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

{isCourse && (
        <View style={styles.courseOptionsContainer}>
          <View style={styles.courseOptionsRow}>
            <TextInput
              style={styles.courseDurationInput}
              placeholder="Number of days"
              placeholderTextColor="#BDC3C7"
              value={courseDuration}
              onChangeText={setCourseDuration}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                Start: {courseStartDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={courseStartDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={addMedication}>
        <Text style={styles.addButtonText}>Add Medication</Text>
      </TouchableOpacity>
    </View>
  );
};

const MedicationsScreen = ({ medications, setMedications }) => {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [medicationToRemove, setMedicationToRemove] = useState(null);

  useEffect(() => {
    NotificationService.configure();
  }, []);

  const addMedication = async (newMed) => {
    const updatedMedications = [...medications, newMed];
    setMedications(updatedMedications);
    try {
      await NotificationService.scheduleNotification(newMed);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const showRemoveConfirmation = (id) => {
    setMedicationToRemove(id);
    setIsConfirmationVisible(true);
  };

  const removeMedication = () => {
    if (medicationToRemove) {
      const updatedMedications = medications.filter(med => med.id !== medicationToRemove);
      setMedications(updatedMedications);
      setMedicationToRemove(null);
      // Cancel the notification for the removed medication
      NotificationService.cancelAllNotifications();
      // Reschedule notifications for remaining medications
      updatedMedications.forEach(med => NotificationService.scheduleNotification(med));
    }
    setIsConfirmationVisible(false);
  };

  const cancelRemove = () => {
    setMedicationToRemove(null);
    setIsConfirmationVisible(false);
  };

  const renderMedicationItem = ({ item }) => (
    <View style={styles.medicationItem}>
      <View style={styles.medicationInfo}>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationDosage}>{item.dosage}</Text>
        <Text style={styles.medicationDays}>
          {item.frequency === 'course' 
            ? `Course: ${item.courseDuration} days, starting ${new Date(item.courseStartDate).toDateString()}`
            : `Days: ${item.days.join(', ')}`
          }
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => showRemoveConfirmation(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView>
        <AddMedicationForm onAddMedication={addMedication} />
        {medications.length > 0 ? (
          <FlatList
            data={medications}
            renderItem={renderMedicationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noMedicationsText}>No medications added yet. Use the form above to add your first medication.</Text>
        )}
      </ScrollView>
      <ConfirmationModal
        isVisible={isConfirmationVisible}
        onConfirm={removeMedication}
        onCancel={cancelRemove}
        message="Are you sure you want to remove this medication?"
      />
    </KeyboardAvoidingView>
  );
};

  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#2C3E50',
    },

//-----ADD MEDICATION FORM-----
    addMedicationContainer: {
      backgroundColor: '#34495E',
      padding: 20,
      borderRadius: 10,
      margin: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ECF0F1',
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#3498DB',
      padding: 7,
      marginBottom: 10,
      borderRadius: 5,
      color: '#ECF0F1',
      backgroundColor: '#2C3E50',
    },

//-----DOSAGE-----
    dosageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    pillCountDropdown: {
      width: 75,
    },
    dosageInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#3498DB',
      borderRadius: 5,
      padding: 10,
      color: '#ECF0F1',
      backgroundColor: '#2C3E50',
      marginHorizontal: 10,
    },
    unitDropdown: {
      width: 75,
    },
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

//-----MODAL-----
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownListContainer: {
      backgroundColor: '#34495E',
      borderRadius: 5,
      padding: 5,
      maxHeight: 150,
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

  //-----FREQUENCY-----
  timeFrequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3498DB',
    flex: 0.25,
    marginRight: 5,
    height: 40,
    justifyContent: 'center',
  },
  timeButtonText: {
    color: '#ECF0F1',
    textAlign: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flex: 1.75,
    alignItems: 'center',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#3498DB',
    borderRadius: 5,
    marginLeft: 5,
    height: 40,
    justifyContent: 'center',
  },
  frequencyButtonText: {
    color: '#ECF0F1',
    textAlign: 'center',
    fontSize: 14,
  },
  selectedFrequency: {
    backgroundColor: '#3498DB',
  },
  courseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  courseText: {
  color: '#ECF0F1',
  marginRight: 5,
  },
  courseOptionsContainer: {
    marginTop: 10,
  },
  courseOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseDurationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3498DB',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    color: '#ECF0F1',
    backgroundColor: '#2C3E50',
    height: 40,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#2C3E50',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#ECF0F1',
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#3498DB',
    borderRadius: 5,
  },
  dayButtonText: {
    color: '#ECF0F1',
  },
  selectedDay: {
    backgroundColor: '#3498DB',
  },
  addButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#ECF0F1',
    fontWeight: 'bold',
  },
  medicationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#34495E',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#3498DB',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 5,
  },
  medicationDays: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 5,
  },
  noMedicationsText: {
      color: '#ECF0F1',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
  },

  });

export default MedicationsScreen;