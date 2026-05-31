import { useEffect, useState } from "react";
import { getProducts, getProductTypes } from "../api/productsApi";
import { Link } from "react-router-dom";

import "../styles/Start.css";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
};

type ProductType = {
  id: number;
  type: string;
};

function Start() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ProductType[]>([]);
  const [isTypesOpen, setIsTypesOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const pageSize = 20;

  useEffect(() => {
    async function loadProductTypes() {
      try {
        const data = await getProductTypes();
        setAvailableTypes(data);
      } catch (err) {
        setError("Failed to load product types");
      }
    }

    loadProductTypes();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts(
          page,
          pageSize,
          searchName,
          selectedTypes,
          minPrice,
          maxPrice
        );

        setProducts(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
    }, [page, searchName, selectedTypes, minPrice, maxPrice]);


  function goToPreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function goToNextPage() {
    setPage((currentPage) => Math.min(currentPage + 1, totalPages - 1));
  }

  function handleTypeChange(type: string) {
    setPage(0);

    setSelectedTypes((currentTypes) => {
      if (currentTypes.includes(type)) {
        return currentTypes.filter((currentType) => currentType !== type);
      }

      return [...currentTypes, type];
    });
  }

return (
  <main className="page">
    <h1>Listings</h1>

    <section className="products-card">
      <div className="filters-wrap">
        <div className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchName}
            onChange={(event) => {
              setPage(0);
              setSearchName(event.target.value);
            }}
            className="search-input"
          />
        </div>

        <div className="types-dropdown">
          <button
            type="button"
            className="types-dropdown-button"
            onClick={() => setIsTypesOpen((current) => !current)}
          >
            <span>
              Categories
              {selectedTypes.length > 0 && ` (${selectedTypes.length})`}
            </span>

            <span className="dropdown-arrows">˅˅</span>
          </button>

          {isTypesOpen && (
            <div className="types-dropdown-menu">
              {availableTypes.map((productType) => (
                <label key={productType.id} className="types-dropdown-item">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(productType.type)}
                    onChange={() => handleTypeChange(productType.type)}
                  />
                  {productType.type}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="price-filter">
          <label className="price-text">
            <label className="price-text">
              <span>MIN {minPrice} PLN</span>
              <span>-</span>
              <span>MAX {maxPrice} PLN</span>
            </label>
          </label>

          <div className="price-slider-group">
            <div className="price-slider-wrap">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={minPrice}
                onChange={(event) => {
                  const newMinPrice = Number(event.target.value);

                  if (newMinPrice <= maxPrice) {
                    setPage(0);
                    setMinPrice(newMinPrice);
                  }
                }}
              />

              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(event) => {
                  const newMaxPrice = Number(event.target.value);

                  if (newMaxPrice >= minPrice) {
                    setPage(0);
                    setMaxPrice(newMaxPrice);
                  }
                }}
              />
            </div>
            
          </div>
        </div>
      </div>

      <div className="status-row">
        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Loading products...</p>}
      </div>

      <ul className="products-list">
        {!loading &&
          products.map((product) => (
            <li key={product.id} className="product-item">
              {product.imageUrl && (
                <img
                  src={`http://localhost:8080${product.imageUrl}`}
                  alt={product.name}
                  className="product-image"
                />
              )}

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="product-price">od {product.price} PLN</p>
              </div>
              <Link to={`/listing-page/${product.id}`} className="details-button">
                View details
              </Link>
            </li>
          ))}
      </ul>
    </section>

    <div className="pagination">
      <button
        onClick={goToPreviousPage}
        disabled={page === 0}
        className="pagination-button"
      >
        &lt;
      </button>

      <span className="pagination-info">
        Page {page + 1} of {Math.max(totalPages, 1)}
      </span>

      <button
        onClick={goToNextPage}
        disabled={page >= totalPages - 1}
        className="pagination-button"
      >
        &gt;
      </button>
    </div>
  </main>
);
}

export default Start;