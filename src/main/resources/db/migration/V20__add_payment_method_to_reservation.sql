ALTER TABLE reservations
    ADD COLUMN payment_method VARCHAR(20);

UPDATE reservations
SET payment_method = 'CASH';

ALTER TABLE reservations
    ALTER COLUMN payment_method SET NOT NULL;

ALTER TABLE reservations
    ADD CONSTRAINT reservations_payment_method_check
        CHECK (payment_method IN ('CASH', 'CARD'));