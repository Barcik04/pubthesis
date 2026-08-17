import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Reservation.css";
import {
  getOfferById, 
  getReservationsByOfferId,
  createReservation,
  type ProductOfferDetails,
  type ReservationDate, 
  createPaymentIntent,
} from "../api/productsApi";


function Reservation() {
  const { offerId } = useParams();
  const navigate = useNavigate();

  const today = new Date();

  const [date, setDate] = useState(new Date());
  const [offer, setOffer] = useState<ProductOfferDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");
  const [reservations, setReservations] = useState<ReservationDate[]>([]);
  const [paymentSlot, setPaymentSlot] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
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


  const [expandedSlot, setExpandedSlot] = useState<string | null>(null); 
  const [wantInvoice, setWantInvoice] = useState(false); 
  const [invoiceData, setInvoiceData] = useState({
    buyerName: "",
    buyerNip: "",
    street: "",
    postalCode: "",
    city: "",
    country: "",
    email: "",
  });

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



  function toggleSlot(slotStart: string) {
    if (expandedSlot === slotStart) {
      setExpandedSlot(null); 
    } else {
      setExpandedSlot(slotStart);
      setWantInvoice(false); 
    }
  }

  function updateInvoiceField(field: keyof typeof invoiceData, value: string) {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
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


  function isDayAvailable(day: number) {
    if (!offer) return false;

    const dayOfWeek = getDayOfWeek(day);

    return offer.availabilities.some(
      (availability) => availability.dayOfWeek === dayOfWeek
    );
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

  


  async function handleCashPayment() {
    if (!paymentSlot) return;

    const slotStart = paymentSlot;
    setPaymentSlot(null);

    await saveReservation(slotStart);
  }

  async function handleOnlinePayment() {
    if (!paymentSlot || !offerId || !selectedDay) return;

    const startTime = `${getSelectedDate()}T${paymentSlot}:00`;

    try {
      setPaymentLoading(true);

      const reservation = await createReservation(
        {
          productOfferId: Number(offerId),
          startTime,
        },
        wantInvoice ? invoiceData : undefined
      );

      const paymentIntent = await createPaymentIntent(reservation.id);

      navigate("/payment", {
        state: {
          clientSecret: paymentIntent.clientSecret,
          reservationId: reservation.id,
        },
      });
    } catch {
      alert("Nie udało się rozpocząć płatności");
    } finally {
      setPaymentLoading(false);
    }
  }

  function handleReservationClick(slotStart: string) {
    if (!offerId || !selectedDay) return;

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      const startTime = `${getSelectedDate()}T${slotStart}:00`;

      localStorage.setItem(
        "pendingInvoice",
        wantInvoice ? JSON.stringify(invoiceData) : "null"
      );

      navigate(
        `/guest-reservation/${offerId}?startTime=${encodeURIComponent(startTime)}`
      );

      return;
    }

    setPaymentSlot(slotStart);
  }


  async function saveReservation(slotStart: string) {
    if (!offerId || !selectedDay) return;

    const startTime = `${getSelectedDate()}T${slotStart}:00`;
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      localStorage.setItem(
        "pendingInvoice",
        wantInvoice ? JSON.stringify(invoiceData) : "null"
      );

      navigate(
        `/guest-reservation/${offerId}?startTime=${encodeURIComponent(startTime)}`
      );
      return;
    }

    try {
      await createReservation(
        { productOfferId: Number(offerId), startTime },
        wantInvoice ? invoiceData : undefined
      );

      const updatedReservations = await getReservationsByOfferId(Number(offerId));
      setReservations(updatedReservations);

      setExpandedSlot(null);
      setWantInvoice(false);
      setInvoiceData({
        buyerName: "",
        buyerNip: "",
        street: "",
        postalCode: "",
        city: "",
        country: "",
        email: "",
      });

      alert("Rezerwacja została utworzona");
    } catch (error: any) {
      if (error?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate(
          `/guest-reservation/${offerId}?startTime=${encodeURIComponent(startTime)}`
        );
        return;
      }

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
              className={[
                "day",
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
                  ? "today"
                  : "",
                day !== null && !isDayAvailable(day)
                  ? "unavailable-day"
                  : "",
              ].join(" ")}
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
                    <div key={index} className="slot-block">
                      <button
                        disabled={slot.reserved}
                        onClick={() => toggleSlot(slot.start)}
                        className={
                          slot.reserved
                            ? "slot-button reserved-slot"
                            : expandedSlot === slot.start
                            ? "slot-button slot-button-active"
                            : "slot-button"
                        }
                      >
                        {slot.start} - {slot.end}
                      </button>

                      {expandedSlot === slot.start && (
                        <div className="slot-expanded">
                          <button
                            type="button"
                            className="invoice-toggle-button"
                            onClick={() => setWantInvoice(!wantInvoice)}
                          >
                            {wantInvoice ? "Cancel" : "Need an Invoice"}
                          </button>

                          {wantInvoice && (
                            <div className="invoice-form">
                              <input
                                placeholder="Buyer's name"
                                value={invoiceData.buyerName}
                                onChange={(e) => updateInvoiceField("buyerName", e.target.value)}
                              />
                              <input
                                placeholder="NIP"
                                value={invoiceData.buyerNip}
                                onChange={(e) => updateInvoiceField("buyerNip", e.target.value)}
                              />
                              <input
                                placeholder="Street and street number"
                                value={invoiceData.street}
                                onChange={(e) => updateInvoiceField("street", e.target.value)}
                              />
                              <input
                                placeholder="Postal code"
                                value={invoiceData.postalCode}
                                onChange={(e) => updateInvoiceField("postalCode", e.target.value)}
                              />
                              <input
                                placeholder="City"
                                value={invoiceData.city}
                                onChange={(e) => updateInvoiceField("city", e.target.value)}
                              />
                              <input
                                placeholder="Country"
                                value={invoiceData.country}
                                onChange={(e) => updateInvoiceField("country", e.target.value)}
                              />
                              <input
                                placeholder="Email"
                                type="email"
                                value={invoiceData.email}
                                onChange={(e) => updateInvoiceField("email", e.target.value)}
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            className="confirm-button"
                            onClick={() => handleReservationClick(slot.start)}>
                            Confirm reservation
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No services available today</p>
                )}
              </div>

              <button className="close-button" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        )}

        {paymentSlot && (
        <div
          className="payment-popup-background"
          onClick={() => setPaymentSlot(null)}
        >
          <div
            className="payment-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Choose payment method</h2>

            <p>
              Reservation for {paymentSlot}, {selectedDay}.{month + 1}.{year}
            </p>

            <div className="payment-options">
              <button
                type="button"
                className="cash-payment-button"
                onClick={handleCashPayment}
                disabled={paymentLoading}
              >
                Pay with cash
              </button>

              <button
                type="button"
                className="online-payment-button"
                onClick={handleOnlinePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Loading..." : "Pay online"}
              </button>
            </div>

            <button
              type="button"
              className="payment-cancel-button"
              onClick={() => setPaymentSlot(null)}
              disabled={paymentLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Reservation;