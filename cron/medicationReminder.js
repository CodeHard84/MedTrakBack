const cron = require('node-cron');
const Medication = require('../models/Medication');
const UserProfile = require('../models/UserProfile');
const sendEmail = require('../config/email');
const moment = require('moment-timezone');

const sendMedicationReminders = async () => {
  try {
    console.log('Cron job running...');
    
    const nowUtc = moment.utc();
    const fifteenMinutesFromNowUtc = moment.utc().add(15, 'minutes');
    
    console.log(`Current UTC time: ${nowUtc.format('HH:mm')}`);
    console.log(`UTC time 15 minutes from now: ${fifteenMinutesFromNowUtc.format('HH:mm')}`);

    const medications = await Medication.find();
    
    console.log(`Medications found: ${medications.length}`);

    for (const medication of medications) {
      const userProfile = await UserProfile.findOne({ userId: medication.userId });
      if (userProfile && userProfile.email) {
        console.log(`Checking medication for user: ${medication.userId}`);
        
        medication.times.forEach(medTime => {
          const medTimeInUserTimezone = moment.tz(medTime, 'HH:mm', userProfile.timezone);
          const medTimeInUtc = medTimeInUserTimezone.utc();
          
          console.log(`Medication time in user timezone: ${medTimeInUserTimezone.format('HH:mm')}`);
          console.log(`Medication time in UTC: ${medTimeInUtc.format('HH:mm')}`);

          if (medTimeInUtc.isBetween(nowUtc, fifteenMinutesFromNowUtc)) {
            const emailText = `Reminder: It's time to take your medication: ${medication.name}`;
            sendEmail(userProfile.email, 'Medication Reminder', emailText);
            console.log(`Email sent to ${userProfile.email} for medication ${medication.name}`);
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
