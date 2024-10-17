-- Drop tables for reset
DROP TABLE IF EXISTS request;
DROP TABLE IF EXISTS request_bin;

CREATE TABLE request_bin (
    id SERIAL PRIMARY KEY,
    bin_id VARCHAR(13) UNIQUE NOT NULL
);

CREATE TABLE request (
    id SERIAL PRIMARY KEY,
    requestbin_id INTEGER NOT NULL REFERENCES request_bin(id) ON DELETE CASCADE,
    mongo_key VARCHAR(50) NOT NULL UNIQUE,
    method VARCHAR(10),
    path_name VARCHAR(100),
    request_id VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Generated dummy data below
INSERT INTO request_bin (bin_id) VALUES
('XyZ123Abc4567'),
('AbC789XyZ3210'),
('PqR456LmN7890'),
('GhI012JkL3456'),
('MnO678VwX1234');

INSERT INTO request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES
(1, 'a1b2c3d4e5f6a7b8c9d0e1f2', 'GET', '/api/v1/resource', '4038b9f1-e949-4a48-9026-528fbdadc26f', '2024-05-26 10:30:00 UTC'),
(1, 'zxy98765432109876543210', 'GET', '/api/v2/resource', 'b20b5567-c7db-4182-b357-a55d2e1b292f', '2024-05-26 13:00:00 UTC'),
(1, 'mnopqrs1234567890abcdef', 'POST', '/api/v1/new', 'b662bb25-a803-4bd1-84f9-5a31064ddc47', '2024-05-26 16:00:00 UTC'),

(2, 'f6e5d4c3b2a1f6e5d4c3b2a1', 'POST', '/api/v1/resource', '8f816ee6-2328-40f7-9837-e0b46c48c865', '2024-05-26 11:00:00 UTC'),
(2, 'mnopqrstuvwxmnopqrstuvwx', 'POST', '/api/v2/resource', 'e1cdb8c4-2d1a-4938-bbc8-509e9dc4e638', '2024-05-26 13:30:00 UTC'),

(3, '1234567890abcdef12345678', 'PUT', '/api/v1/update', 'cdff3302-7b1b-4d36-8096-5892d8e2830d', '2024-05-26 11:30:00 UTC'),

(4, '0987654321fe0987654321fe', 'PATCH', '/api/v1/patch', 'a81a6188-c0f5-462f-bc31-2699e5ddb34e', '2024-05-26 12:30:00 UTC'),
(4, 'stuvwxmnopqrstuvwxmnopqr', 'PATCH', '/api/v2/patch', 'b39f6a57-4491-4642-b20d-f5fa3404246d', '2024-05-26 15:00:00 UTC'),
(4, 'yzabcdef1234567890abcdef', 'GET', '/api/v1/info', '14bbdf4a-5ef7-4f77-b36e-619d48fd4cb7', '2024-05-26 20:00:00 UTC');
