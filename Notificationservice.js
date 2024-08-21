import * as Notifications from 'expo-notifications';

class NotificationService {
  configure = async () => {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  scheduleNotification = async (medication) => {
    const { name, time, frequency, days } = medication;
    const [hours, minutes] = time.split(':').map(Number);

    const scheduleNotificationForDate = async (date) => {
      date.setHours(hours, minutes, 0, 0);
      
      // If the time for today has already passed, schedule for tomorrow
      if (date.getTime() < Date.now()) {
        date.setDate(date.getDate() + 1);
      }

      const trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      if (frequency !== 'daily') {
        trigger.weekday = date.getDay() + 1; // 1-7 for Monday-Sunday
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take your ${name}`,
        },
        trigger,
      });

      console.log(`Scheduled notification for ${name} on ${date.toString()}`);
    };

    if (frequency === 'daily') {
      await scheduleNotificationForDate(new Date());
    } else if (frequency === 'custom') {
      const daysOfWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      for (const day of days) {
        const dayIndex = daysOfWeek.indexOf(day);
        const date = new Date();
        date.setDate(date.getDate() + (dayIndex + 7 - date.getDay()) % 7);
        await scheduleNotificationForDate(date);
      }
    }
  }

  cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default new NotificationService();