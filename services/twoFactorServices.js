const axios = require('axios');

const sendOtp = async (number) => {
    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Call the 2Factor API to send OTP
        const response = await axios.get(`https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${number}/AUTOGEN/User%20verification`);
        if (response.data.Status !== "Success") {
            throw new Error('Failed to send OTP');
        }

        return otp;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

module.exports = { sendOtp };
