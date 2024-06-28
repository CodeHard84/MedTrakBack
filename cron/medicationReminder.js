const cron = require('node-cron');
const Medication = require('../models/Medication');
const UserProfile = require('../models/UserProfile');
const sendEmail = require('../config/email');
const moment = require('moment-timezone');

const sendMedicationReminders = async () => {
  try {
    const nowUtc = moment.utc();
    const fifteenMinutesFromNowUtc = moment.utc().add(15, 'minutes');

    const medications = await Medication.find();

    for (const medication of medications) {
      const userProfile = await UserProfile.findOne({ userId: medication.userId });
      if (userProfile && userProfile.email) {
        const userTimezone = userProfile.timezone;

        medication.times.forEach(medTime => {
          const medTimeInUserTimezone = moment.tz(medTime, 'HH:mm', userTimezone);
          const medTimeInUtc = medTimeInUserTimezone.utc();

          if (medTimeInUtc.isBetween(nowUtc, fifteenMinutesFromNowUtc)) {
            const emailText = `Reminder: It's time to take your medication: ${medication.name}`;
            sendEmail(userProfile.email, 'Medication Reminder', emailText);
          }
        });
      }
    }
  } catch (error) {
    console.log('Error sending medication reminders:', error);
  }
};

cron.schedule('* * * * *', sendMedicationReminders);
