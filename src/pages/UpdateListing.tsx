import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createProductOffer,
  createProductOfferAvailability,
  updateProduct,
} from "../api/productsApi";
import "../styles/CreateListing.css";

import plus from "../photos/plus.png";

type OfferAvailability = {
  id: number;
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
  availabilities: OfferAvailability[];
};

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
  availabilities: AvailabilityInput[];
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  types: string[];
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
  const [image, setImage] = useState<File | null>(null);
  const [expandedOfferKey, setExpandedOfferKey] = useState<string | null>(null);

  const [newOffers, setNewOffers] = useState<NewOffer[]>([]);

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
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
  };

  const [offerAvailabilities, setOfferAvailabilities] = useState<
    AvailabilityInput[]
  >([]);

  function handleOpenOfferPopup() {
    setIsOfferPopupOpen(true);
    setError("");
  }

  function handleCloseOfferPopup() {
    setIsOfferPopupOpen(false);
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
      setError("Fill all offer fields");
      return;
    }

    if (offerAvailabilities.length === 0) {
      setError("Choose at least one available day");
      return;
    }

    for (const availability of offerAvailabilities) {
      if (
        availability.startTime.trim().length === 0 ||
        availability.endTime.trim().length === 0
      ) {
        setError("Fill start and end time for every selected day");
        return;
      }

      if (availability.endTime <= availability.startTime) {
        setError("End time must be after start time");
        return;
      }
    }

    setNewOffers([
      ...newOffers,
      {
        name: offerName,
        description: offerDescription,
        price: offerPrice,
        durationMinutes: offerDurationMinutes,
        availabilities: offerAvailabilities,
      },
    ]);

    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setOfferAvailabilities([]);
    setIsOfferPopupOpen(false);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId) {
      setError("Missing product id");
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
      };

      await updateProduct(parsedProductId, data, image);

      for (const offer of newOffers) {
        const createdOffer = await createProductOffer(parsedProductId, {
          name: offer.name,
          description: offer.description,
          price: Number(offer.price),
          durationMinutes: Number(offer.durationMinutes),
        });

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
      setError("Failed to update listing");
    }
  }

  if (!product) {
    return (
      <main className="page">
        <section className="create-card">
          <h1>Listing data not found</h1>
          <p>Go back to your profile and choose listing again.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Update Listing</h1>

      <section className="create-card">
        <div className="create-header">
          <p>Edit your product or service offer.</p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <label>
            Product name
            <input
              type="text"
              placeholder="e.g. Website design"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Description
            <textarea
              placeholder="Describe your product or service..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Price from
              <input
                type="number"
                placeholder="e.g. 199"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label>
              Type
              <input
                type="text"
                placeholder="e.g. IT, Design, Repair"
                value={types}
                onChange={(event) => setTypes(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="offers-section">
            <div className="offers-wrapper">
              <h2>Offers</h2>

              <button
                type="button"
                className="add-btn"
                onClick={handleOpenOfferPopup}
              >
                <img src={plus} alt="add-plus-btn" />
              </button>
            </div>

            {product.offers.length === 0 && newOffers.length === 0 ? (
              <p>No offers yet</p>
            ) : (
            <ul className="offers-list">
              {product.offers.map((offer) => {
                const offerKey = `existing-${offer.id}`;
                const isExpanded = expandedOfferKey === offerKey;

                return (
                  <li className="offer-object" key={offerKey}>
                    <div className="offer-main-row">
                      <h3>{offer.name}</h3>
                      <p>{offer.description}</p>
                      <p>{offer.price} PLN</p>
                      <p>{offer.duration ?? offer.durationMinutes} minutes</p>
                    </div>

                    <button
                      type="button"
                      className="offer-expand-btn"
                      onClick={() => setExpandedOfferKey(isExpanded ? null : offerKey)}
                    >
                      {isExpanded ? "▲ Hide availability" : "▼ Show availability"}
                    </button>

                    {isExpanded && (
                      <div className="offer-availabilities">
                        {offer.availabilities.length === 0 ? (
                          <p>No availability ranges</p>
                        ) : (
                          <>
                            <p>Available time ranges:</p>

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
                      <p>{offer.durationMinutes} minutes</p>
                    </div>

                    <button
                      type="button"
                      className="offer-expand-btn"
                      onClick={() => setExpandedOfferKey(isExpanded ? null : offerKey)}
                    >
                      {isExpanded ? "▲ Hide availability" : "▼ Show availability"}
                    </button>

                    {isExpanded && (
                      <div className="offer-availabilities">
                        <p>Available time ranges:</p>

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
              <p>Current image:</p>
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
            New image
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
            Update listing
          </button>
        </form>
      </section>

      {isOfferPopupOpen && (
        <div className="offer-popup-backdrop" onClick={handleCloseOfferPopup}>
          <div
            className="offer-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Add offer</h2>

            <label>
              Offer name
              <input
                type="text"
                placeholder="e.g. Basic package"
                value={offerName}
                onChange={(event) => setOfferName(event.target.value)}
              />
            </label>

            <label>
              Offer description
              <textarea
                placeholder="Describe this offer..."
                value={offerDescription}
                onChange={(event) => setOfferDescription(event.target.value)}
              />
            </label>

            <label>
              Offer price
              <input
                type="number"
                min="0"
                placeholder="e.g. 99"
                value={offerPrice}
                onChange={(event) => setOfferPrice(event.target.value)}
              />
            </label>

            <label>
              Duration minutes
              <input
                type="number"
                min="1"
                placeholder="e.g. 60"
                value={offerDurationMinutes}
                onChange={(event) =>
                  setOfferDurationMinutes(event.target.value)
                }
              />
            </label>

            <div>
              <p className="available-days">Available days</p>

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
                          Start time
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
                          End time
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
              Add offer
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default UpdateListing;