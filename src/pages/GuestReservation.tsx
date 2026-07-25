import { useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { createGuestReservation } from "../api/productsApi";
import "../styles/GuestReservation.css";

function GuestReservation() {
  const { offerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startTime = searchParams.get("startTime") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!offerId || !startTime) {
      setError("Missing offer or time information");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await createGuestReservation({
        productOfferId: Number(offerId),
        startTime,
        guestFirstName: firstName,
        guestLastName: lastName,
        email,
      });

      alert("Rezerwacja została utworzona");
      navigate(`/listing-page/${result.productId}`);
    } catch (err) {
      setError("Nie udało się utworzyć rezerwacji");
    } finally {
      setLoading(false);
    }
  }



  function formatStartTime(value: string) {
    if (!value) return "";

    const date = new Date(value);

    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="guest-reservation-page">
      <h1 className="guest-reservation-title">Guest reservation</h1>

      <form className="guest-reservation-form" onSubmit={handleSubmit}>
        <p className="guest-reservation-info">
          Termin: {formatStartTime(startTime)}
        </p>

        {error && <p className="error">{error}</p>}

        <label className="guest-reservation-label">
          First name
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </label>

        <label className="guest-reservation-label">
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </label>

        <label className="guest-reservation-label">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <p className="guest-reservation-divider">Or sign in</p>

        <Link to="/signin" className="guest-reservation-secondary-button">
          Sign in
        </Link>

        <p className="guest-reservation-divider">You don't have an account?</p>

        <Link to="/signup" className="guest-reservation-secondary-button">
          Register
        </Link>

        <button
          type="submit"
          className="guest-reservation-button"
          disabled={loading}
        >
          {loading ? "Processing..." : "Proceed"}
        </button>
      </form>
    </main>
  );
}

export default GuestReservation;