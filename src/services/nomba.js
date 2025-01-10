const NOMBA_API_URL = import.meta.env.VITE_NOMBA_API_URL;
const NOMBA_API_KEY = import.meta.env.VITE_NOMBA_API_KEY;
const NOMBA_MERCHANT_ID = import.meta.env.VITE_NOMBA_MERCHANT_ID;

export async function createCheckoutOrder(registrationData) {
  try {
    const response = await fetch(`${NOMBA_API_URL}/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOMBA_API_KEY}`,
        "Merchant-Id": NOMBA_MERCHANT_ID,
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
        redirect_url: `${window.location.origin}/payment/callback`,
        cancel_url: `${window.location.origin}/events/${registrationData.eventId}`,
        channels: ["card", "bank_transfer", "ussd"],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Checkout initialization failed");
    }

    const orderData = await response.json();
    return orderData;
  } catch (error) {
    throw new Error(`Checkout error: ${error.message}`);
  }
}

export async function verifyCheckoutOrder(reference) {
  try {
    const response = await fetch(
      `${NOMBA_API_URL}/checkout/orders/${reference}/verify`,
      {
        headers: {
          Authorization: `Bearer ${NOMBA_API_KEY}`,
          "Merchant-Id": NOMBA_MERCHANT_ID,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Verification failed");
    }

    const verificationData = await response.json();
    return verificationData;
  } catch (error) {
    throw new Error(`Verification error: ${error.message}`);
  }
}
