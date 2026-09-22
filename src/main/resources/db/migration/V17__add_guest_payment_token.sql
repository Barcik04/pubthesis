ALTER TABLE reservations
    ADD COLUMN guest_payment_token VARCHAR(36);

ALTER TABLE reservations
    ADD CONSTRAINT uk_reservations_guest_payment_token
        UNIQUE (guest_payment_token);