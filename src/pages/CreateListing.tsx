import { useState } from "react";
import { createProduct, createProductOffer } from "../api/productsApi";
import "../styles/CreateListing.css";

import plus from "../photos/plus.png";

type NewOffer = {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
};

function CreateListing() {
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [types, setTypes] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [newOffers, setNewOffers] = useState<NewOffer[]>([]);

  const [isOfferPopupOpen, setIsOfferPopupOpen] = useState(false);
  const [offerName, setOfferName] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDurationMinutes, setOfferDurationMinutes] = useState("");

  function handleOpenOfferPopup() {
    setIsOfferPopupOpen(true);
    setError("");
  }

  function handleCloseOfferPopup() {
    setIsOfferPopupOpen(false);
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

    setNewOffers([
      ...newOffers,
      {
        name: offerName,
        description: offerDescription,
        price: offerPrice,
        durationMinutes: offerDurationMinutes,
      },
    ]);

    setOfferName("");
    setOfferDescription("");
    setOfferPrice("");
    setOfferDurationMinutes("");
    setIsOfferPopupOpen(false);
    setError("");
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
      };

      const createdProduct = await createProduct(data, image);

      for (const offer of newOffers) {
        await createProductOffer(createdProduct.id, {
          name: offer.name,
          description: offer.description,
          price: Number(offer.price),
          durationMinutes: Number(offer.durationMinutes),
        });
      }

      setName("");
      setDescription("");
      setPrice("");
      setTypes("");
      setImage(null);
      setNewOffers([]);
    } catch (err) {
      setError("Failed to create listing");
    }
  }

  return (
    <main className="page">
      <h1>Create Listing</h1>

      <section className="create-card">
        <div className="create-header">
          <p>Add a new product or service to your offer.</p>
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

            {newOffers.length === 0 ? (
              <p>No offers yet</p>
            ) : (
              <ul className="offers-list">
                {newOffers.map((offer, index) => (
                  <li className="offer-object" key={`new-offer-${index}`}>
                    <h3>{offer.name}</h3>
                    <p>{offer.description}</p>
                    <p>{offer.price} PLN</p>
                    <p>{offer.durationMinutes} min</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label>
            Image
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
            Create listing
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
              Duration in minutes
              <input
                type="number"
                min="1"
                placeholder="e.g. 60"
                value={offerDurationMinutes}
                onChange={(event) => setOfferDurationMinutes(event.target.value)}
              />
            </label>

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

export default CreateListing;