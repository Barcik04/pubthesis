CREATE TABLE invoice_requests
(
    id             BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT       NOT NULL,
    buyer_name     VARCHAR(200) NOT NULL,
    buyer_nip      VARCHAR(10),
    street         VARCHAR(200) NOT NULL,
    postal_code    VARCHAR(20)  NOT NULL,
    city           VARCHAR(100) NOT NULL,
    country        VARCHAR(100) NOT NULL,
    email          VARCHAR(254) NOT NULL,
    status         VARCHAR(20)  NOT NULL,
    requested_at   TIMESTAMPTZ  NOT NULL,
    issued_at      TIMESTAMPTZ,

    CONSTRAINT invoice_reservation_id_fk
        FOREIGN KEY (reservation_id)
            REFERENCES reservations (id)
            ON DELETE CASCADE,

    CONSTRAINT uq_invoice_requests_reservation_id
        UNIQUE (reservation_id),

    CONSTRAINT chk_invoice_requests_status
        CHECK (status IN ('REQUESTED', 'ISSUED'))
);