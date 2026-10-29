import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getReservationsByProductId,
  revokeReservation,
  type ReservationWithOffer,
} from "../api/productsApi";

import "../styles/ManageReservations.css";

function ManageReservations() {
  const { productId } = useParams();

  const [reservations, setReservations] = useState<ReservationWithOffer[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [offerName, setOfferName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const pageSize = 20;

  useEffect(() => {
    async function loadReservations() {
      if (!productId) {
        setError("Brak identyfikatora ogłoszenia");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getReservationsByProductId(
          Number(productId),
          page,
          pageSize,
          {
            username,
            offerName,
            firstName,
            lastName,
          }
        );

        setReservations(data.content);
        setTotalPages(data.totalPages);
      } catch {
        setError("Nie udało się wczytać rezerwacji");
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, [
    productId,
    page,
    username,
    offerName,
    firstName,
    lastName,
  ]);

  async function handleRevokeReservation(reservationId: number) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz odwołać tę rezerwację?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRevokingId(reservationId);
      setError("");

      await revokeReservation(reservationId);

      setReservations((currentReservations) =>
        currentReservations.filter(
          (reservation) => reservation.id !== reservationId
        )
      );
    } catch {
      setError("Nie udało się odwołać rezerwacji");
    } finally {
      setRevokingId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("pl-PL");
  }

  function goToPreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function goToNextPage() {
    setPage((currentPage) =>
      Math.min(currentPage + 1, totalPages - 1)
    );
  }

  function clearFilters() {
    setPage(0);
    setUsername("");
    setOfferName("");
    setFirstName("");
    setLastName("");
  }

  return (
    <main className="manage-reservations-page">
      <h1 className="manage-reservations-title">
        Zarządzaj rezerwacjami
      </h1>

      <section className="manage-reservations-card">
        <div className="manage-reservations-header">
          <div>
            <h2>Rezerwacje ogłoszenia</h2>
          </div>

          <Link to="/user" className="back-to-profile-button">
            Wróć do profilu
          </Link>
        </div>
        <div className="manage-reservations-filters">
          <input
            type="text"
            value={username}
            placeholder="Szukaj po kliencie..."
            className="manage-filter-input"
            onChange={(event) => {
              setPage(0);
              setUsername(event.target.value);
            }}
          />

          <input
            type="text"
            value={offerName}
            placeholder="Szukaj po nazwie oferty..."
            className="manage-filter-input"
            onChange={(event) => {
              setPage(0);
              setOfferName(event.target.value);
            }}
          />

          <input
            type="text"
            value={firstName}
            placeholder="Szukaj po imieniu..."
            className="manage-filter-input"
            onChange={(event) => {
              setPage(0);
              setFirstName(event.target.value);
            }}
          />

          <input
            type="text"
            value={lastName}
            placeholder="Szukaj po nazwisku..."
            className="manage-filter-input"
            onChange={(event) => {
              setPage(0);
              setLastName(event.target.value);
            }}
          />

          <button
            type="button"
            className="manage-filter-clear-button"
            onClick={clearFilters}
            disabled={
              username === "" &&
              offerName === "" &&
              firstName === "" &&
              lastName === ""
            }
          >
            Wyczyść
          </button>
        </div>

        {error && <p className="manage-reservations-error">{error}</p>}

        {loading && (
          <p className="manage-reservations-loading">
            Wczytywanie rezerwacji...
          </p>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="no-reservations">
            <h3>Brak rezerwacji</h3>
            <p>To ogłoszenie nie ma jeszcze żadnych rezerwacji.</p>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <ul className="manage-reservations-list">
            {reservations.map((reservation) => (
              <li
                key={reservation.id}
                className="manage-reservation-item"
              >
                <div className="manage-reservation-top">
                  <div>
                    <h3>{reservation.offerName}</h3>
                  </div>

                  <div className="manage-reservation-badges">
                    <span
                      className={`payment-method payment-method-${reservation.paymentMethod.toLowerCase()}`}
                    >
                      {reservation.paymentMethod === "CASH" ? "Gotówka" : "Karta"}
                    </span>

                    <span
                      className={`payment-status payment-status-${reservation.status
                        .toLowerCase()
                        .replace("_", "-")}`}
                    >
                      {reservation.status === "CONFIRMED" && "Potwierdzona"}
                      {reservation.status === "PENDING_PAYMENT" && "Oczekuje na płatność"}
                      {reservation.status === "CANCELLED" && "Anulowana"}
                    </span>
                  </div>
                </div>

                <p className="manage-reservation-description">
                  {reservation.offerDescription}
                </p>

                <div className="manage-reservation-details">
                  <div>
                    <span>Klient</span>
                    <strong>{reservation.username}</strong>
                  </div>

                  <div>
                    <span>Początek</span>
                    <strong>{formatDate(reservation.startTime)}</strong>
                  </div>

                  <div>
                    <span>Koniec</span>
                    <strong>{formatDate(reservation.endTime)}</strong>
                  </div>

                  <div>
                    <span>Czas trwania</span>
                    <strong>{reservation.durationMinutes} min</strong>
                  </div>

                  <div>
                    <span>Cena</span>
                    <strong>{reservation.offerPrice} PLN</strong>
                  </div>

                  <div>
                    <span>Imię i nazwisko</span>
                    <strong>
                      {reservation.firstName} {reservation.lastName}
                    </strong>
                  </div>
                </div>

                <div className="manage-reservation-actions">
                  <button
                    type="button"
                    className="revoke-reservation-button"
                    onClick={() =>
                      handleRevokeReservation(reservation.id)
                    }
                    disabled={revokingId === reservation.id}
                  >
                    {revokingId === reservation.id
                      ? "Odwoływanie..."
                      : "Odwołaj"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="manage-pagination">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={page === 0}
            className="manage-pagination-button"
          >
            &lt;
          </button>

          <span className="manage-pagination-info">
            Strona {page + 1} z {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={page >= totalPages - 1}
            className="manage-pagination-button"
          >
            &gt;
          </button>
        </div>
      </section>
    </main>
  );
}

export default ManageReservations;