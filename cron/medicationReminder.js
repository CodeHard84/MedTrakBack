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

    console.log(`Current UTC time from API: ${nowUtc.format('YYYY-MM-DD HH:mm')}`);
    console.log(`UTC time 15 minutes from now: ${fifteenMinutesFromNowUtc.format('YYYY-MM-DD HH:mm')}`);

    const medications = await Medication.find();
    console.log(`Medications found: ${medications.length}`);

    for (const medication of medications) {
      const userProfile = await UserProfile.findOne({ userId: medication.userId });
      if (userProfile && userProfile.email) {
        console.log(`Checking medication for user: ${medication.userId}`);

        let nextEmailTime = null;

        medication.times.forEach(medTime => {
          let medTimeInUserTimezone = moment.tz(medTime, 'HH:mm', userProfile.timezone).set({
            year: nowUtc.year(),
            month: nowUtc.month(),
            date: nowUtc.date()
          });

          // If the medication time is before the current time, and it is still today, we should not adjust to the next day.
          // This means we need to adjust the logic to handle such cases properly.
          const medTimeInUtc = medTimeInUserTimezone.clone().utc();

          console.log(`Medication time in user timezone (${userProfile.timezone}): ${medTimeInUserTimezone.format('YYYY-MM-DD HH:mm')}`);
          console.log(`Medication time in UTC: ${medTimeInUtc.format('YYYY-MM-DD HH:mm')}`);
          console.log(`Current time (UTC): ${nowUtc.format('YYYY-MM-DD HH:mm')}`);
          console.log(`Current time + 15 minutes (UTC): ${fifteenMinutesFromNowUtc.format('YYYY-MM-DD HH:mm')}`);

          // Check if medTimeInUtc is within the next 15 minutes
          if (medTimeInUtc.isBetween(nowUtc, fifteenMinutesFromNowUtc)) {
            const emailText = `Reminder: It's time to take your medication: ${medication.name}`;
            console.log(`Sending email to ${userProfile.email} for medication ${medication.name} at ${medTimeInUserTimezone.format('HH:mm')} (${userProfile.timezone})`);
            sendEmail(userProfile.email, 'Medication Reminder', emailText);
          } else {
            console.log(`No reminder needed for ${medication.name} at this time.`);
          }

          // Determine the next time an email should be sent
          if (!nextEmailTime || medTimeInUtc.isBefore(nextEmailTime)) {
            nextEmailTime = medTimeInUtc;
          }
        });

        // Log the next email time for this medication
        if (nextEmailTime) {
          console.log(`Next email for medication ${medication.name} will be sent at ${nextEmailTime.format('YYYY-MM-DD HH:mm')} UTC`);
        } else {
          console.log(`No upcoming email scheduled for medication ${medication.name}`);
        }
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
