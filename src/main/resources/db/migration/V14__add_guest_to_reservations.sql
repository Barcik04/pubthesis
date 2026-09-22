ALTER TABLE reservations
    ADD COLUMN guest_first_name VARCHAR(100),
    ADD COLUMN guest_last_name VARCHAR(100),
    ADD COLUMN email VARCHAR(100),
    ADD CONSTRAINT uq_reservations_email UNIQUE (email);