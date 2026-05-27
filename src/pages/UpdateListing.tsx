import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updateProduct } from "../api/productsApi";
import "../styles/CreateListing.css";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  types: string[];
  imageUrl?: string | null;
};

function UpdateListing() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product as Product | undefined;

  const [error, setError] = useState("");

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [types, setTypes] = useState(product?.types?.join(", ") ?? "");
  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId) {
      setError("Missing product id");
      return;
    }

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

      await updateProduct(Number(productId), data, image);

      navigate("/user");
    } catch (err) {
      setError("Failed to update listing");
    }
  }

  if (!product) {
    return (
      <main className="page">
        <section className="create-card">
          <h1>Listing data not found</h1>
          <p>Go back to your profile and choose listing again.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Update Listing</h1>

      <section className="create-card">
        <div className="create-header">
          <p>Edit your product or service offer.</p>
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

          {product.imageUrl && (
            <div>
              <p>Current image:</p>
              <img
                src={`http://localhost:8080${product.imageUrl}`}
                alt={product.name}
                style={{
                  width: "180px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              />
            </div>
          )}

          <label>
            New image
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

          <button type="submit">Update listing</button>
        </form>
      </section>
    </main>
  );
}

export default UpdateListing;