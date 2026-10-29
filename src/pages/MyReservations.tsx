import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  cancelReservation,
  createPaymentIntent,
  getMyReservations,
  type MyReservation,
} from "../api/productsApi";

import "../styles/MyReservations.css";

type ReservationFilter = "ALL" | "UPCOMING" | "COMPLETED" | "PAID";

function MyReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<ReservationFilter>("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentLoadingId, setPaymentLoadingId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReservations();
        setReservations(data);
      } catch {
        setError("Nie udało się wczytać rezerwacji");
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
      return reservation.status === "CONFIRMED";
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

  async function handlePayNow(reservationId: number) {
    try {
      setError("");
      setPaymentLoadingId(reservationId);

      const paymentIntent = await createPaymentIntent(reservationId);

      navigate("/payment", {
        state: {
          clientSecret: paymentIntent.clientSecret,
          reservationId,
        },
      });
    } catch {
      setError("Nie udało się rozpocząć płatności");
    } finally {
      setPaymentLoadingId(null);
    }
  }

  async function handleCancelReservation(reservationId: number) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz anulować tę rezerwację?"
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
      setError("Nie udało się anulować rezerwacji");
    }
  }

  return (
    <main className="my-reservations-page">
      <h1 className="my-reservations-title">Moje rezerwacje</h1>

      <section className="my-reservations-card">
        <div className="reservation-filters">
          <button
            type="button"
            className={selectedFilter === "ALL" ? "active" : ""}
            onClick={() => setSelectedFilter("ALL")}
          >
            Wszystkie
          </button>

          <button
            type="button"
            className={selectedFilter === "UPCOMING" ? "active" : ""}
            onClick={() => setSelectedFilter("UPCOMING")}
          >
            Nadchodzące
          </button>

          <button
            type="button"
            className={selectedFilter === "COMPLETED" ? "active" : ""}
            onClick={() => setSelectedFilter("COMPLETED")}
          >
            Zakończone
          </button>

          <button
            type="button"
            className={selectedFilter === "PAID" ? "active" : ""}
            onClick={() => setSelectedFilter("PAID")}
          >
            Opłacone
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {loading && (
          <p className="loading">Wczytywanie rezerwacji...</p>
        )}

        {!loading && filteredReservations.length === 0 && (
          <p className="empty-reservations">
            Nie znaleziono rezerwacji.
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
                  <h2>Rezerwacja #{reservation.id}</h2>

                  <p>
                    <span>Początek:</span>
                    {formatDate(reservation.startTime)}
                  </p>

                  <p>
                    <span>Koniec:</span>
                    {formatDate(reservation.endTime)}
                  </p>

                  <p>
                    <span>Status:</span>

                    <strong
                      className={
                        reservation.status === "CONFIRMED"
                          ? "payment-paid"
                          : reservation.status === "PENDING_PAYMENT"
                            ? "payment-pending"
                            : "payment-cancelled"
                      }
                    >
                      {reservation.status === "CONFIRMED"
                        ? "Potwierdzona"
                        : reservation.status === "PENDING_PAYMENT"
                          ? "Oczekuje na płatność"
                          : "Anulowana"}
                    </strong>
                  </p>

                  <p>
                    <span>Metoda płatności:</span>

                    <strong
                      className={
                        reservation.paymentMethod === "CASH"
                          ? "my-payment-method-cash"
                          : "my-payment-method-card"
                      }
                    >
                      {reservation.paymentMethod === "CASH"
                        ? "Gotówka"
                        : "Karta online"}
                    </strong>
                  </p>
                </div>

                <div className="reservation-actions">
                  <Link
                    to={`/listing-page/${reservation.productId}`}
                    className="reservation-details-button"
                  >
                    Zobacz ogłoszenie
                  </Link>

                  {reservation.status === "PENDING_PAYMENT" &&
                    reservation.paymentMethod === "CARD" && (
                      <button
                        type="button"
                        className="reservation-pay-button"
                        onClick={() => handlePayNow(reservation.id)}
                        disabled={paymentLoadingId === reservation.id}
                      >
                        {paymentLoadingId === reservation.id
                          ? "Wczytywanie..."
                          : "Zapłać teraz"}
                      </button>
                    )}

                  {new Date(reservation.startTime) > now &&
                    reservation.status !== "CANCELLED" && (
                      <button
                        type="button"
                        className="reservation-cancel-button"
                        onClick={() =>
                          handleCancelReservation(reservation.id)
                        }
                      >
                        Anuluj
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/user" className="back-to-profile-button">
        Wróć do profilu
      </Link>
    </main>
  );
}

export default MyReservations;