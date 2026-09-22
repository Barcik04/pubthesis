ALTER TABLE reservations
    ADD COLUMN stripe_payment_intent_id VARCHAR(255);

ALTER TABLE reservations
    ADD CONSTRAINT reservations_stripe_payment_intent_id_unique
        UNIQUE (stripe_payment_intent_id);