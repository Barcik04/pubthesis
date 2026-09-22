CREATE TABLE product_offer_availabilities (
    id BIGSERIAL PRIMARY KEY,

    product_offer_id BIGINT NOT NULL,

    day_of_week VARCHAR(20) NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    CONSTRAINT availability_product_offer_id_fk
        FOREIGN KEY (product_offer_id)
            REFERENCES product_offers(id)
            ON DELETE CASCADE,

    CONSTRAINT product_offer_availability_time_check
        CHECK (end_time > start_time),

    CONSTRAINT product_offer_availability_day_check
        CHECK (day_of_week IN (
             'MONDAY',
             'TUESDAY',
             'WEDNESDAY',
             'THURSDAY',
             'FRIDAY',
             'SATURDAY',
             'SUNDAY'
        ))
);