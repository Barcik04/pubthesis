import { useEffect, useState } from "react";
import { getMyProducts, deleteProduct } from "../api/productsApi";
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

function User() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");

  const pageSize = 20;

    useEffect(() => {
    async function loadProducts() {
        try {
        setLoading(true);
        setError("");

        const data = await getMyProducts(page, pageSize, searchName);

        setProducts(data.content);
        setTotalPages(data.totalPages);
        } catch (err) {
        setError("Failed to load products");
        } finally {
        setLoading(false);
        }
    }

    loadProducts();
    }, [page, searchName]);

    function goToPreviousPage() {
        setPage((currentPage) => Math.max(currentPage - 1, 0));
    }

    function goToNextPage() {
        setPage((currentPage) => Math.min(currentPage + 1, totalPages - 1));
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