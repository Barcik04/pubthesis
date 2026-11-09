import { useState } from "react";
import type { FormEvent } from "react";
import { addProvider, removeProvider } from "../api/adminApi";

import "../styles/AdminPanelModal.css";

type Props = {
  onClose: () => void;
};

function AdminPanelModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "add" | "remove") {
    if (email.trim() === "") {
      setError("Podaj adres email");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (action === "add") {
        await addProvider(email);
        setSuccess(`Użytkownik ${email.trim()} został dodany jako usługodawca`);
      } else {
        await removeProvider(email);
        setSuccess(`Użytkownik ${email.trim()} został usunięty z usługodawców`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operacja nie powiodła się");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    handleAction("add");
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="admin-modal-close"
          onClick={onClose}
          aria-label="Zamknij"
        >
          ×
        </button>

        <h2 id="admin-modal-title">Panel admina</h2>
        <p className="admin-modal-subtitle">
          Nadaj lub odbierz uprawnienia usługodawcy
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email użytkownika"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="admin-modal-input"
            autoFocus
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="admin-modal-success">{success}</p>}

          <div className="admin-modal-buttons">
            <button
              type="button"
              className="admin-modal-remove"
              onClick={() => handleAction("remove")}
              disabled={loading}
            >
              Usuń
            </button>
            <button
              type="submit"
              className="admin-modal-add"
              disabled={loading}
            >
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanelModal;
