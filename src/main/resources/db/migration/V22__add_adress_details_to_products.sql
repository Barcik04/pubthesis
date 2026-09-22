ALTER TABLE products
    ADD COLUMN country VARCHAR(100),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN street VARCHAR(150),
    ADD COLUMN postal_code VARCHAR(20),
    ADD COLUMN building_number VARCHAR(20),
    ADD COLUMN longitude NUMERIC(10, 7),
    ADD COLUMN latitude NUMERIC(9, 7);