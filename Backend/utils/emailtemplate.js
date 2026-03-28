
export const verificationEmailTemplate = (name, otp) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4A90E2; text-align: center;">Welcome to Local Services!</h2>
        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #4A90E2; letter-spacing: 5px; padding: 10px 20px; background-color: #f4f8ff; border-radius: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #777;"><em>This code is valid for 15 minutes. If you did not request this, please ignore this email.</em></p>
        <br>
        <p style="font-size: 14px; color: #333;">Best regards,<br><strong>The Local Services Team</strong></p>
      </div>
    `;
  };
  
  export const passwordResetTemplate = (name, resetToken) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #E24A4A; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Use the secure token below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #E24A4A; padding: 10px 20px; background-color: #fff4f4; border-radius: 5px; word-break: break-all;">${resetToken}</span>
        </div>
        <p style="font-size: 14px; color: #777;"><em>This token is valid for 15 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</em></p>
        <br>
        <p style="font-size: 14px; color: #333;">Best regards,<br><strong>The Local Services Team</strong></p>
      </div>
    `;
  };