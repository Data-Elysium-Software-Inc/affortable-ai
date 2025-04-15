export function getAdminSupportTicketHtml(issue: string, description: string, sender: string): string {
    return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>New Support Ticket</title>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .content {
          margin: 20px;
        }
      </style>
    </head>
    <body>
      <div class="content">
        <p><strong>Issue:</strong> ${issue}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Sender:</strong> ${sender}</p>
      </div>
    </body>
  </html>`;
  }
  
  export function getAdminSupportTicketText(issue: string, description: string, sender: string): string {
    return `New Support Ticket
  
  Issue: ${issue}
  
  Description:
  ${description}
  
  Sender: ${sender}
  `;
  }
  