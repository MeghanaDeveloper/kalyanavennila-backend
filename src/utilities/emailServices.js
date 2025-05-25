const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.GODADDY_SMTP_HOST,
  port: process.env.GODADDY_SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.GODADDY_EMAIL,
    pass: process.env.GODADDY_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ✅ Fix potential SSL issues
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is Ready to Send Emails", success);
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
                <div style="padding: 10px; font-size: 24px;  font-weight: bold">
                    ${otp}
                </div>
                <p>This OTP is valid for only <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                <p>If you did not request this verification, you can ignore this email.</p>
                <p>Best Regards,</p>
                <p><strong>Kalyana Vennila Support Team</strong></p>
            </div>
        `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email sent successfully!",
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send email.",
      error: error.message,
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
                <div style="padding: 10px; font-size: 24px;  font-weight: bold">
                    ${accountId}
                </div>
                <p>Please keep your Account ID safe for future logins.</p>
                <p style="color: red; ">
    ⚠️ Important: Please **save your Account ID**. It will not be shown again!
    </p>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best Regards,</p>
                <p><strong>Kalyana Vennila Support Team</strong></p>
            </div>
        `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email sent successfully!",
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send email.",
      error: error.message,
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
            `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Temporary password email sent successfully!",
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send email.",
      error: error.message,
    };
  }
};

const sendProfileApprovedEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.GODADDY_EMAIL,
    to: email,
    subject: "Kalyana Vennila - Your Profile is Approved!",
    html: `
                <div style="padding: 16px; font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: green;">🎉 Congratulations, ${name}!</h2>
                    <p>Your profile has been <strong>successfully approved</strong> by the Kalyana Vennila team.</p>
    
                    <p style="font-size: 16px; font-weight: 500;">
                        You can now <strong>subscribe</strong> and continue using our platform to <strong>view matching profiles</strong> and connect with suitable partners.
                    </p>
    
                    <p>Thank you for choosing <strong>Kalyana Vennila</strong>. We are excited to be part of your journey!</p>
    
                    <br/>
                    <p>Warm regards,</p>
                    <p><strong>Kalyana Vennila Support Team</strong></p>
                </div>
            `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendProfileRejectedEmail = async (email, name, reason) => {
  const mailOptions = {
    from: process.env.GODADDY_EMAIL,
    to: email,
    subject: "Kalyana Vennila - Profile Rejected",
    html: `
                <div style="padding: 16px; font-family: Arial, sans-serif; color: #333;">
                    <h2>Dear ${name},</h2>
                    
                    <p>Thank you for registering with <strong>Kalyana Vennila</strong>.</p>
    
                    <p>After carefully reviewing your profile, we regret to inform you that it has not been approved to go live on our platform.</p>
    
                    <p>This decision was made based on our profile review guidelines to ensure authenticity and compatibility within our community.</p>

                    <h3><strong>Reason for Rejection:</strong></h3>
<p style="color:red , font-size:18px">${reason}</p>

    
                    <p>You're welcome to log in to your account, make the necessary updates, and resubmit your profile for review. Our team will be happy to reassess it once submitted.</p>
    
                    <p>We truly appreciate your interest in Kalyana Vennila and look forward to welcoming you to our community in the near future.</p>
                    
                    <br/>
                    <p>Warm regards,</p>
                    <p><strong>Kalyana Vennila Team</strong></p>
                </div>
            `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendProfileBlockedEmail = async (email, name, reason) => {
  const mailOptions = {
    from: process.env.GODADDY_EMAIL,
    to: email,
    subject: "Kalyana Vennila - Profile Blocked",
    html: `
      <div style="padding: 16px; font-family: Arial, sans-serif; color: #333;">
        <h2>Dear ${name},</h2>

        <p>Thank you for being part of <strong>Kalyana Vennila</strong>.</p>

        <p>We regret to inform you that your profile has been <strong>blocked</strong> due to a violation of our platform guidelines or other serious concerns.</p>

        <h3><strong>Reason for Blocking your profile:</strong></h3>
        <p style="color:red; font-size:18px">${reason}</p>

        <p>As a result, your account has been temporarily or permanently suspended, and you will not be able to log in or access our platform.</p>

        <p>If you believe this action was taken in error or wish to appeal the decision, please contact our support team at services@kalyanavennila.com</p>

        <p>We value your understanding and are here to assist you with any concerns you may have.</p>

        <br/>
        <p>Warm regards,</p>
        <p><strong>Kalyana Vennila Team</strong></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendContactMessagesToEmail = async (name, email, phone, message) => {
  const mailOptions = {
    from: email,
    to: process.env.GODADDY_ADMIN_EMAIL,
    subject: ` Message from ${name}`,
    html: `
      <div style="padding: 16px; font-family: Arial, sans-serif; color: #333;">
        <h2>Dear Sir/Madam</h2>

        <p>My name is <strong>${name}</strong>. I’m reaching out to you through the contact form.</p>

        <p>I would like to bring the following matter to your attention:</p>

         <p style=" color: #555; font-size:16px"><strong>${message}</strong></p>

    <p>Please let me know if you require any further information. </p>

    <p>Thank you for your time and consideration.</p>

    <p>I look forward to your response.</p>

        <br/>
        <p>Thank You</p>
        <p><strong>${name}</strong></p>
         <p><strong>${email}</strong></p>
          <p><strong>${phone}</strong></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpToEmail,
  sendAccountIdToEmail,
  sendTemporaryPasswordToEmail,
  sendProfileApprovedEmail,
  sendProfileRejectedEmail,
  sendProfileBlockedEmail,
  sendContactMessagesToEmail,
};
