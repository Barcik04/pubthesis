import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createProductOffer,
  createProductOfferAvailability,
  deleteProductOffer,
  updateProduct,
  updateProductOffer,
} from "../api/productsApi";
import "../styles/CreateListing.css";

import plus from "../photos/plus.png";
import bin from "../photos/bin.png";
import edit from "../photos/edit.png";

type OfferAvailability = {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};


type AvailabilityInput = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type Offer = {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt?: string;
  duration?: number;
  durationMinutes?: number;
  cashPaymentAvailability: boolean;
  availabilities: OfferAvailability[];
};

type NewOffer = {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  cashPaymentAvailability: boolean;
  availabilities: AvailabilityInput[];
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  types: string[];
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  imageUrl?: string | null;
  offers: Offer[];
};

function UpdateListing() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product as Product | undefined;

  const [error, setError] = useState("");

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [types, setTypes] = useState(product?.types?.join(", ") ?? "");
  const [street, setStreet] = useState(product?.street ?? "");
  const [houseNumber, setHouseNumber] = useState(
    product?.houseNumber ?? ""
  );
  const [city, setCity] = useState(product?.city ?? "");
  const [postalCode, setPostalCode] = useState(product?.postalCode ?? "");
  const [country, setCountry] = useState(product?.country ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [expandedOfferKey, setExpandedOfferKey] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>(product?.offers ?? []);

  const [newOffers, setNewOffers] = useState<NewOffer[]>([]);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);

  const [isOfferPopupOpen, setIsOfferPopupOpen] = useState(false);
  const [offerName, setOfferName] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDurationMinutes, setOfferDurationMinutes] = useState("");
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

  const [offerAvailabilities, setOfferAvailabilities] = useState<
    AvailabilityInput[]
  >([]);

  const [
    offerCashPaymentAvailability,
    setOfferCashPaymentAvailability,
  ] = useState(false);

  function handleOpenOfferPopup() {
    setEditingOfferId(null);
    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setOfferAvailabilities([]);
    setIsOfferPopupOpen(true);
    setError("");
    setOfferCashPaymentAvailability(false);
  }

  function handleOpenEditOfferPopup(offer: Offer) {
    setEditingOfferId(offer.id);
    setOfferName(offer.name);
    setOfferDescription(offer.description);
    setOfferPrice(offer.price.toString());
    setOfferDurationMinutes(
      (offer.durationMinutes ?? offer.duration ?? "").toString()
    );
    setOfferAvailabilities(
      offer.availabilities.map((availability) => ({
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime.slice(0, 5),
        endTime: availability.endTime.slice(0, 5),
      }))
    );
    setIsOfferPopupOpen(true);
    setError("");
    setOfferCashPaymentAvailability(offer.cashPaymentAvailability ?? false);
  }

  function handleCloseOfferPopup() {
    setIsOfferPopupOpen(false);
    setEditingOfferId(null);
    setOfferCashPaymentAvailability(false);
  }

  async function handleDeleteOffer(offerId: number) {
    try {
      setError("");
      await deleteProductOffer(offerId);
      setOffers(offers.filter((offer) => offer.id !== offerId));
    } catch (err) {
      setError("Nie udało się usunąć oferty");
    }
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



async function handleAddOfferToLocalList() {
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

    if (editingOfferId !== null) {
      try {
        const updatedOffer = await updateProductOffer(
          editingOfferId,
          {
            name: offerName,
            description: offerDescription,
            price: Number(offerPrice),
            durationMinutes: Number(offerDurationMinutes),
            cashPaymentAvailability:
              offerCashPaymentAvailability,
            availabilities: offerAvailabilities.map(
              (availability) => ({
                ...availability,
                offerId: editingOfferId,
              })
            ),
          }
        );

        setOffers(
          offers.map((offer) =>
            offer.id === editingOfferId ? updatedOffer : offer
          )
        );
      } catch (err) {
        setError("Nie udało się zaktualizować oferty");
        return;
      }
    } else {
      setNewOffers([
        ...newOffers,
        {
          name: offerName,
          description: offerDescription,
          price: offerPrice,
          durationMinutes: offerDurationMinutes,
          cashPaymentAvailability:
            offerCashPaymentAvailability,
          availabilities: offerAvailabilities,
        },
      ]);
    }

    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setOfferAvailabilities([]);
    setIsOfferPopupOpen(false);
    setEditingOfferId(null);
    setError("");
    setOfferCashPaymentAvailability(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId) {
      setError("Brak identyfikatora ogłoszenia");
      return;
    }

    try {
      setError("");

      const parsedProductId = Number(productId);

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
      };

      await updateProduct(parsedProductId, data, image);

      for (const offer of newOffers) {
        const createdOffer = await createProductOffer(
          parsedProductId,
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

      navigate("/user");

    } catch (err) {
      setError("Nie udało się zaktualizować ogłoszenia");
    }
  }

  if (!product) {
    return (
      <main className="page">
        <section className="create-card">
          <h1>Nie znaleziono danych ogłoszenia</h1>
          <p>Wróć do profilu i wybierz ogłoszenie ponownie.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Edytuj ogłoszenie</h1>

      <section className="create-card">
        <div className="create-header">
          <p>Edytuj swoje ogłoszenie.</p>
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

            {offers.length === 0 && newOffers.length === 0 ? (
              <p>Brak ofert</p>
            ) : (
            <ul className="offers-list">
              {offers.map((offer) => {
                const offerKey = `existing-${offer.id}`;
                const isExpanded = expandedOfferKey === offerKey;

                return (
                  <li className="offer-object" key={offerKey}>
                    <div className="offer-content-create-listing">
                      <div className="offer-main-row">
                        <h3>{offer.name}</h3>
                        <p>{offer.description}</p>
                        <p>{offer.price} PLN</p>
                        <p>{offer.duration ?? offer.durationMinutes} min</p>
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
                          onClick={() => handleOpenEditOfferPopup(offer)}
                        >
                          <img src={edit} alt="Edytuj ofertę" />
                        </button>

                        <button
                          type="button"
                          className="delete-offer-button-create-listing"
                          onClick={() => handleDeleteOffer(offer.id)}
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
                        {offer.availabilities.length === 0 ? (
                          <p>Brak przedziałów dostępności</p>
                        ) : (
                          <>
                            <p>Dostępne przedziały czasowe:</p>

                            {offer.availabilities.map((availability) => (
                              <p key={availability.id}>
                                {DAY_LABELS[availability.dayOfWeek] ?? availability.dayOfWeek}:{" "}
                                {availability.startTime.slice(0, 5)} -{" "}
                                {availability.endTime.slice(0, 5)}
                              </p>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}

              {newOffers.map((offer, index) => {
                const offerKey = `new-${index}`;
                const isExpanded = expandedOfferKey === offerKey;

                return (
                  <li className="offer-object" key={offerKey}>
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

          {product.imageUrl && (
            <div>
              <p>Aktualne zdjęcie:</p>
              <img
                src={`http://localhost:8080${product.imageUrl}`}
                alt={product.name}
                style={{
                  width: "180px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              />
            </div>
          )}

          <label>
            Nowe zdjęcie
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
            Zapisz zmiany
          </button>
        </form>
      </section>

      {isOfferPopupOpen && (
        <div className="offer-popup-backdrop" onClick={handleCloseOfferPopup}>
          <div
            className="offer-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>{editingOfferId === null ? "Dodaj ofertę" : "Edytuj ofertę"}</h2>

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
                      <div className="form-row">
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
              {editingOfferId === null ? "Dodaj ofertę" : "Zapisz zmiany"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default UpdateListing;