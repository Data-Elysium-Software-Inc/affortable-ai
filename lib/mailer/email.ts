// Usage: Send OTP email to user for password reset

const nodemailer = require('nodemailer')

import { getPasswordResetHtml, getPasswordResetText } from "./templates/passwordReset";
import { getSignupVerificationHtml, getSignupVerificationText } from "./templates/signupVerification";
import { getAdminSupportTicketHtml, getAdminSupportTicketText } from "./templates/adminSupportTicket";
import { getUserSupportTicketHtml, getUserSupportTicketText } from "./templates/userSupportTicket";

type OtpEmailType = "reset" | "signup";


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === "true", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export async function sendOtpEmail(toEmail: string, otp: string, type: OtpEmailType) {
  let subject: string;
  let htmlContent: string;
  let textContent: string;

  if (type === "reset") {
    subject = "Your Password Reset OTP";
    htmlContent = getPasswordResetHtml(otp);
    textContent = getPasswordResetText(otp);
  } else {
    subject = "Your Sign-Up Verification OTP";
    htmlContent = getSignupVerificationHtml(otp);
    textContent = getSignupVerificationText(otp);
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendSupportTicketEmail(senderEmail: string, issue: string, description: string) {
  // Build common subject (e.g. including ticket ID if appended earlier)
  const subject = `Support Ticket: ${issue}`;

  // Admin email (minimal template)
  const adminHtmlContent = getAdminSupportTicketHtml(issue, description, senderEmail);
  const adminTextContent = getAdminSupportTicketText(issue, description, senderEmail);
  const adminMailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    replyTo: senderEmail, // When admin replies, it goes directly to the user
    to: "support@data-elysium.ca",
    subject,
    text: adminTextContent,
    html: adminHtmlContent,
  };

  // User confirmation email (detailed template)
  const userSubject = `Your support ticket has been received: ${issue}`;
  const userHtmlContent = getUserSupportTicketHtml(issue, description, senderEmail);
  const userTextContent = getUserSupportTicketText(issue, description, senderEmail);
  const userMailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    replyTo: "support@data-elysium.ca", 
    to: senderEmail,
    subject: userSubject,
    text: userTextContent,
    html: userHtmlContent,
  };

  try {
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Support ticket email sent to admin successfully:", adminInfo.messageId);

    const userInfo = await transporter.sendMail(userMailOptions);
    console.log("Support ticket confirmation email sent to user successfully:", userInfo.messageId);

    return { adminInfo, userInfo };
  } catch (error) {
    console.error("Error sending support ticket emails:", error);
    throw error;
  }
}