import { useEffect, useState } from "react";
import { getMyProducts, deleteProduct, getProductTypes } from "../api/productsApi";
import { Link } from "react-router-dom";

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

        const data = await getMyProducts(page, pageSize, searchName, selectedTypes);
        
        setProducts(data.content);
        setTotalPages(data.totalPages);
        } catch (err) {
        setError("Failed to load products");
        } finally {
        setLoading(false);
        }
    }

    loadProducts();
    }, [page, searchName, selectedTypes]);

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

    async function handleDeleteProduct(productId: number) {
        const confirmed = window.confirm("Are you sure you want to delete this listing?");

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
            setError("Failed to delete product");
        }
    }

  return (
    <main className="user-page">
        <h1 className="profile-title">Your Profile</h1>
        
        <section className="products-card">
            {error && <p className="error">{error}</p>}

            {loading && <p className="loading">Loading products...</p>}
            <div className="filters-wrap">
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Search your listings..."
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

                            <span className="dropdown-arrows">
                            ˅˅
                            </span>
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
            </div>
        
            <h2>Your listings</h2>
            <div className="profile-content">
                    {!loading && (
                    <ul className="products-list">
                    {products.map((product) => (
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
                        <div className="buttons-wrap">
                            <Link
                                to={`/update-listing/${product.id}`}
                                state={{ product }}
                                className="edit-listing-button"
                            >
                                <img
                                    src={edit} alt="Application logo" 
                                    className="edit-image"
                                />
                            </Link>


                            <button
                                type="button"
                                className="delete-listing-button"
                                onClick={() => handleDeleteProduct(product.id)}
                            >
                                <img
                                    src={bin} alt="Application logo" 
                                    className="edit-image"
                                />
                            </button>
                        </div>
                    </li>
                    ))}
                    </ul>
                )}

                <aside className="right-list">
                    <Link to="/create-listing" className="create-listing-button">
                        Create listing
                    </Link>
                </aside>
                
            </div>
            

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

export default User;