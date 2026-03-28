import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  try {
    const response = await resend.emails.send({
      from: "LocalHub Admin <support@summitdigital.in>",

      to: options.email,
      subject: options.subject,
      html: options.message,
    });

    if (response.error) {
      console.error("🚨 RESEND BLOCKED THE EMAIL:", response.error.message);
      throw new Error(response.error.message);
    }

    console.log(
      `✅ Email successfully sent to ${options.email}!`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("🚨 RESEND API ERROR:", error.message);
    throw error;
  }
};
