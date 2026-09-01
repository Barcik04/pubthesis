import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { getProducts, getProductTypes, searchCities, type CitySearchResult, } from "../api/productsApi";
import { Link } from "react-router-dom";
import ProductsMap from "./ProductsMap";

import "../styles/Start.css";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  const [showMap, setShowMap] = useState(false);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const [cityInput, setCityInput] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [cityResults, setCityResults] = useState<CitySearchResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");
  const [isCitySelected, setIsCitySelected] = useState(false);

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
    const cityName = cityInput.trim();

    setCityError("");

    if (isCitySelected || cityName.length < 2) {
      if (cityName.length < 2) {
        setCityResults([]);
      }

      return;
    }

    setCityResults([]);

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        setCityLoading(true);

        const cities = await searchCities(cityName);

        if (!cancelled) {
          setCityResults(cities);
        }
      } catch {
        if (!cancelled) {
          setCityError("Failed to search cities");
          setCityResults([]);
        }
      } finally {
        if (!cancelled) {
          setCityLoading(false);
        }
      }
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [cityInput, isCitySelected]);





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
          maxPrice,
          cityFilter
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
    }, [ page, searchName, selectedTypes, minPrice, maxPrice, cityFilter, ]);


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

  function resetFilters() {
    setPage(0);

    setSearchName("");
    setSelectedTypes([]);
    setMinPrice(0);
    setMaxPrice(10000);

    setCityInput("");
    setCityFilter("");
    setCityResults([]);
    setCityError("");
    setCityLoading(false);
    setIsCitySelected(false);

    setIsTypesOpen(false);
  }


  function handleCitySearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPage(0);
    setCityFilter(cityInput.trim());
    setCityResults([]);
    setIsCitySelected(true);
  }


function handleCitySelect(city: CitySearchResult) {
  setPage(0);
  setCityInput(city.name);
  setCityFilter(city.name);
  setCityResults([]);
  setCityError("");
  setIsCitySelected(true);
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
        <div className="city-search-wrapper">
          <form
            className="city-search-form"
            onSubmit={handleCitySearch}
          >
            <input
              type="text"
              placeholder="Search by city..."
              value={cityInput}
              onChange={(event) => {
                setCityInput(event.target.value);
                setIsCitySelected(false);
              }}
              className="city-search-input"
            />
          </form>

          {cityLoading && (
            <div className="city-search-message">
              Searching cities...
            </div>
          )}

          {cityError && (
            <div className="city-search-message city-search-error">
              {cityError}
            </div>
          )}

          {cityResults.length > 0 && (
            <div className="city-results-wrapper">
              <table className="city-results-table">
                <thead>
                  <tr>
                    <th>City</th>
                    <th>Location</th>
                  </tr>
                </thead>

                <tbody>
                  {cityResults.map((city) => (
                    <tr
                      key={`${city.latitude}-${city.longitude}`}
                      tabIndex={0}
                      onClick={() => handleCitySelect(city)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleCitySelect(city);
                        }
                      }}
                    >
                      <td className="city-result-name">
                        {city.name}
                      </td>

                      <td>
                        {city.displayName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
        <button
          type="button"
          className="reset-filters-button"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </div>
      <div className="map-section">
        <button
          type="button"
          className="show-map-button"
          onClick={() => setShowMap((current) => !current)}
        >
          {showMap ? "Hide map" : "Show map"}
        </button>

        <div className="map-window">
          {showMap ? (
            <ProductsMap products={products} />
          ) : (
            <p className="map-placeholder">
              Click "Show map" to display locations of products.
            </p>
          )}
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