// routes/auth.js (or similar)
const express = require('express');
const router = express.Router();
const { sendOtpSms } = require('../utils/sms');

router.post('/request-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // 1. Generate a 6-digit random OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Dispatch the SMS via Twilio
    const smsSent = await sendOtpSms(phoneNumber, generatedOtp);

    if (smsSent) {
        // 3. Store the OTP temporarily (e.g., in Redis or your DB) so you can verify it in the next step
        // saveOtpToCache(phoneNumber, generatedOtp); 

        return res.status(200).json({ message: 'OTP sent successfully' });
    } else {
        return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

module.exports = router;