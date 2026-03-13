/**
 * Offline Reminder Service
 * Local reminders that work without internet
 * Uses background notifications
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import BackgroundTimer from 'react-native-background-timer';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class OfflineReminderService {
  constructor() {
    this.reminders = [];
    this.checkInterval = null;
    this.init();
  }

  async init() {
    await this.requestPermissions();
    await this.loadReminders();
    this.startBackgroundCheck();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
    return status === 'granted';
  }

  /**
   * Add a new reminder
   */
  async addReminder(reminder) {
    const newReminder = {
      id: Date.now().toString(),
      title: reminder.title,
      message: reminder.message || '',
      time: reminder.time, // Format: "HH:MM"
      frequency: reminder.frequency || 'daily', // daily, weekly, once
      active: true,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      ...reminder
    };

    this.reminders.push(newReminder);
    await this.saveReminders();
    await this.scheduleNotification(newReminder);

    return newReminder;
  }

  /**
   * Schedule notification for reminder
   */
  async scheduleNotification(reminder) {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: reminder.frequency === 'daily' || reminder.frequency === 'weekly',
    };

    if (reminder.frequency === 'weekly') {
      trigger.weekday = reminder.weekday || 1; // Monday by default
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger,
      identifier: reminder.id,
    });
  }

  /**
   * Get all reminders
   */
  async getReminders() {
    return this.reminders.filter(r => r.active);
  }

  /**
   * Get reminders by category
   */
  async getRemindersByCategory(category) {
    return this.reminders.filter(r => r.active && r.category === category);
  }

  /**
   * Update reminder
   */
  async updateReminder(id, updates) {
    const index = this.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reminders[index] = { ...this.reminders[index], ...updates };
      await this.saveReminders();
      
      // Reschedule notification
      await Notifications.cancelScheduledNotificationAsync(id);
      if (this.reminders[index].active) {
        await this.scheduleNotification(this.reminders[index]);
      }
    }
  }

  /**
   * Delete reminder
   */
  async deleteReminder(id) {
    this.reminders = this.reminders.filter(r => r.id !== id);
    await this.saveReminders();
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Toggle reminder active state
   */
  async toggleReminder(id) {
    const reminder = this.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.active = !reminder.active;
      await this.saveReminders();
      
      if (reminder.active) {
        await this.scheduleNotification(reminder);
      } else {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
  }

  /**
   * Add medicine reminder (common use case)
   */
  async addMedicineReminder(medicineName, time, instructions = '') {
    return await this.addReminder({
      title: `💊 Medicine Time: ${medicineName}`,
      message: instructions || `Time to take your ${medicineName}`,
      time,
      frequency: 'daily',
      category: 'medicine',
      medicineName,
      instructions
    });
  }

  /**
   * Add meal reminder
   */
  async addMealReminder(mealType, time) {
    const mealEmojis = {
      breakfast: '🍳',
      lunch: '🍱',
      dinner: '🍽️',
      snack: '🍎'
    };

    return await this.addReminder({
      title: `${mealEmojis[mealType] || '🍽️'} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time`,
      message: `Time for your ${mealType}`,
      time,
      frequency: 'daily',
      category: 'meal',
      mealType
    });
  }

  /**
   * Add water reminder
   */
  async addWaterReminder(time) {
    return await this.addReminder({
      title: '💧 Drink Water',
      message: 'Remember to drink a glass of water',
      time,
      frequency: 'daily',
      category: 'health'
    });
  }

  /**
   * Start background check for reminders
   */
  startBackgroundCheck() {
    // Check every minute
    this.checkInterval = BackgroundTimer.setInterval(() => {
      this.checkReminders();
    }, 60000); // 60 seconds
  }

  /**
   * Check if any reminders should trigger
   */
  async checkReminders() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (const reminder of this.reminders) {
      if (!reminder.active) continue;

      if (reminder.time === currentTime) {
        // Check if already triggered today
        const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
        const isToday = lastTriggered && 
          lastTriggered.toDateString() === now.toDateString();

        if (!isToday) {
          await this.triggerReminder(reminder);
        }
      }
    }
  }

  /**
   * Trigger a reminder
   */
  async triggerReminder(reminder) {
    // Update last triggered
    reminder.lastTriggered = new Date().toISOString();
    await this.saveReminders();

    // Show notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        data: { reminderId: reminder.id }
      },
      trigger: null, // Immediate
    });

    // If it's a one-time reminder, deactivate it
    if (reminder.frequency === 'once') {
      reminder.active = false;
      await this.saveReminders();
    }
  }

  /**
   * Get upcoming reminders for today
   */
  async getTodayReminders() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return this.reminders
      .filter(r => r.active)
      .map(r => {
        const [hours, minutes] = r.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        return {
          ...r,
          minutesUntil: reminderTime - currentTime,
          isPast: reminderTime < currentTime
        };
      })
      .filter(r => !r.isPast)
      .sort((a, b) => a.minutesUntil - b.minutesUntil);
  }

  /**
   * Save reminders to storage
   */
  async saveReminders() {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  /**
   * Load reminders from storage
   */
  async loadReminders() {
    try {
      const stored = await AsyncStorage.getItem('reminders');
      if (stored) {
        this.reminders = JSON.parse(stored);
        
        // Reschedule active reminders
        for (const reminder of this.reminders) {
          if (reminder.active) {
            await this.scheduleNotification(reminder);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  }

  /**
   * Stop background check
   */
  stopBackgroundCheck() {
    if (this.checkInterval) {
      BackgroundTimer.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Clear all reminders
   */
  async clearAll() {
    // Cancel all scheduled notifications
    for (const reminder of this.reminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.id);
    }
    
    this.reminders = [];
    await AsyncStorage.removeItem('reminders');
  }
}

export default new OfflineReminderService();
