import { useState, type FormEvent } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Link } from "react-router-dom";
import "../styles/Payment.css"

type CardPaymentFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

function CardPaymentForm({
  onSuccess,
  onCancel,
}: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAuthenticated = Boolean(
    localStorage.getItem("accessToken")
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) return;

    try {
      setLoading(true);
      setError("");

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setError(
          result.error.message ?? "Payment could not be completed"
        );
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card-payment-form" onSubmit={handleSubmit}>
      <PaymentElement />

      {error && <p className="payment-error">{error}</p>}

      <button
        type="submit"
        className="online-payment-button"
        disabled={!stripe || !elements || loading}
      >
        {loading ? "Processing..." : "Pay now"}
      </button>

      <button
        type="button"
        className="payment-cancel-button"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
        {!isAuthenticated && (
          <div className="cash-login-section">
            <p className="guest-reservation-divider">
              Want to pay with cash?
            </p>

            <p className="cash-login-description">
              Sign in or create an account to choose cash payment.
            </p>

            <div className="cash-login-actions">
              <Link
                to="/signin"
                className="guest-reservation-secondary-button"
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                className="guest-reservation-secondary-button"
              >
                Register
              </Link>
            </div>
          </div>
        )}
    </form>
  );
}

export default CardPaymentForm;