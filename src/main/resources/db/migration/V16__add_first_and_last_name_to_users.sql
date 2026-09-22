ALTER TABLE users
    ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT 'unknown',
    ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT 'unknown';

ALTER TABLE users
    ALTER COLUMN first_name DROP DEFAULT,
    ALTER COLUMN last_name DROP DEFAULT;

ALTER TABLE users
    ADD CONSTRAINT uq_users_first_last_name UNIQUE (first_name, last_name);