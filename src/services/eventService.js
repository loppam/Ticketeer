import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  runTransaction,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { validateEventCode } from "../utils/ticketUtils";
import { uploadToS3 } from "./s3Service";

const EVENTS_COLLECTION = "events";

export async function createEvent(eventData, userId) {
  if (!validateEventCode(eventData.eventCode)) {
    throw new Error("Invalid event code. Must be 4 uppercase letters.");
  }

  // Upload images if any
  const imageUrls = [];
  if (eventData.images?.length) {
    for (const image of eventData.images) {
      const path = `events/${userId}/${Date.now()}-${image.name}`;
      const url = await uploadToS3(image, path);
      imageUrls.push(url);
    }
  }

  // Check if event code already exists
  const eventQuery = query(
    collection(db, EVENTS_COLLECTION),
    where("eventCode", "==", eventData.eventCode)
  );
  const existingEvents = await getDocs(eventQuery);

  if (!existingEvents.empty) {
    throw new Error("Event code already exists");
  }

  const event = {
    ...eventData,
    images: imageUrls,
    creatorId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), event);
  return { ...event, id: docRef.id };
}

export async function getEvent(eventId) {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Event not found");
  }

  return { id: docSnap.id, ...docSnap.data() };
}

export async function getCreatorEvents(userId) {
  const eventsRef = collection(db, EVENTS_COLLECTION);
  const q = query(eventsRef, where("creatorId", "==", userId));

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to load events. Please try again later.");
  }
}

export async function registerForEvent(registrationData) {
  const eventRef = doc(db, EVENTS_COLLECTION, registrationData.eventId);
  const registrationsRef = collection(db, "registrations");

  try {
    // First create the registration document with all required fields
    const registrationRef = doc(registrationsRef);
    const registration = {
      name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone,
      eventId: registrationData.eventId,
      ticketCode: registrationData.ticketCode,
      selectedTicketType: registrationData.selectedTicketType,
      ticketPrice: registrationData.ticketPrice,
      quantity: registrationData.quantity,
      status: "pending",
      createdAt: new Date(),
      id: registrationRef.id,
    };

    await setDoc(registrationRef, registration);

    // For free tickets, we don't need to update ticket quantities immediately
    // This will be handled by updateRegistrationStatus when status is set to "completed"
    if (registrationData.ticketPrice === 0) {
      return registration;
    }

    // For paid tickets, proceed with the transaction to update ticket quantities
    await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }

      const event = eventDoc.data();
      const selectedTicketType = event.ticketTypes.find(
        (ticket) => ticket.name === registrationData.selectedTicketType
      );

      if (!selectedTicketType) {
        throw new Error("Selected ticket type not found");
      }

      if (selectedTicketType.quantity < registrationData.quantity) {
        throw new Error("Not enough tickets available");
      }

      // Update ticket quantity
      const updatedTicketTypes = event.ticketTypes.map((ticket) =>
        ticket.name === registrationData.selectedTicketType
          ? { ...ticket, quantity: ticket.quantity - registrationData.quantity }
          : ticket
      );

      transaction.update(eventRef, { ticketTypes: updatedTicketTypes });
    });

    return registration;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Failed to register for event. Please try again.");
  }
}

export async function validateTicket(ticketCode, eventId) {
  const registrationsRef = collection(db, "registrations");
  const q = query(
    registrationsRef,
    where("ticketCode", "==", ticketCode),
    where("eventId", "==", eventId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Invalid ticket code");
  }

  const registration = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

  if (registration.status !== "completed") {
    throw new Error("Ticket payment not completed");
  }

  return registration;
}

export async function checkInTicket(ticketCode) {
  const registrationsRef = collection(db, "registrations");
  const q = query(registrationsRef, where("ticketCode", "==", ticketCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Ticket not found");
  }

  const registration = snapshot.docs[0];

  await updateDoc(doc(registrationsRef, registration.id), {
    status: "used",
    checkedInAt: new Date(),
  });

  return { id: registration.id, ...registration.data() };
}

export async function getRegistration(registrationId) {
  const docRef = doc(db, "registrations", registrationId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Registration not found");
  }

  const registration = { id: docSnap.id, ...docSnap.data() };

  // Get event details
  const eventDoc = await getDoc(
    doc(db, EVENTS_COLLECTION, registration.eventId)
  );
  const event = eventDoc.data();

  return {
    ...registration,
    eventTitle: event.title,
    eventDate: event.date,
    eventLocation: event.location,
  };
}

export async function updateRegistrationStatus(registrationId, status) {
  const registrationRef = doc(db, "registrations", registrationId);

  await updateDoc(registrationRef, {
    status,
    updatedAt: new Date(),
    ...(status === "completed" ? { completedAt: new Date() } : {}),
  });

  // If payment is completed, update ticket quantities
  if (status === "completed") {
    const registration = await getRegistration(registrationId);
    const eventRef = doc(db, EVENTS_COLLECTION, registration.eventId);

    await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      const event = eventDoc.data();

      const updatedTicketTypes = event.ticketTypes.map((ticket) =>
        ticket.name === registration.selectedTicketType
          ? { ...ticket, quantity: ticket.quantity - registration.quantity }
          : ticket
      );

      transaction.update(eventRef, { ticketTypes: updatedTicketTypes });
    });
  }
}

export async function createCheckoutOrder(registrationData) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_NOMBA_API_URL}/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_NOMBA_API_KEY}`,
          "Merchant-Id": import.meta.env.VITE_NOMBA_MERCHANT_ID,
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
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create checkout order");
    }

    return response.json();
  } catch (error) {
    throw new Error(`Checkout error: ${error.message}`);
  }
}

export async function createPayment(registrationData) {
  // Implementation for creating payment
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registrationData),
  });
  return response.json();
}

export async function deleteEvent(eventId) {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event. Please try again later.");
  }
}
