const cron = require('node-cron');
const axios = require('axios');
const Medication = require('../models/Medication');
const UserProfile = require('../models/UserProfile');
const sendEmail = require('../config/email');
const moment = require('moment-timezone');

const fetchCurrentUtcTime = async () => {
  try {
    const response = await axios.get('http://worldtimeapi.org/api/timezone/Etc/UTC');
    return moment(response.data.utc_datetime);
  } catch (error) {
    console.error('Error fetching current UTC time:', error);
    return moment.utc(); // Fallback to server time if API call fails
  }
};

const sendMedicationReminders = async () => {
  try {
    console.log('Cron job running...');

    const nowUtc = await fetchCurrentUtcTime();
    const fifteenMinutesFromNowUtc = nowUtc.clone().add(15, 'minutes');

    console.log(`Current UTC time from API: ${nowUtc.format('HH:mm')}`);
    console.log(`UTC time 15 minutes from now: ${fifteenMinutesFromNowUtc.format('HH:mm')}`);

    const medications = await Medication.find();

    console.log(`Medications found: ${medications.length}`);

    for (const medication of medications) {
      const userProfile = await UserProfile.findOne({ userId: medication.userId });
      if (userProfile && userProfile.email) {
        console.log(`Checking medication for user: ${medication.userId}`);

        medication.times.forEach(medTime => {
          const medTimeInUserTimezone = moment.tz(medTime, 'HH:mm', userProfile.timezone);
          const medTimeInUtc = medTimeInUserTimezone.clone().utc();

          console.log(`Medication time in user timezone (${userProfile.timezone}): ${medTimeInUserTimezone.format('HH:mm')}`);
          console.log(`Medication time in UTC: ${medTimeInUtc.format('HH:mm')}`);

          if (medTimeInUtc.isBetween(nowUtc, fifteenMinutesFromNowUtc)) {
            const emailText = `Reminder: It's time to take your medication: ${medication.name}`;
            sendEmail(userProfile.email, 'Medication Reminder', emailText);
            console.log(`Email sent to ${userProfile.email} for medication ${medication.name} at ${medTimeInUserTimezone.format('HH:mm')} (${userProfile.timezone})`);
          } else {
            console.log(`No reminder needed for ${medication.name} at this time.`);
          }
        });
      } else {
        console.log(`No user profile or email found for user: ${medication.userId}`);
      }
    }
  } catch (error) {
    console.log('Error sending medication reminders:', error);
  }
};

cron.schedule('* * * * *', sendMedicationReminders); // Run every minute
