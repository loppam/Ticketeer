import { updateRegistrationStatus } from "./eventService";
import { sendPaymentConfirmationEmail } from "./emailService";

export async function handlePaymentWebhook(event) {
  const { type, data } = event;

  switch (type) {
    case "payment.success":
      await handlePaymentSuccess(data);
      break;
    case "payment.failed":
      await handlePaymentFailure(data);
      break;
    default:
      console.log("Unhandled webhook event:", type);
  }
}

async function handlePaymentSuccess(data) {
  const { reference, customer } = data;

  try {
    await updateRegistrationStatus(reference, "completed");
    await sendPaymentConfirmationEmail(customer.email, reference);
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}

async function handlePaymentFailure(data) {
  const { reference } = data;

  try {
    await updateRegistrationStatus(reference, "failed");
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
}
