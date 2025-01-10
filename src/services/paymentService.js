const NOMBA_API_URL = import.meta.env.VITE_NOMBA_API_URL;
const NOMBA_API_KEY = import.meta.env.VITE_NOMBA_API_KEY;

export async function createPayment(registrationData) {
  try {
    const response = await fetch(`${NOMBA_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOMBA_API_KEY}`,
      },
      body: JSON.stringify({
        amount: registrationData.ticketPrice * registrationData.quantity,
        currency: "NGN",
        reference: registrationData.ticketCode,
        customer: {
          email: registrationData.email,
          name: registrationData.name,
          phone: registrationData.phone,
        },
        metadata: {
          eventId: registrationData.eventId,
          ticketType: registrationData.selectedTicketType,
          quantity: registrationData.quantity,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Payment initialization failed");
    }

    const paymentData = await response.json();
    return paymentData;
  } catch (error) {
    throw new Error(`Payment error: ${error.message}`);
  }
}

export async function verifyPayment(reference) {
  try {
    const response = await fetch(
      `${NOMBA_API_URL}/payments/${reference}/verify`,
      {
        headers: {
          Authorization: `Bearer ${NOMBA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    const verificationData = await response.json();
    return verificationData;
  } catch (error) {
    throw new Error(`Verification error: ${error.message}`);
  }
}
