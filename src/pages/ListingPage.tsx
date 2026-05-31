import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, type ProductDetails } from "../api/productsApi";

import "../styles/User.css";

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
      <section className="products-card-listing">
        {product.imageUrl && (
          <img
            src={`http://localhost:8080${product.imageUrl}`}
            alt={product.name}
            className="product-image-listing"
          />
        )}

        <h1>{product.name}</h1>

        <p>{product.description}</p>

        <p className="product-price-listing">
          od {product.price} PLN
        </p>

        <p>
          Status: {product.isActive ? "Active" : "Inactive"}
        </p>


        <h2>Categories</h2>

        <ul>
          {product.types.map((type) => (
            <li key={type}>{type}</li>
          ))}
        </ul>

        <h2>Offers</h2>

        {product.offers.length === 0 ? (
          <p>No offers yet</p>
        ) : (
          <ul>
            {product.offers.map((offer) => (
              <li key={offer.id}>
                <h3>{offer.name}</h3>
                <p>{offer.description}</p>
                <p>{offer.price} PLN</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default ListingPage;