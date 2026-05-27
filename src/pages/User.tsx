import { useEffect, useState } from "react";
import { getMyProducts } from "../api/productsApi";
import { Link } from "react-router-dom";

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

  const pageSize = 20;

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyProducts(page, pageSize);

        setProducts(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [page]);

  function goToPreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function goToNextPage() {
    setPage((currentPage) => Math.min(currentPage + 1, totalPages - 1));
  }

  return (
    <main className="user-page">
        <h1 className="profile-title">Your Profile</h1>
        
        <section className="products-card">
            {error && <p className="error">{error}</p>}

            {loading && <p className="loading">Loading products...</p>}

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

                        <Link
                            to={`/update-listing/${product.id}`}
                            state={{ product }}
                            className="edit-listing-button"
                        >
                            Edit
                        </Link>
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