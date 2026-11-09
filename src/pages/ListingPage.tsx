import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, type ProductDetails } from "../api/productsApi";
import { Link } from "react-router-dom";

import "../styles/ListingPage.css";
import location from "../photos/location.png"; 


function ListingPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError("Brak identyfikatora ogłoszenia");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getProductById(Number(productId));

        console.log(data);
        console.log(data.offers);
        setProduct(data);
      } catch (err) {
        setError("Nie udało się wczytać ogłoszenia");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return <p>Wczytywanie ogłoszenia...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!product) {
    return <p>Nie znaleziono ogłoszenia</p>;
  }

  return (
    <main className="page-listing">
      <div className="listing-content">
        <div className="left-column">
          <div className="product-image-placeholder">
            {product.imageUrl ? (
              <img
                src={`http://localhost:8080${product.imageUrl}`}
                alt={product.name}
                className="product-image-listing"
              />
            ) : (
              <span>Brak zdjęcia</span>
            )}
          </div>

          <ul className="types-list">
            {product.types.map((type) => (
              <li className="types-object" key={type}>
                {type}
              </li>
            ))}
          </ul>
          <div className="link-wrapper"> 
            {product.googleMapsLink &&
              product.street &&
              product.houseNumber &&
              product.postalCode &&
              product.city && (
                <a
                  href={product.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maps-link"
                >
                  {product.street} {product.houseNumber}, {product.postalCode}{" "}
                  {product.city}
                </a>
              )
            }
            <img src={location} alt="Lokalizacja" />
          </div>
          

        </div>

        <div className="middle-column">
          <div className="name-wrapper">
            <h1>{product.name}</h1>
            <p>{product.description}</p>
          </div>
        </div>

        <div className="offers-wrapper-listing">
          <h2>Oferty</h2>

          {product.offers.length === 0 ? (
            <p>Brak ofert</p>
          ) : (
            <ul className="offers-list-listing">
              {product.offers.map((offer) => (
                <li className="offer-object-listing" key={offer.id}>
                  <div className="offer-info">
                    <h3>{offer.name}</h3>
                    <p>{offer.description}</p>
                    <p>{offer.price} PLN</p>
                    <p>{offer.duration} min</p>
                  </div>
                  <Link to={`/reservation/${offer.id}`} className="offer-check-button">
                    Sprawdź
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

export default ListingPage;