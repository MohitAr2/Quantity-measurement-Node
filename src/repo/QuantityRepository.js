// Mirrors Java QuantityRepository (JpaRepository).
// Uses pg (PostgreSQL) — placeholders are $1, $2, ... not ?

const { pool } = require("../db");

const QuantityRepository = {
    // mirrors: repo.save(entity)
    // pg returns the inserted row via RETURNING *
    save: async ({ inputValue, unit, measurementType, resultValue, resultUnit, operation, isError, errorMessage }) => {
        const { rows } = await pool.query(
            `INSERT INTO quantity_measurements
         (input_value, unit, measurement_type, result_value, result_unit, operation, is_error, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [inputValue, unit, measurementType, resultValue, resultUnit, operation, isError, errorMessage || null]
        );
        return rows[0];
    },

    // mirrors: repo.findAll()
    findAll: async () => {
        const { rows } = await pool.query(
            "SELECT * FROM quantity_measurements ORDER BY created_on DESC"
        );
        return rows;
    },

    // mirrors: repo.findByOperation(operation)
    findByOperation: async (operation) => {
        const { rows } = await pool.query(
            "SELECT * FROM quantity_measurements WHERE operation = $1 ORDER BY created_on DESC",
            [operation.toUpperCase()]
        );
        return rows;
    },

    // mirrors: repo.findByErrorTrue()
    findByErrorTrue: async () => {
        const { rows } = await pool.query(
            "SELECT * FROM quantity_measurements WHERE is_error = TRUE ORDER BY created_on DESC"
        );
        return rows;
    },

    // mirrors: repo.findById(id)
    findById: async (id) => {
        const { rows } = await pool.query(
            "SELECT * FROM quantity_measurements WHERE id = $1",
            [id]
        );
        return rows[0] || null;
    },

    // mirrors Java TODO: "update and delete are ops on the DB directly"
    deleteById: async (id) => {
        await pool.query(
            "DELETE FROM quantity_measurements WHERE id = $1",
            [id]
        );
    },
};

module.exports = QuantityRepository;