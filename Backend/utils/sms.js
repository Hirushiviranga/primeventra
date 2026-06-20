// utils/sms.js
const twilio = require('twilio');

// Twilio automatically picks up these exact variable names if they are in your .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendOtpSms = async (userPhoneNumber, otpCode) => {
    try {
        const message = await client.messages.create({
            body: `Your PrimeVentra registration code is: ${otpCode}. This code will expire in 5 minutes.`,
            from: twilioPhone,
            to: userPhoneNumber
        });
        
        console.log(`OTP sent successfully to ${userPhoneNumber}. Message SID: ${message.sid}`);
        return true;
    } catch (error) {
        console.error('Failed to send SMS:', error.message);
        return false;
    }
};

module.exports = { sendOtpSms };