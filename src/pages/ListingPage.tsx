import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, type ProductDetails } from "../api/productsApi";
import { Link } from "react-router-dom";

import "../styles/ListingPage.css";

function ListingPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError("Product id is missing");
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
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
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
              <span>No image</span>
            )}
          </div>

          <ul className="types-list">
            {product.types.map((type) => (
              <li className="types-object" key={type}>
                {type}
              </li>
            ))}
          </ul>
        </div>

        <div className="middle-column">
          <div className="name-wrapper">
            <h1>{product.name}</h1>
            <p>{product.description}</p>
          </div>
        </div>

        <div className="offers-wrapper-listing">
          <h2>Offers</h2>

          {product.offers.length === 0 ? (
            <p>No offers yet</p>
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
                    Check
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