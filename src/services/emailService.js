import { getRegistration } from "./eventService";
import { emailTemplates } from "./emailTemplates";
// import { generateQRCode } from "../utils/qrCodeUtils";

export async function sendPaymentConfirmationEmail(email, registrationId) {
  try {
    const registration = await getRegistration(registrationId);
    // const qrCodeBuffer = await generateQRCode(registration.ticketCode);

    const emailContent = emailTemplates.ticketConfirmation.template({
      eventTitle: registration.eventTitle,
      ticketCode: registration.ticketCode,
      eventDate: registration.eventDate,
      eventLocation: registration.eventLocation,
      ticketType: registration.selectedTicketType,
      quantity: registration.quantity,
    });

    // Here you would integrate with your email service provider
    // For example, using SendGrid:
    /*
    await sendGrid.send({
      to: email,
      from: 'your-email@domain.com',
      subject: emailTemplates.ticketConfirmation.subject,
      html: emailContent,
      attachments: [
        {
          content: qrCodeBuffer.toString('base64'),
          filename: 'qrcode.png',
          type: 'image/png',
          disposition: 'inline',
          content_id: 'qrcode'
        }
      ]
    });
    */

    console.log("Sending email to:", email);
    console.log("Subject:", emailTemplates.ticketConfirmation.subject);
    console.log("Content:", emailContent);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
}
