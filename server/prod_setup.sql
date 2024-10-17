DROP TABLE IF EXISTS request;
DROP TABLE IF EXISTS request_bin;

CREATE TABLE request_bin (
    id SERIAL PRIMARY KEY,
    bin_id VARCHAR(13) UNIQUE NOT NULL
);

CREATE TABLE request (
    id SERIAL PRIMARY KEY,
    requestbin_id INTEGER NOT NULL REFERENCES request_bin(id) ON DELETE CASCADE,
    mongo_key VARCHAR(50),
    method VARCHAR(10),
    path_name VARCHAR(100),
    request_id VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.request_bin (bin_id) VALUES ('XyZ123Abc4567');
INSERT INTO public.request_bin (bin_id) VALUES ('AbC789XyZ3210');
INSERT INTO public.request_bin (bin_id) VALUES ('PqR456LmN7890');
INSERT INTO public.request_bin (bin_id) VALUES ('GhI012JkL3456');
INSERT INTO public.request_bin (bin_id) VALUES ('MnO678VwX1234');
INSERT INTO public.request_bin (bin_id) VALUES ('2baeccf79ffa4');
INSERT INTO public.request_bin (bin_id) VALUES ('52e056ce6f944');

INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (1, '6657c1116b8780633f005bff', 'POST', '/bin/XyZ123Abc4567', '3c8fcfdc-880e-4636-913b-605a13ab1fdd', '2024-05-29 16:58:09.891779-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (1, '6657ca765c47bc367a88f4cb', 'POST', '/bin/XyZ123Abc4567', 'e3d2ee20-410a-4644-98b9-d4a02df6871f', '2024-05-29 17:38:15.044091-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (1, '6657ca795c47bc367a88f4cd', 'POST', '/bin/XyZ123Abc4567', 'da666285-8c40-4eed-8c76-7a4cab872f6f', '2024-05-29 17:38:17.242793-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (1, '6657cfc25c47bc367a88f4d4', 'GET', '/bin/XyZ123Abc4567', '9f7ee1ae-cc8b-4358-9c91-5d6cdcf25533', '2024-05-29 18:00:50.978968-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (1, '6657e37c5c47bc367a88f4da', 'DELETE', '/bin/XyZ123Abc4567', 'e4a1ad38-c223-41cd-be33-7082a1925afe', '2024-05-29 19:25:01.014447-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (6, '6658b1879e9afd41a1d639ee', 'GET', '/bin/2baeccf79ffa4', 'd816d813-e228-4639-9222-11fb03ce0f93', '2024-05-30 10:04:07.954462-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (6, '6658b1a09e9afd41a1d639f0', 'POST', '/bin/2baeccf79ffa4', '665eb927-d999-4fcb-80db-c005d7c72b5c', '2024-05-30 10:04:32.346111-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (6, '6658b1cd9e9afd41a1d639f6', 'DELETE', '/bin/2baeccf79ffa4', 'f6a1769d-516a-48be-a62c-7f5afa2ca66b', '2024-05-30 10:05:17.176577-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (6, '6658b52b9e9afd41a1d63a05', 'GET', '/bin/2baeccf79ffa4?name=james', 'c599bd01-3b8e-4a4e-a65b-1e8007ee6ea8', '2024-05-30 10:19:40.033716-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (7, '6658b5f69e9afd41a1d63a08', 'GET', '/bin/52e056ce6f944?name=sean', '6ceb0a2b-5d02-45c9-9ef6-6cfa56b83d43', '2024-05-30 10:23:02.203286-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (7, '6658b6079e9afd41a1d63a0a', 'POST', '/bin/52e056ce6f944', 'b1814593-8eb7-49cb-a994-ab87abd9049f', '2024-05-30 10:23:19.598282-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (7, '6658b6149e9afd41a1d63a0c', 'PUT', '/bin/52e056ce6f944', '399251d6-821d-4e7e-9cd1-61850110a1db', '2024-05-30 10:23:32.148587-07');
INSERT INTO public.request (requestbin_id, mongo_key, method, path_name, request_id, created_at) VALUES (7, '6658b6249e9afd41a1d63a0e', 'DELETE', '/bin/52e056ce6f944', 'f1ad6d38-5c64-4038-acfc-6985122ab056', '2024-05-30 10:23:48.606234-07');