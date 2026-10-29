import { useEffect, useState } from "react";
import { getMyProducts, deleteProduct, getProductTypes } from "../api/productsApi";
import { logout } from "../api/authApi";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import edit from "../photos/edit.png"; 
import bin from "../photos/bin.png"; 


import "../styles/User.css";

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

function User() {
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

  const navigate = useNavigate();


  const pageSize = 20;

  useEffect(() => {
  async function loadProductTypes() {
    try {
      const data = await getProductTypes();
      setAvailableTypes(data);
    } catch (err) {
      setError("Nie udało się wczytać kategorii");
    }
  }

  loadProductTypes();
  }, []);

    useEffect(() => {
    async function loadProducts() {
        try {
        setLoading(true);
        setError("");


        const data = await getMyProducts(
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
        setError("Nie udało się wczytać ogłoszeń");
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

    function handleLogout() {
    logout();
    navigate("/signin"); 
    }

    async function handleDeleteProduct(productId: number) {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć to ogłoszenie?");

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteProduct(productId);

            setProducts((currentProducts) =>
            currentProducts.filter((product) => product.id !== productId)
            );
        } catch (err) {
            setError("Nie udało się usunąć ogłoszenia");
        }
    }

  return (
    <main className="user-page">
        <h1 className="profile-title-user">Twój profil</h1>
        
        <section className="products-card-user">
            {error && <p className="error">{error}</p>}

            {loading && <p className="loading">Wczytywanie ogłoszeń...</p>}
            <div className="filters-wrap-user">
                <div className="search-form-user">
                    <input
                        type="text"
                        placeholder="Szukaj w swoich ogłoszeniach..."
                        value={searchName}
                        onChange={(event) => {
                        setPage(0);
                        setSearchName(event.target.value);
                        }}
                        className="search-input-user"
                    />
                    </div>
                    <div className="types-dropdown-user">
                        <button
                            type="button"
                            className="types-dropdown-button-user"
                            onClick={() => setIsTypesOpen((current) => !current)}
                        >
                            <span>
                            Kategorie
                            {selectedTypes.length > 0 && ` (${selectedTypes.length})`}
                            </span>

                            <span className="dropdown-arrows-user">
                            ˅˅
                            </span>
                        </button>

                        {isTypesOpen && (
                            <div className="types-dropdown-menu-user">
                            {availableTypes.map((productType) => (
                                <label key={productType.id} className="types-dropdown-item-user">
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
        
            <h2>Twoje ogłoszenia</h2>
            <div className="profile-content-user">
                    {!loading && (
                    <ul className="products-list-user">
                    {products.map((product) => (
                    <li key={product.id} className="product-item-user">
                        {product.imageUrl && (
                            <img
                                src={`http://localhost:8080${product.imageUrl}`}
                                alt={product.name}
                                className="product-image-user"
                            />
                        )}

                        <div className="product-info-user">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p className="product-price-user">od {product.price} PLN</p>
                        </div>
                        <div className="details-buttons-wrap-user">
                        <Link
                            to={`/listing-page/${product.id}`}
                            className="details-button-user"
                        >
                            Zobacz szczegóły
                        </Link>

                        <Link
                            to={`/manage-reservations/${product.id}`}
                            className="details-button-user"
                        >
                            Zarządzaj rezerwacjami
                        </Link>
                        </div>
                        <div className="buttons-wrap-user">
                            <Link
                                to={`/update-listing/${product.id}`}
                                state={{ product }}
                                className="edit-listing-button-user"
                            >
                                <img
                                    src={edit} alt="Edytuj" 
                                    className="edit-image-user"
                                />
                            </Link>



                            <button
                                type="button"
                                className="delete-listing-button-user"
                                onClick={() => handleDeleteProduct(product.id)}
                            >
                                <img
                                    src={bin} alt="Usuń" 
                                    className="edit-image-user"
                                />
                            </button>
                        </div>
                    </li>
                    ))}
                    </ul>
                )}

                <aside className="right-list-user">
                    <Link to="/create-listing" className="create-listing-button-user">
                        Dodaj ogłoszenie
                    </Link>
                    <Link to="/my-reservations" className="create-listing-button-user">
                        Moje rezerwacje
                    </Link>
                    <Link to="/invoice-manager" className="create-listing-button-user">
                        Menedżer faktur
                    </Link>
                     <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        Wyloguj się
                    </button>
                </aside>
                
            </div>
            

        </section>

        <div className="pagination-user">
        <button
            onClick={goToPreviousPage}
            disabled={page === 0}
            className="pagination-button-user"
        >
            &lt;
        </button>

        <span className="pagination-info-user">
            Strona {page + 1} z {Math.max(totalPages, 1)}
        </span>

        <button
            onClick={goToNextPage}
            disabled={page >= totalPages - 1}
            className="pagination-button-user"
        >
            &gt;
        </button>
        </div>
    </main>
    );
}

export default User;