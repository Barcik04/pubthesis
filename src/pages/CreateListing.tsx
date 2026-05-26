import { useState } from "react";
import { createProduct } from "../api/productsApi";
import "../styles/CreateListing.css";

function CreateListing() {
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [types, setTypes] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");


      const data = {
        name: name,
        description: description,
        price: Number(price),
        types: types.split(",").map((type) => type.trim()),
      };

      await createProduct(data, image);

      setName("");
      setDescription("");
      setPrice("");
      setTypes("");
      setImage(null);
    } catch (err) {
      setError("Failed to create listing");
    }
  }

  return (
    <main className="page">
      <h1>Create Listing</h1>

      <section className="create-card">
        <div className="create-header">
          <p>Add a new product or service to your offer.</p>
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

          <label>
            Image
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

          <button type="submit">Create listing</button>
        </form>
      </section>
    </main>
  );
}

export default CreateListing;