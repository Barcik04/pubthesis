import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReservations, cancelReservation, type MyReservation } from "../api/productsApi";

import "../styles/MyReservations.css";

type ReservationFilter = "ALL" | "UPCOMING" | "COMPLETED" | "PAID";



function MyReservations() {
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<ReservationFilter>("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReservations();
        setReservations(data);
      } catch {
        setError("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  const now = new Date();

  const filteredReservations = reservations.filter((reservation) => {
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);

    if (selectedFilter === "UPCOMING") {
      return startTime > now;
    }

    if (selectedFilter === "COMPLETED") {
      return endTime < now;
    }

    if (selectedFilter === "PAID") {
      return reservation.paid;
    }

    return true;
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleCancelReservation(reservationId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await cancelReservation(reservationId);

      setReservations((currentReservations) =>
        currentReservations.filter(
          (reservation) => reservation.id !== reservationId
        )
      );
    } catch {
      setError("Failed to cancel reservation");
    }
  }

  return (
    <main className="my-reservations-page">
      <h1 className="my-reservations-title">My Reservations</h1>

      <section className="my-reservations-card">
        <div className="reservation-filters">
          <button
            type="button"
            className={selectedFilter === "ALL" ? "active" : ""}
            onClick={() => setSelectedFilter("ALL")}
          >
            All
          </button>

          <button
            type="button"
            className={selectedFilter === "UPCOMING" ? "active" : ""}
            onClick={() => setSelectedFilter("UPCOMING")}
          >
            Upcoming
          </button>

          <button
            type="button"
            className={selectedFilter === "COMPLETED" ? "active" : ""}
            onClick={() => setSelectedFilter("COMPLETED")}
          >
            Completed
          </button>

          <button
            type="button"
            className={selectedFilter === "PAID" ? "active" : ""}
            onClick={() => setSelectedFilter("PAID")}
          >
            Paid
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {loading && (
          <p className="loading">Loading reservations...</p>
        )}

        {!loading && !error && filteredReservations.length === 0 && (
          <p className="empty-reservations">
            No reservations found.
          </p>
        )}

        {!loading && filteredReservations.length > 0 && (
          <ul className="reservations-list">
            {filteredReservations.map((reservation) => (
              <li
                key={reservation.id}
                className="reservation-item"
              >
                <div className="reservation-info">
                  <h2>Reservation #{reservation.id}</h2>

                  <p>
                    <span>Start:</span>
                    {formatDate(reservation.startTime)}
                  </p>

                  <p>
                    <span>End:</span>
                    {formatDate(reservation.endTime)}
                  </p>

                  <p>
                    <span>Payment:</span>
                    <strong
                      className={
                        reservation.paid
                          ? "payment-paid"
                          : "payment-unpaid"
                      }
                    >
                      {reservation.paid ? "Paid" : "Unpaid"}
                    </strong>
                  </p>
                </div>

                <div className="reservation-actions">
                  <Link
                    to={`/listing-page/${reservation.productId}`}
                    className="reservation-details-button"
                  >
                    View product
                  </Link>

                  {new Date(reservation.startTime) > now && (
                    <button
                      type="button"
                      className="reservation-cancel-button"
                      onClick={() => handleCancelReservation(reservation.id)}
                    > 
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

      </section>
      <Link to="/user" className="back-to-profile-button">
        Back to profile
      </Link>
    </main>
  );
}

export default MyReservations;