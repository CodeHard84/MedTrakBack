const cron = require('node-cron');
const axios = require('axios');
const Medication = require('../models/Medication');
const UserProfile = require('../models/UserProfile');
const sendEmail = require('../config/email');
const moment = require('moment-timezone');

// Fetch current UTC time from an external reliable time source
const fetchCurrentUtcTime = async () => {
  try {
    const response = await axios.get('http://worldtimeapi.org/api/timezone/Etc/UTC');
    return moment(response.data.utc_datetime);
  } catch (error) {
    console.error('Error fetching current UTC time:', error);
    return moment.utc(); // Fallback to server time if API call fails
  }
};

// Function to send medication reminders
const sendMedicationReminders = async () => {
  try {
    console.log('Cron job running...');

    const nowUtc = await fetchCurrentUtcTime();
    const fifteenMinutesFromNowUtc = nowUtc.clone().add(15, 'minutes');
    const twentyFourHoursFromNowUtc = nowUtc.clone().add(24, 'hours');

    console.log(`Current UTC time from API: ${nowUtc.format()}`);
    console.log(`UTC time 15 minutes from now: ${fifteenMinutesFromNowUtc.format()}`);
    console.log(`UTC time 24 hours from now: ${twentyFourHoursFromNowUtc.format()}`);

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
          console.log(`Current time (UTC): ${nowUtc.format('HH:mm')}`);
          console.log(`Current time + 15 minutes (UTC): ${fifteenMinutesFromNowUtc.format('HH:mm')}`);

          if (medTimeInUtc.isBetween(nowUtc, fifteenMinutesFromNowUtc)) {
            const emailText = `Reminder: It's time to take your medication: ${medication.name}`;
            console.log(`Sending email to ${userProfile.email} for medication ${medication.name} at ${medTimeInUserTimezone.format('HH:mm')} (${userProfile.timezone})`);
            sendEmail(userProfile.email, 'Medication Reminder', emailText);
          } else {
            console.log(`No reminder needed for ${medication.name} at this time.`);
          }
        });

        // Log upcoming reminders within the next 24 hours
        medication.times.forEach(medTime => {
          const medTimeInUserTimezone = moment.tz(medTime, 'HH:mm', userProfile.timezone);
          const medTimeInUtc = medTimeInUserTimezone.clone().utc();

          if (medTimeInUtc.isBetween(nowUtc, twentyFourHoursFromNowUtc)) {
            console.log(`Upcoming reminder within 24 hours: Medication ${medication.name} for user ${userProfile.email} at ${medTimeInUserTimezone.format('HH:mm')} (${userProfile.timezone})`);
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

// Schedule the cron job to run every minute
cron.schedule('* * * * *', sendMedicationReminders); // Run every minute

