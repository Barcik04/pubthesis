import { useEffect, useState } from "react";
import {
  getInvoices,  
  markInvoiceAsIssued,
  type InvoiceResult,
} from "../api/productsApi";

import "../styles/InvoiceManager.css";

type IssuedFilter = "ALL" | "ISSUED" | "NOT_ISSUED";

function InvoiceManager() {
  const [invoices, setInvoices] = useState<InvoiceResult[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [emailFilter, setEmailFilter] = useState("");
  const [issuedFilter, setIssuedFilter] =
    useState<IssuedFilter>("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issuingInvoiceId, setIssuingInvoiceId] = useState<number | null>(null);

  const pageSize = 20;

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        setError("");

        const issued =
          issuedFilter === "ALL"
            ? undefined
            : issuedFilter === "ISSUED";

        const data = await getInvoices(
          {
            email: emailFilter,
            issued,
          },
          page,
          pageSize
        );

        setInvoices(data.content);
        setTotalPages(data.totalPages);
      } catch {
        setError("Nie udało się wczytać wniosków o fakturę");
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [page, emailFilter, issuedFilter]);


  function handleIssuedFilterChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    setIssuedFilter(event.target.value as IssuedFilter);
    setPage(0);
  }

  function handleClearFilters() {
    setEmailFilter("");
    setIssuedFilter("ALL");
    setPage(0);
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "Niewystawiona";
    }

    return new Date(date).toLocaleString("pl-PL");
  }

  async function handleMarkAsIssued(invoiceId: number) {
    try {
      setIssuingInvoiceId(invoiceId);
      setError("");

      const updatedInvoice = await markInvoiceAsIssued(invoiceId);

      setInvoices((currentInvoices) =>
        currentInvoices.map((invoice) =>
          invoice.id === invoiceId ? updatedInvoice : invoice
        )
      );
    } catch {
      setError("Nie udało się zmienić statusu faktury");
    } finally {
      setIssuingInvoiceId(null);
    }
  }

  return (
    <main className="invoice-manager-page">
      <section className="invoice-manager-card">
        <h1>Wnioski o fakturę</h1>

        <div className="invoice-manager-filters">
          <input
            type="email"
            value={emailFilter}
            onChange={(event) => {
              setEmailFilter(event.target.value);
              setPage(0);
            }}
            placeholder="Szukaj po emailu"
            className="invoice-manager-input"
          />

          <select
            value={issuedFilter}
            onChange={handleIssuedFilterChange}
            className="invoice-manager-select"
          >
            <option value="ALL">Wszystkie wnioski</option>
            <option value="ISSUED">Wystawione</option>
            <option value="NOT_ISSUED">Niewystawione</option>
          </select>

          <button
            type="button"
            className="invoice-manager-clear-button"
            onClick={handleClearFilters}
          >
            Wyczyść
          </button>
        </div>

        {loading && (
          <p className="invoice-manager-loading">
            Wczytywanie wniosków o fakturę...
          </p>
        )}

        {error && (
          <p className="invoice-manager-error">{error}</p>
        )}

        {!loading && !error && invoices.length === 0 && (
          <p className="invoice-manager-empty">
            Nie znaleziono wniosków o fakturę.
          </p>
        )}

        {!loading && !error && invoices.length > 0 && (
          <ul className="invoice-manager-list">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="invoice-manager-item"
              >
                <div className="invoice-manager-main-info">
                  <div className="invoice-manager-heading">
                  <p className="buyers-name-wrap">
                    <strong>nazwa:</strong> <h2>{invoice.buyerName}</h2>
                  </p>

                  <span
                    className={
                      invoice.status === "ISSUED"
                        ? "invoice-manager-status invoice-manager-status-issued"
                        : "invoice-manager-status invoice-manager-status-pending"
                    }
                  >
                    {invoice.status === "ISSUED" ? "Wystawiona" : "Niewystawiona"}
                  </span>
                  </div>

                  <p>
                    <strong>Email:</strong> {invoice.email}
                  </p>

                  {invoice.buyerNip && (
                    <p>
                      <strong>NIP:</strong> {invoice.buyerNip}
                    </p>
                  )}

                  <p>
                    <strong>Adres:</strong>{" "}
                    {invoice.street}, {invoice.postalCode}{" "}
                    {invoice.city}, {invoice.country}
                  </p>
                </div>
                <button
                    type="button"
                    className="invoice-manager-issue-button"
                    onClick={() => handleMarkAsIssued(invoice.id)}
                    disabled={issuingInvoiceId === invoice.id}
                  >
                    {issuingInvoiceId === invoice.id
                      ? "Aktualizowanie..."
                      : invoice.status === "ISSUED"
                        ? "Oznacz jako niewystawioną"
                        : "Oznacz jako wystawioną"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="invoice-manager-pagination">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="invoice-manager-pagination-button"
            >
              Poprzednia
            </button>

            <span className="invoice-manager-pagination-info">
              Strona {page + 1} z {totalPages}
            </span>

            <button
              type="button"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="invoice-manager-pagination-button"
            >
              Następna
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default InvoiceManager;