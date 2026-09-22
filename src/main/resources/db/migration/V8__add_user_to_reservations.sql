ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS user_id BIGINT;

ALTER TABLE reservations
    ADD CONSTRAINT user_reservation_id_fk
        FOREIGN KEY (user_id)
            REFERENCES users(id);