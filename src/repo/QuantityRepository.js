// JSON file-based "DB" — reads and writes to data/db.json
// Mirrors the same method names as before so nothing else needs to change.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "../../data/db.json");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(records) {
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2));
}

// ─── Repository ───────────────────────────────────────────────────────────────

const QuantityRepository = {

  // mirrors: repo.save(entity)
  save: ({ inputValue, unit, measurementType, resultValue, resultUnit, operation, isError, errorMessage }) => {
    const records = readAll();

    const newRecord = {
      id: crypto.randomUUID(),
      input_value: inputValue,
      unit: unit,
      measurement_type: measurementType,
      result_value: resultValue,
      result_unit: resultUnit,
      operation: operation,
      is_error: isError,
      error_message: errorMessage || null,
      created_on: new Date().toISOString(),
    };

    records.push(newRecord);
    writeAll(records);
    return newRecord;
  },

  // mirrors: repo.findAll()
  findAll: () => {
    return readAll().sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
  },

  findByAllOperations: () => {
    return readAll()
      .filter((r) => r.operation === "ADD" || r.operation === "SUB" || r.operation === "DIV" || r.operation === "MUL")
      .sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
  },
  // mirrors: repo.findByOperation(operation)
  findByOperation: (operation) => {
    return readAll()
      .filter((r) => r.operation === operation.toUpperCase())
      .sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
  },

  // mirrors: repo.findByErrorTrue()
  findByErrorTrue: () => {
    return readAll()
      .filter((r) => r.is_error === true)
      .sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
  },

  // mirrors: repo.findById(id)
  findById: (id) => {
    return readAll().find((r) => r.id === id) || null;
  },

  // mirrors Java TODO: "update and delete are ops on the DB directly" can add a flag as a delted or not check soft del
  deleteById: (id) => {
    const records = readAll().filter((r) => r.id !== id);
    writeAll(records);
  },
};

module.exports = QuantityRepository;