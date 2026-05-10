// src/db.js
// PostgreSQL connection pool (pg) — for pgAdmin
// Auto-creates the table on first startup if it doesn't exist.

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "quantity-measurement",
});

// Auto-create table on startup — no manual SQL needed
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quantity_measurements (
      id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      input_value      FLOAT        NOT NULL,
      unit             VARCHAR(50)  NOT NULL,
      measurement_type VARCHAR(50)  NOT NULL,
      result_value     FLOAT        NOT NULL,
      result_unit      VARCHAR(50)  NOT NULL,
      operation        VARCHAR(20)  NOT NULL,
      is_error         BOOLEAN      NOT NULL DEFAULT FALSE,
      error_message    TEXT,
      created_on       TIMESTAMP    NOT NULL DEFAULT NOW()
    );
  `);
  console.log("DB ready — table quantity_measurements OK");
}

module.exports = { pool, initDB };