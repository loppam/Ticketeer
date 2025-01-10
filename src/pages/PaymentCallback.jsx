import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyCheckoutOrder } from "../services/nomba";
import { updateRegistrationStatus } from "../services/eventService";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    async function verifyTransaction() {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        return;
      }

      try {
        const verificationData = await verifyCheckoutOrder(reference);

        if (verificationData.status === "successful") {
          await updateRegistrationStatus(reference, "completed");
          navigate(`/registration/${reference}/success`);
        } else {
          await updateRegistrationStatus(reference, "failed");
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
      }
    }

    verifyTransaction();
  }, [searchParams, navigate]);

  return (
    <div className="payment-callback">
      <h1>Payment Status</h1>
      {status === "verifying" && <p>Verifying your payment...</p>}
      {status === "success" && (
        <div>
          <h2>Payment Successful!</h2>
          <p>Your ticket has been confirmed.</p>
          <button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </button>
        </div>
      )}
      {status === "failed" && (
        <div>
          <h2>Payment Failed</h2>
          <p>There was an error processing your payment.</p>
          <button onClick={() => window.history.back()}>Try Again</button>
        </div>
      )}
    </div>
  );
}
