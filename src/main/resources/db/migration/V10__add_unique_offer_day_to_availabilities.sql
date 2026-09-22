ALTER TABLE product_offer_availabilities
    ADD CONSTRAINT product_offer_availability_offer_day_unique
        UNIQUE (product_offer_id, day_of_week);