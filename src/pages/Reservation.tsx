import { useParams } from "react-router-dom";
import { useState } from "react";
import { createReservation } from "../api/productsApi";

import "../styles/Reservation.css";

function Reservation() {
  const { offerId } = useParams();

  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!offerId) {
      setError("Offer id is missing");
      return;
    }

    if (!startDate) {
      setError("Start date is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const reservation = await createReservation({
        productOfferId: Number(offerId),
        startTime: startDate,
      });

      setSuccessMessage(
        `Reservation created from ${reservation.startTime} to ${reservation.endTime}`
      );
    } catch (err) {
      setError("Failed to create reservation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reservation-page">
      <div className="reservation-card">
        <h1>Reservation</h1>

        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <form className="reservation-form" onSubmit={handleSubmit}>
          <label>
            Start date
            <input
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Finalize"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Reservation;