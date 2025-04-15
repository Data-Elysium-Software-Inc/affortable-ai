export function getUserSupportTicketHtml(issue: string, description: string, sender: string): string {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Your Support Ticket</title>
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
      .header {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .content {
        margin-bottom: 20px;
      }
      .footer {
        font-size: 12px;
        color: #777;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p class="header">Support Ticket Received</p>
      <div class="content">
        <p><strong>Issue:</strong> ${issue}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
        <p><strong>Your Email:</strong> ${sender}</p>
      </div>
      <p>Thank you for contacting us. We have received your support ticket and will get back to you shortly.</p>
      <br />
      <p>Best regards,<br>AffortableAI Support Team</p>
      <div class="footer">
        <p>&copy; ${currentYear} AffortableAI. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`;
}

export function getUserSupportTicketText(issue: string, description: string, sender: string): string {
  const year = new Date().getFullYear();
  return `
Support Ticket Received

Issue: ${issue}

Description:
${description}

Your Email: ${sender}

Thank you for contacting us. We have received your support ticket and will get back to you shortly.

Best regards,
AffortableAI Support Team
(c) ${year} AffortableAI. All rights reserved.
  `;
}
