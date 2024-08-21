import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, setDate, isSameMonth } from 'date-fns';

const { width } = Dimensions.get('window');
const MONTH_WIDTH = width / 3;
const DAY_WIDTH = width / 7;

const CalendarStrip = ({ onDateSelect }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const monthScrollViewRef = useRef(null);
  const dayScrollViewRef = useRef(null);

  const getMonthRange = (date) => {
    return Array.from({ length: 13 }, (_, i) => addMonths(date, i - 6));
  };

  const [months, setMonths] = useState(getMonthRange(today));

  useEffect(() => {
    monthScrollViewRef.current?.scrollTo({ x: MONTH_WIDTH * 6, animated: false });
  }, []);

  const handleMonthScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const monthIndex = Math.round(scrollX / MONTH_WIDTH);
    const newCurrentDate = months[monthIndex];
    
    if (!isSameMonth(newCurrentDate, currentDate)) {
      updateCurrentMonth(newCurrentDate);
    }
  };

  const updateCurrentMonth = (newCurrentDate) => {
    setCurrentDate(newCurrentDate);
    
    // Preserve the day when changing months, or set to last day of month if day doesn't exist
    const newSelectedDate = setDate(newCurrentDate, selectedDate.getDate());
    const lastDayOfMonth = getDaysInMonth(newCurrentDate);
    if (newSelectedDate.getDate() !== selectedDate.getDate()) {
      setSelectedDate(setDate(newCurrentDate, lastDayOfMonth));
    } else {
      setSelectedDate(newSelectedDate);
    }

    // Update month range if we're at the edge
    const monthIndex = months.findIndex(month => isSameMonth(month, newCurrentDate));
    if (monthIndex <= 1 || monthIndex >= 11) {
      setMonths(getMonthRange(newCurrentDate));
      monthScrollViewRef.current?.scrollTo({ x: MONTH_WIDTH * 6, animated: false });
    } else {
      monthScrollViewRef.current?.scrollTo({ x: MONTH_WIDTH * monthIndex, animated: true });
    }
  };

  const handleMonthPress = (month) => {
    updateCurrentMonth(month);
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const renderMonth = (month, index) => (
    <TouchableOpacity
      style={styles.monthContainer}
      key={month.toString()}
      onPress={() => handleMonthPress(month)}
    >
      <Text style={[
        styles.monthText,
        isSameMonth(month, currentDate) && styles.currentMonthText
      ]}>
        {format(month, 'MMMM')}
      </Text>
    </TouchableOpacity>
  );

  const renderDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const startDate = startOfMonth(currentDate);

    for (let i = 0; i < daysInMonth; i++) {
      const day = setDate(startDate, i + 1);
      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayContainer,
            selectedDate.getDate() === day.getDate() && styles.selectedDay
          ]}
          onPress={() => handleDatePress(day)}
        >
          <Text style={styles.dayText}>{format(day, 'EEE')}</Text>
          <Text style={[
            styles.dateText,
            selectedDate.getDate() === day.getDate() && styles.selectedDateText
          ]}>
            {format(day, 'd')}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={monthScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMonthScroll}
        contentContainerStyle={styles.monthScrollViewContent}
        snapToInterval={MONTH_WIDTH}
        decelerationRate="fast"
      >
        {months.map(renderMonth)}
      </ScrollView>
      <ScrollView
        ref={dayScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayScrollViewContent}
      >
        {renderDays()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: '#34495E', // Slightly lighter blue for calendar background
  },
  monthScrollViewContent: {
    paddingHorizontal: MONTH_WIDTH,
  },
  monthContainer: {
    width: MONTH_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BDC3C7', // Light grey for non-selected months
  },
  currentMonthText: {
    color: '#3498DB', // Bright blue for current month
  },
  dayScrollViewContent: {
    paddingHorizontal: DAY_WIDTH / 2,
  },
  dayContainer: {
    width: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  selectedDay: {
    backgroundColor: '#3498DB', // Bright blue for selected day
    borderRadius: DAY_WIDTH / 2,
  },
  dayText: {
    color: '#BDC3C7', // Light grey for day names
    fontSize: 12,
  },
  dateText: {
    color: '#ECF0F1', // Very light grey for date numbers
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  selectedDateText: {
    color: '#FFFFFF', // White for selected date
  },
  todayText: {
    color: '#ECF0F1', // Very light grey for "Today" text
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default CalendarStrip;