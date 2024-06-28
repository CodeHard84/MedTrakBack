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

        let emailSent = false;

        for (const medTime of medication.times) {
          // Ensure the medication time is set correctly for the current date in the user's timezone
          let medTimeInUserTimezone = moment.tz(medTime, 'HH:mm', userProfile.timezone).set({
            year: nowUtc.year(),
            month: nowUtc.month(),
            date: nowUtc.date()
          });

          // Check if the medication time has already passed today, if so, adjust to the next day
          if (medTimeInUserTimezone.isBefore(moment.tz(nowUtc, userProfile.timezone))) {
            medTimeInUserTimezone.add(1, 'day');
          }

          const medTimeInUtc = medTimeInUserTimezone.clone().utc();

          console.log(`Medication time in user timezone (${userProfile.timezone}): ${medTimeInUserTimezone.format('YYYY-MM-DD HH:mm')}`);
          console.log(`Medication time in UTC: ${medTimeInUtc.format('YYYY-MM-DD HH:mm')}`);
          console.log(`Current time (UTC): ${nowUtc.format('YYYY-MM-DD HH:mm')}`);
          console.log(`Current time + 15 minutes (UTC): ${fifteenMinutesFromNowUtc.format('YYYY-MM-DD HH:mm')}`);

          // Check if medTimeInUtc is within the next 15 minutes
          if (!emailSent && medTimeInUtc.isBetween(nowUtc, fifteenMinutesFromNowUtc)) {
            const emailText = `Reminder: It's time to take your medication: ${medication.name}`;
            console.log(`Sending email to ${userProfile.email} for medication ${medication.name} at ${medTimeInUserTimezone.format('HH:mm')} (${userProfile.timezone})`);
            sendEmail(userProfile.email, 'Medication Reminder', emailText);
            emailSent = true;
          } else {
            console.log(`No reminder needed for ${medication.name} at this time.`);
          }

          // Break the loop if an email has already been sent
          if (emailSent) break;
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
