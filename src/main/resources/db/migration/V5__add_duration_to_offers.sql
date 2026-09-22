ALTER TABLE product_offers
    ADD COLUMN duration_minutes INTEGER;

UPDATE product_offers
SET duration_minutes = 60
WHERE duration_minutes IS NULL;

ALTER TABLE product_offers
    ALTER COLUMN duration_minutes SET NOT NULL;

ALTER TABLE product_offers
    ADD CONSTRAINT product_offers_duration_minutes_positive_check
        CHECK (duration_minutes > 0);