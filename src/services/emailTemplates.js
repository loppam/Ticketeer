export const emailTemplates = {
  ticketConfirmation: {
    subject: "Your Event Ticket Confirmation",
    template: ({
      eventTitle,
      ticketCode,
      eventDate,
      eventLocation,
      ticketType,
      quantity,
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Ticket is Confirmed!</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #0066cc;">${eventTitle}</h2>
          <p><strong>Ticket Code:</strong> ${ticketCode}</p>
          <p><strong>Date:</strong> ${new Date(
            eventDate
          ).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p><strong>Ticket Type:</strong> ${ticketType}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <img src="cid:qrcode" alt="Ticket QR Code" style="max-width: 200px;" />
        </div>

        <p style="color: #666;">
          Please keep this ticket safe. You'll need to present the QR code for entry.
        </p>
      </div>
    `,
  },

  paymentFailed: {
    subject: "Event Registration Payment Failed",
    template: ({ eventTitle, paymentReference }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Payment Failed</h1>
        
        <p>We were unable to process your payment for:</p>
        <h2 style="color: #333;">${eventTitle}</h2>
        
        <p>Payment Reference: ${paymentReference}</p>
        
        <p>Please try again or contact support if you continue to experience issues.</p>
        
        <a href="{{retryPaymentUrl}}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Try Again
        </a>
      </div>
    `,
  },
};
