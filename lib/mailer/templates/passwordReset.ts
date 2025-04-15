

export function getPasswordResetHtml(otp: string): string {
    const currentYear = new Date().getFullYear();
  
    return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Your Password Reset OTP</title>
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
        <p>You have requested to reset your password. Please use the following OTP to reset your password:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br />
        <p>Best regards,<br>AffortableAI</p>
        <div class="footer">
          <p>&copy; ${currentYear} AffortableAI. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>`;
  }
  
  export function getPasswordResetText(otp: string): string {
    const year = new Date().getFullYear();
    return `
  Dear User,
  
  You have requested to reset your password.
  Please use this OTP: ${otp}
  
  This OTP is valid for 5 minutes.
  
  If you did not request a reset, please ignore this email.
  
  Best regards,
  AffortableAI
  (c) ${year} AffortableAI. All rights reserved.
    `;
  }
  