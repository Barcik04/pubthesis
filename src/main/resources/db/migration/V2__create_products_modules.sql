CREATE TABLE product_types (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id BIGINT,
    description VARCHAR(2048),
    price DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT user_product_id_fk
      FOREIGN KEY (user_id)
          REFERENCES users(id)
);

CREATE TABLE product_type_relation (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_type_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT product_type_relation_product_id_fk
       FOREIGN KEY (product_id)
           REFERENCES products(id)
           ON DELETE CASCADE,

    CONSTRAINT product_type_relation_product_type_id_fk
       FOREIGN KEY (product_type_id)
           REFERENCES product_types(id)
           ON DELETE CASCADE,

    CONSTRAINT product_type_relation_unique
       UNIQUE (product_id, product_type_id)
);