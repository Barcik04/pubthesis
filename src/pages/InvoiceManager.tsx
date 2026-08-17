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
        setError("Failed to load invoice requests");
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
      return "Not issued";
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
      setError("Failed to mark invoice as issued");
    } finally {
      setIssuingInvoiceId(null);
    }
  }

  return (
    <main className="invoice-manager-page">
      <section className="invoice-manager-card">
        <h1>Invoice requests</h1>

        <div className="invoice-manager-filters">
          <input
            type="email"
            value={emailFilter}
            onChange={(event) => {
              setEmailFilter(event.target.value);
              setPage(0);
            }}
            placeholder="Search by email"
            className="invoice-manager-input"
          />

          <select
            value={issuedFilter}
            onChange={handleIssuedFilterChange}
            className="invoice-manager-select"
          >
            <option value="ALL">All requests</option>
            <option value="ISSUED">Issued</option>
            <option value="NOT_ISSUED">Not issued</option>
          </select>

          <button
            type="button"
            className="invoice-manager-clear-button"
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </div>

        {loading && (
          <p className="invoice-manager-loading">
            Loading invoice requests...
          </p>
        )}

        {error && (
          <p className="invoice-manager-error">{error}</p>
        )}

        {!loading && !error && invoices.length === 0 && (
          <p className="invoice-manager-empty">
            No invoice requests found.
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
                    <strong>name:</strong> <h2>{invoice.buyerName}</h2>
                  </p>

                  <span
                    className={
                      invoice.status === "ISSUED"
                        ? "invoice-manager-status invoice-manager-status-issued"
                        : "invoice-manager-status invoice-manager-status-pending"
                    }
                  >
                    {invoice.status === "ISSUED" ? "Issued" : "Not issued"}
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
                    <strong>Address:</strong>{" "}
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
                      ? "Updating..."
                      : invoice.status === "ISSUED"
                        ? "Mark as not issued"
                        : "Mark as issued"}
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
              Previous
            </button>

            <span className="invoice-manager-pagination-info">
              Page {page + 1} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="invoice-manager-pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default InvoiceManager;