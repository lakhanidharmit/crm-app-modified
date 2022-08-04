require('dotenv').config();
const jwt = require('jsonwebtoken');
const authConfig = require('../configs/auth.config');
const sendEmail = require('../utils/notificationClient')

module.exports = (user)=>{
        let token = jwt.sign({id: user._id}, authConfig.secret); // no expiery because we can decode it to get id to resend link if time expired
        sendEmail(
            `Email varification link`,
            `Please verify your account by visiting this link. ${process.env.APP_URL}/crm/api/v2/auth/verifyemail/${token}`,
            user.email,
            "CRM app"
        );
}