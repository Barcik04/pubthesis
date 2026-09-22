CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT,
    product_offer_id BIGINT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    CONSTRAINT user_reservation_id_fk
      FOREIGN KEY (user_id)
          REFERENCES users(id),

    CONSTRAINT offer_reservation_id_fk
      FOREIGN KEY (product_offer_id)
          REFERENCES product_offers(id),

    CONSTRAINT reservations_time_check
      CHECK (end_time > start_time)
);