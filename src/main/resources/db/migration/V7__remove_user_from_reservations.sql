ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS user_reservation_id_fk;

ALTER TABLE reservations
    DROP COLUMN IF EXISTS user_id;