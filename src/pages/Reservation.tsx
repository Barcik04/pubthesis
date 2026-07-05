import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Reservation.css";
import { getOfferById, getReservationsByOfferId, createReservation, type ProductOfferDetails, type ReservationDate} from "../api/productsApi";

function Reservation() {
  const { offerId } = useParams();

  const today = new Date();

  const [date, setDate] = useState(new Date());
  const [offer, setOffer] = useState<ProductOfferDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");
  const [reservations, setReservations] = useState<ReservationDate[]>([]);

  const year = date.getFullYear();
  const month = date.getMonth();

  const monthName = date.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

  const days = [
    ...Array(emptyDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  useEffect(() => {
    async function loadData() {
      if (!offerId) return;

      const offerData = await getOfferById(Number(offerId));
      const reservationsData = await getReservationsByOfferId(Number(offerId));

      setOffer(offerData);
      setReservations(reservationsData);
    }

    loadData();
  }, [offerId]);

  function previousMonth() {
    setDate(new Date(year, month - 1));
  }

  function nextMonth() {
    setDate(new Date(year, month + 1));
  }

  function getDayOfWeek(day: number) {
    const clickedDate = new Date(year, month, day);
    const dayIndex = clickedDate.getDay();

    const daysOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    return daysOfWeek[dayIndex];
  }

  function openPopup(day: number) {
    setSelectedDay(day);
    setSelectedDayOfWeek(getDayOfWeek(day));
  }

  function closePopup() {
    setSelectedDay(null);
    setSelectedDayOfWeek("");
  }

  function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function minutesToTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }


  async function handleReservation(slotStart: string) {
    if (!offerId || !selectedDay) return;

    const confirmed = window.confirm(
      `Czy na pewno chcesz zarezerwować termin ${slotStart} dnia ${selectedDay}.${month + 1}.${year}?`
    );

    if (!confirmed) return;

    try {
      const startTime = `${getSelectedDate()}T${slotStart}:00`;

      await createReservation({
        productOfferId: Number(offerId),
        startTime,
      });

      const updatedReservations = await getReservationsByOfferId(Number(offerId));
      setReservations(updatedReservations);

      alert("Rezerwacja została utworzona");
    } catch (error) {
      alert("Nie udało się utworzyć rezerwacji");
    }
  }

  function getSelectedDate() {
    if (!selectedDay) return "";

    const selectedDate = new Date(year, month, selectedDay);

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function getSlots() {
    if (!offer) return [];

    const availability = offer.availabilities.find(
      (a) => a.dayOfWeek === selectedDayOfWeek
    );

    if (!availability) return [];

    const start = timeToMinutes(availability.startTime);
    const end = timeToMinutes(availability.endTime);
    const duration = offer.duration;

    const selectedDate = getSelectedDate();

    const slots = [];

    for (let time = start; time + duration <= end; time += duration) {
      const slotStart = minutesToTime(time);
      const slotEnd = minutesToTime(time + duration);

      const reserved = reservations.some((reservation) => {
        const reservationDate = reservation.startTime.slice(0, 10);
        const reservationStart = reservation.startTime.slice(11, 16);

        return reservationDate === selectedDate && reservationStart === slotStart;
      });

      slots.push({
        start: slotStart,
        end: slotEnd,
        reserved,
      });
    }

    return slots;
  }
  return (
    <main className="reservation-page">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={previousMonth}>←</button>
          <h1>{monthName}</h1>
          <button onClick={nextMonth}>→</button>
        </div>

        <div className="weekdays">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        <div className="days">
          {days.map((day, index) => (
            <button
              key={index}
              disabled={day === null}
              onClick={() => day && openPopup(day)}
              className={
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
                  ? "day today"
                  : "day"
              }
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="popup-background" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>
              {selectedDay}.{month + 1}.{year}
            </h2>

            <div className="slots">
              {getSlots().length > 0 ? (
                getSlots().map((slot, index) => (
                <button
                  key={index}
                  disabled={slot.reserved}
                  onClick={() => handleReservation(slot.start)}
                  className={slot.reserved ? "slot-button reserved-slot" : "slot-button"}
                >
                  {slot.start} - {slot.end}
                </button>
                ))
              ) : (
                <p>Brak dostępnych godzin w tym dniu</p>
              )}
            </div>

            <button className="close-button" onClick={closePopup}>
              Zamknij
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Reservation;