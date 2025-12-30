CREATE EXTENSION IF NOT EXISTS "pgcrypto";



CREATE TYPE gender AS ENUM ('male','female','other');
CREATE TYPE role_key AS ENUM ('admin','author','researcher');
CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INT CHECK (age > 0) NOT NULL,
        gender gender,
        role role_key,
        password TEXT NOT NULL,
        permissions text[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE TABLE IF NOT EXISTS SESSIONS (
	ID UUID DEFAULT GEN_RANDOM_UUID(),
	USER_ID uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_agent text NOT NULL,
	IS_VALID BOOLEAN DEFAULT TRUE,
	CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id,user_id)
);
