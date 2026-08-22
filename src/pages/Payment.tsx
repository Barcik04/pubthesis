import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import CardPaymentForm from "../components/CardPaymentForm";
import { createGuestPaymentIntent } from "../api/productsApi";

import "../styles/Payment.css";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

type PaymentLocationState = {
  clientSecret: string;
  reservationId: number;
  guest?: boolean;
};

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const locationState =
    location.state as PaymentLocationState | null;

  const stateClientSecret =
    locationState?.clientSecret;

  const stateReservationId =
    locationState?.reservationId;

  const reservationIdFromUrl =
    searchParams.get("reservationId");

  const guestPaymentToken =
    searchParams.get("token");

  const [clientSecret, setClientSecret] =
    useState(stateClientSecret ?? "");

  const [reservationId, setReservationId] =
    useState<number | null>(
      stateReservationId ?? null
    );

  const [guestPayment, setGuestPayment] =
    useState(locationState?.guest ?? false);

  const [loading, setLoading] = useState(
    !stateClientSecret
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (stateClientSecret && stateReservationId) {
      setClientSecret(stateClientSecret);
      setReservationId(stateReservationId);
      setGuestPayment(
        locationState?.guest ?? false
      );
      setLoading(false);
      return;
    }

    async function loadGuestPayment() {
      const parsedReservationId = Number(
        reservationIdFromUrl
      );

      if (
        !Number.isInteger(parsedReservationId) ||
        parsedReservationId <= 0 ||
        !guestPaymentToken
      ) {
        setError(
          "Payment data is missing or invalid"
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const paymentIntent =
          await createGuestPaymentIntent(
            parsedReservationId,
            guestPaymentToken
          );

        setClientSecret(
          paymentIntent.clientSecret
        );

        setReservationId(parsedReservationId);
        setGuestPayment(true);
      } catch {
        setError(
          "Payment link is invalid or has expired"
        );
      } finally {
        setLoading(false);
      }
    }

    loadGuestPayment();
  }, [
    stateClientSecret,
    stateReservationId,
    locationState?.guest,
    reservationIdFromUrl,
    guestPaymentToken,
  ]);

  if (loading) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>Preparing payment</h1>
          <p>Please wait...</p>
        </div>
      </main>
    );
  }

  if (
    error ||
    !clientSecret ||
    !reservationId
  ) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>Payment unavailable</h1>

          <p>
            {error ||
              "Payment data is missing. Start the reservation again."}
          </p>

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

        <p>Reservation #{reservationId}</p>

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
              navigate(
                guestPayment
                  ? "/start"
                  : "/my-reservations",
                {
                  replace: true,
                }
              );
            }}
            onCancel={() => navigate(-1)}
          />
        </Elements>
      </div>
    </main>
   );
}

export default Payment;