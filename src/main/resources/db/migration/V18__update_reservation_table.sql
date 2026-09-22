ALTER TABLE reservations
    DROP COLUMN paid;

ALTER TABLE reservations
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    ADD COLUMN payment_expires_at TIMESTAMPTZ;

ALTER TABLE reservations
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE reservations
    ADD CONSTRAINT reservations_status_check
        CHECK (status IN (
                          'PENDING_PAYMENT',
                          'CONFIRMED',
                          'CANCELLED'
            ));