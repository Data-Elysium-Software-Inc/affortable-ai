
/**
 * Returns the HTML content for a sign-up verification OTP email.
 */
export function getSignupVerificationHtml(otp: string): string {
    const currentYear = new Date().getFullYear();
  
    return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Your Sign-Up Verification OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
        }
        .otp {
          background-color: #f2f2f2;
          padding: 10px;
          font-size: 24px;
          text-align: center;
          letter-spacing: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Dear User,</p>
        <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not initiate this sign-up, please ignore this email.</p>
        <br />
        <p>Best regards,<br>AffortableAI</p>
        <div class="footer">
          <p>&copy; ${currentYear} AffortableAI. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>`;
  }
  
  
  export function getSignupVerificationText(otp: string): string {
    const year = new Date().getFullYear();
    return `
  Dear User,
  
  Thank you for signing up at AffortableAI!
  Please use this OTP to verify your email address: ${otp}
  
  This OTP is valid for 5 minutes.
  
  If you did not create this account, please ignore this email.
  
  Best regards,
  AffortableAI
  (c) ${year} AffortableAI. All rights reserved.
    `;
  }
  