CREATE TABLE product_offers (
                                id BIGSERIAL PRIMARY KEY,

                                name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
                                description VARCHAR(100),
                                price DOUBLE PRECISION CHECK (price >= 0),

                                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                product_id BIGINT,

                                CONSTRAINT product_offer_product_id_fk
                                    FOREIGN KEY (product_id)
                                        REFERENCES products(id)
);