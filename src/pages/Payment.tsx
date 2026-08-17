import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation, useNavigate } from "react-router-dom";

import CardPaymentForm from "../components/CardPaymentForm";
import "../styles/Payment.css";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

type PaymentLocationState = {
  clientSecret: string;
  reservationId: number;
};

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as PaymentLocationState | null;
  const clientSecret = state?.clientSecret;

  if (!clientSecret) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>Payment unavailable</h1>

          <p>Payment data is missing. Start the reservation again.</p>

          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="payment-card">
        <h1>Complete payment</h1>
        <p>Reservation #{state.reservationId}</p>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <CardPaymentForm
            onSuccess={() => {
              navigate("/my-reservations", {
                replace: true,
              });
            }}
            onCancel={() => navigate(-1)}
          />
        </Elements>
      </div>
    </main>
  );
}

export default Payment;