import { useState } from "react";
import {
  createProduct,
  createProductOffer,
  createProductOfferAvailability,
} from "../api/productsApi";
import "../styles/CreateListing.css";

import plus from "../photos/plus.png";
import bin from "../photos/bin.png";
import edit from "../photos/edit.png";

type AvailabilityInput = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type NewOffer = {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  cashPaymentAvailability: boolean;
  availabilities: AvailabilityInput[];
};

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Poniedziałek",
  TUESDAY: "Wtorek",
  WEDNESDAY: "Środa",
  THURSDAY: "Czwartek",
  FRIDAY: "Piątek",
  SATURDAY: "Sobota",
  SUNDAY: "Niedziela",
};

function CreateListing() {
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [types, setTypes] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [newOffers, setNewOffers] = useState<NewOffer[]>([]);
  const [expandedOfferKey, setExpandedOfferKey] = useState<string | null>(null);
  const [editingOfferIndex, setEditingOfferIndex] = useState<number | null>(null);

  const [isOfferPopupOpen, setIsOfferPopupOpen] = useState(false);
  const [offerName, setOfferName] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDurationMinutes, setOfferDurationMinutes] = useState("");
  const [offerAvailabilities, setOfferAvailabilities] = useState<
    AvailabilityInput[]
  >([]);
  const [offerCashPaymentAvailability, setOfferCashPaymentAvailability,] = useState(false);

  function handleOpenOfferPopup() {
    setEditingOfferIndex(null);

    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setOfferAvailabilities([]);

    setIsOfferPopupOpen(true);
    setError("");
  }

  function handleOpenEditOfferPopup(index: number) {
    const offer = newOffers[index];

    setEditingOfferIndex(index);

    setOfferName(offer.name);
    setOfferDescription(offer.description);
    setOfferPrice(offer.price);
    setOfferDurationMinutes(offer.durationMinutes);
    setOfferAvailabilities(offer.availabilities);

    setIsOfferPopupOpen(true);
    setError("");
  }

  function handleDeleteOffer(index: number) {
    setNewOffers(newOffers.filter((_, offerIndex) => offerIndex !== index));
  }

  function handleCloseOfferPopup() {
    setIsOfferPopupOpen(false);
    setEditingOfferIndex(null);

    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setOfferAvailabilities([]);
    setOfferCashPaymentAvailability(false);
  }

  function handleToggleAvailabilityDay(dayOfWeek: string) {
    const dayAlreadySelected = offerAvailabilities.some(
      (availability) => availability.dayOfWeek === dayOfWeek
    );

    if (dayAlreadySelected) {
      setOfferAvailabilities(
        offerAvailabilities.filter(
          (availability) => availability.dayOfWeek !== dayOfWeek
        )
      );
      return;
    }

    setOfferAvailabilities([
      ...offerAvailabilities,
      {
        dayOfWeek,
        startTime: "",
        endTime: "",
      },
    ]);
  }

  function handleAvailabilityTimeChange(
    dayOfWeek: string,
    field: "startTime" | "endTime",
    value: string
  ) {
    setOfferAvailabilities(
      offerAvailabilities.map((availability) =>
        availability.dayOfWeek === dayOfWeek
          ? { ...availability, [field]: value }
          : availability
      )
    );
  }

  function handleAddOfferToLocalList() {
    if (
      offerName.trim().length === 0 ||
      offerDescription.trim().length === 0 ||
      offerPrice.trim().length === 0 ||
      offerDurationMinutes.trim().length === 0
    ) {
      setError("Wypełnij wszystkie pola oferty");
      return;
    }

    if (offerAvailabilities.length === 0) {
      setError("Wybierz co najmniej jeden dostępny dzień");
      return;
    }

    for (const availability of offerAvailabilities) {
      if (
        availability.startTime.trim().length === 0 ||
        availability.endTime.trim().length === 0
      ) {
        setError("Podaj godzinę rozpoczęcia i zakończenia dla każdego wybranego dnia");
        return;
      }

      if (availability.endTime <= availability.startTime) {
        setError("Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia");
        return;
      }
    }

    const offerData: NewOffer = {
      name: offerName,
      description: offerDescription,
      price: offerPrice,
      durationMinutes: offerDurationMinutes,
      cashPaymentAvailability: offerCashPaymentAvailability,
      availabilities: offerAvailabilities,
    };

    if (editingOfferIndex !== null) {
      setNewOffers(
        newOffers.map((offer, index) =>
          index === editingOfferIndex ? offerData : offer
        )
      );
    } else {
      setNewOffers([...newOffers, offerData]);
    }

    handleCloseOfferPopup();
    setError("");

    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setOfferAvailabilities([]);
    setIsOfferPopupOpen(false);
    setError("");
    setOfferCashPaymentAvailability(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");

      const data = {
        name: name,
        description: description,
        price: Number(price),
        types: types
          .split(",")
          .map((type) => type.trim())
          .filter((type) => type.length > 0),
        street: street,
        houseNumber: houseNumber,
        city: city,
        postalCode: postalCode,
        country: country,
        offers: [],
      };

      const createdProduct = await createProduct(data, image);

      for (const offer of newOffers) {
        const createdOffer = await createProductOffer(
          createdProduct.id,
          {
            name: offer.name,
            description: offer.description,
            price: Number(offer.price),
            durationMinutes: Number(offer.durationMinutes),
            cashPaymentAvailability:
              offer.cashPaymentAvailability,
          }
        );

        for (const availability of offer.availabilities) {
          await createProductOfferAvailability({
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime,
            endTime: availability.endTime,
            offerId: createdOffer.id,
          });
        }
      }

      setName("");
      setDescription("");
      setPrice("");
      setTypes("");
      setStreet("");
      setHouseNumber("");
      setCity("");
      setPostalCode("");
      setCountry("");
      setImage(null);
      setNewOffers([]);
    } catch (err) {
      setError("Nie udało się dodać ogłoszenia");
    }
  }

  return (
    <main className="page">
      <h1>Dodaj ogłoszenie</h1>

      <section className="create-card">
        <div className="create-header">
          <p>Dodaj nowe ogłoszenie ze swoją ofertą.</p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <label>
            Nazwa ogłoszenia
            <input
              type="text"
              placeholder="np. Pub Pod Kogutem"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Opis
            <textarea
              placeholder="Opisz swój lokal lub usługę..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Ulica
              <input
                type="text"
                placeholder="np. Kościuszki"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                required
              />
            </label>

            <label>
              Numer budynku
              <input
                type="text"
                placeholder="np. 15A"
                value={houseNumber}
                onChange={(event) => setHouseNumber(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Miasto
              <input
                type="text"
                placeholder="np. Olsztyn"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              />
            </label>

            <label>
              Kod pocztowy
              <input
                type="text"
                placeholder="np. 10-001"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Kraj
            <input
              type="text"
              placeholder="np. Polska"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Cena od
              <input
                type="number"
                placeholder="np. 199"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label>
              Kategoria
              <input
                type="text"
                placeholder="np. Pub, Bar, Restauracja"
                value={types}
                onChange={(event) => setTypes(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="offers-section">
            <div className="offers-wrapper">
              <h2>Oferty</h2>

              <button
                type="button"
                className="add-btn"
                onClick={handleOpenOfferPopup}
              >
                <img src={plus} alt="Dodaj ofertę" />
              </button>
            </div>

            {newOffers.length === 0 ? (
              <p>Brak ofert</p>
            ) : (
            <ul className="offers-list">
              {newOffers.map((offer, index) => {
                const offerKey = `new-${index}`;
                const isExpanded = expandedOfferKey === offerKey;

                return (
                  <li className="offer-object" key={offerKey}>
                    <div className="offer-content-create-listing">
                      <div className="offer-main-row">
                        <h3>{offer.name}</h3>
                        <p>{offer.description}</p>
                        <p>{offer.price} PLN</p>
                        <p>{offer.durationMinutes} min</p>
                        <p className="cash-availability-show">
                          <span>Płatność gotówką:</span>

                          <strong>
                            {offer.cashPaymentAvailability
                              ? "Dostępna"
                              : "Niedostępna"}
                          </strong>
                        </p>
                      </div>

                      <div className="buttons-wrap-create-listing">
                        <button
                          type="button"
                          className="edit-offer-button-create-listing"
                          onClick={() => handleOpenEditOfferPopup(index)}
                        >
                          <img src={edit} alt="Edytuj ofertę" />
                        </button>

                        <button
                          type="button"
                          className="delete-offer-button-create-listing"
                          onClick={() => handleDeleteOffer(index)}
                        >
                          <img src={bin} alt="Usuń ofertę" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="offer-expand-btn"
                      onClick={() => setExpandedOfferKey(isExpanded ? null : offerKey)}
                    >
                      {isExpanded ? "▲ Ukryj dostępność" : "▼ Pokaż dostępność"}
                    </button>

                    {isExpanded && (
                      <div className="offer-availabilities">
                        <p>Dostępne przedziały czasowe:</p>

                        {offer.availabilities.map((availability) => (
                          <p key={availability.dayOfWeek}>
                            {DAY_LABELS[availability.dayOfWeek] ?? availability.dayOfWeek}:{" "}
                            {availability.startTime} - {availability.endTime}
                          </p>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            )}
          </div>

          <label>
            Zdjęcie
            <div className="image-row">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  if (event.target.files) {
                    setImage(event.target.files[0]);
                  }
                }}
              />
            </div>
          </label>

          {error && <p className="error">{error}</p>}

          <button className="submit-btn" type="submit">
            Dodaj ogłoszenie
          </button>
        </form>
      </section>

      {isOfferPopupOpen && (
        <div className="offer-popup-backdrop" onClick={handleCloseOfferPopup}>
          <div
            className="offer-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>{editingOfferIndex === null ? "Dodaj ofertę" : "Edytuj ofertę"}</h2>

            <label>
              Nazwa oferty
              <input
                type="text"
                placeholder="np. Rezerwacja stolika"
                value={offerName}
                onChange={(event) => setOfferName(event.target.value)}
              />
            </label>

            <label>
              Opis oferty
              <textarea
                placeholder="Opisz tę ofertę..."
                value={offerDescription}
                onChange={(event) => setOfferDescription(event.target.value)}
              />
            </label>

            <label>
              Cena oferty
              <input
                type="number"
                min="0"
                placeholder="np. 99"
                value={offerPrice}
                onChange={(event) => setOfferPrice(event.target.value)}
              />
            </label>

            <label>
              Czas trwania (min)
              <input
                type="number"
                min="1"
                placeholder="np. 60"
                value={offerDurationMinutes}
                onChange={(event) =>
                  setOfferDurationMinutes(event.target.value)
                }
              />
            </label>
            <label className="cash-payment-checkbox">
              <input
                type="checkbox"
                checked={offerCashPaymentAvailability}
                onChange={(event) =>
                  setOfferCashPaymentAvailability(
                    event.target.checked
                  )
                }
              />

              <span>Zezwól na płatność gotówką</span>
            </label>

            <div>
              <p className="available-days">Dostępne dni</p>

              {DAYS_OF_WEEK.map((day) => {
                const availability = offerAvailabilities.find(
                  (item) => item.dayOfWeek === day
                );

                return (
                  <div className="day-row" key={day}>
                    <label className="day-label">
                      <input
                        className="day-checkbox"
                        type="checkbox"
                        checked={Boolean(availability)}
                        onChange={() => handleToggleAvailabilityDay(day)}
                      />
                      <span>{DAY_LABELS[day]}</span>
                    </label>

                    {availability && (
                      <div className="form-row availability-time-row">
                        <label>
                          Godzina rozpoczęcia
                          <input
                            type="time"
                            value={availability.startTime}
                            onChange={(event) =>
                              handleAvailabilityTimeChange(
                                day,
                                "startTime",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label>
                          Godzina zakończenia
                          <input
                            type="time"
                            value={availability.endTime}
                            onChange={(event) =>
                              handleAvailabilityTimeChange(
                                day,
                                "endTime",
                                event.target.value
                              )
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="submit-btn"
              onClick={handleAddOfferToLocalList}
            >
              {editingOfferIndex === null ? "Dodaj ofertę" : "Zapisz zmiany"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default CreateListing;