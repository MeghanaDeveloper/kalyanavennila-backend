    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        host: process.env.GODADDY_SMTP_HOST, 
        port: process.env.GODADDY_SMTP_PORT, 
        secure: true, 
        pool: true, 
        maxConnections: 5, 
        maxMessages: 100, 
        rateLimit: 5, 
        auth: { 
            user: process.env.GODADDY_EMAIL,
            pass: process.env.GODADDY_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
    });

    transporter.verify(function (error, success) {
        if (error) {
            console.error("SMTP Connection Error:", error);
        } else {
            console.log("✅ SMTP Server is Ready to Send Emails");
        }
    });


    const sendOtpToEmail = async (email, otp) => {
        const mailOptions = {
            from: process.env.GODADDY_EMAIL, 
            to: email,
            subject: "sending Otp for Kalyana Vennila - Account Email Verification",
            html: `
            <div style=" padding: 10px">
                <h2>Kalyana Vennila - OTP Verification</h2>
                <p>Dear User,</p>
                <p>Thank you for registering with <strong>Kalyana Vennila</strong>. To verify your email, please use the OTP below:</p>
                <div style="padding: 10px; font-size: 20px;  font-weight: bold">
                    ${otp}
                </div>
                <p>This OTP is valid for only <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                <p>If you did not request this verification, you can ignore this email.</p>
                <p>Best Regards,</p>
                <p><strong>Kalyana Vennila Support Team</strong></p>
            </div>
        `
        };
        try {
            const info = await transporter.sendMail(mailOptions);
            const end = Date.now();  
            console.log(`✅ Email sent to ${email} in ${end - start}ms`);  
            console.log(info)
            return {
                success: true,
                message: "Email sent successfully!",
                messageId: info.messageId
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to send email.",
                error: error.message
            };
        }
    };

    const sendAccountIdToEmail = async (email, accountId) => {
        const mailOptions = {
            from: process.env.GODADDY_EMAIL, 
            to: email,
            subject: "Kalyana Vennila - Account Registration Successful",
            html: `
            <div style=" padding: 10px">
                <h2>Welcome to Kalyana Vennila!</h2>
                <p>Dear User,</p>
                <p>Thank you for registering with <strong>Kalyana Vennila</strong>. Your account has been successfully created.</p>
                <p><strong>Your Account ID:</strong></p>
                <div style="padding: 10px; font-size: 18px;  font-weight: bold">
                    ${accountId}
                </div>
                <p>Please keep your Account ID safe for future logins.</p>
                <p className=" text-red-500 font-semibold">
    ⚠️ Important: Please **save your Account ID**. It will not be shown again!
    </p>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best Regards,</p>
                <p><strong>Kalyana Vennila Support Team</strong></p>
            </div>
        `

        };
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(info)
            const end = Date.now();  
            console.log(`✅ Email sent to ${email} in ${end - start}ms`);  
            return {
                success: true,
                message: "Email sent successfully!",
                messageId: info.messageId
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to send email.",
                error: error.message
            };
        }
    };


    const sendTemporaryPasswordToEmail = async (email, password) => {
        const mailOptions = {
            from: process.env.GODADDY_EMAIL, 
            to: email,
            subject: "Kalyana Vennila - Reset Password",
            html: `
                <div style=" padding: 10px">
                    <h2>Kalyana Vennila - Password Reset</h2>
                    <p>Dear User,</p>
                    <p>You have requested to reset your password. Please use the temporary password below to log in and update your password:</p>
                    <div style=" padding: 10px;  font-size: 24px; font-weight: bold">
                        ${password}
                    </div>
                    <p>For security reasons, we recommend updating your password immediately after logging in.</p>
                    <p>If you did not request this reset, please ignore this email.</p>
                    <p>Thank you,</p>
                    <p><strong>Kalyana Vennila Support Team</strong></p>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            return {
                success: true,
                message: "Temporary password email sent successfully!",
                messageId: info.messageId
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to send email.",
                error: error.message
            };
        }
    };


    module.exports = {
        sendOtpToEmail,
        sendAccountIdToEmail,
        sendTemporaryPasswordToEmail
    }