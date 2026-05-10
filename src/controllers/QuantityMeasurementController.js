const express = require("express");
const router = express.Router();
const QuantityService = require("../services/QuantityService");
const OperationType = require("../models/OperationType");

const VALID_OPS = Object.values(OperationType);

// ─── GET /history — all records
router.get("/history", async (req, res, next) => {
    try {
        const results = await QuantityService.getAll();
        res.json(results);
    } catch (err) { next(err); }
});

// ─── GET /convert — all CONVERT history (mirrors getConverted) ───────────────
router.get("/convert", async (req, res, next) => {
    try {
        const results = await QuantityService.getByOperation(OperationType.CONVERT);
        res.json(results);
    } catch (err) { next(err); }
});

// ─── GET /compare — all CONVERT history (mirrors getCompare) ─────────────────
router.get("/compare", async (req, res, next) => {
    try {
        const results = await QuantityService.getByOperation(OperationType.CONVERT);
        res.json(results);
    } catch (err) { next(err); }
});

// ─── GET /operations?type=ADD — filter by op (mirrors getOperations) ─────────
router.get("/operations", async (req, res, next) => {
    try {
        const { type } = req.query;
        if (!type) {
            return res.status(400).json({ error: true, message: "Query param 'type' is required. Valid: " + VALID_OPS.join(", ") });
        }
        const results = await QuantityService.getByOperation(type.toUpperCase());
        res.json(results);
    } catch (err) { next(err); }
});

// ─── GET /errors — all error records (mirrors getErrors) ─────────────────────
router.get("/errors", async (req, res, next) => {
    try {
        const results = await QuantityService.getErrors();
        res.json(results);
    } catch (err) { next(err); }
});

// ─── POST /convert — convert units (mirrors convertValues) ───────────────────
// Body: { from: { value, unit }, to: { value, unit } }
router.post("/convert", async (req, res, next) => {
    try {
        const result = await QuantityService.convert(req.body);
        res.status(201).json(result);
    } catch (err) { next(err); }
});

// ─── POST /operation?type=ADD — generic op (mirrors operation) ────────────────
router.post("/operation", (req, res, next) => {
    try {
        const { type } = req.query;
        if (!type || !VALID_OPS.includes(type.toUpperCase())) {
            return res.status(400).json({ error: true, message: "Query param 'type' must be one of: " + VALID_OPS.join(", ") });
        }
        const { from, to } = req.body;
        const result = QuantityService.operation(from, to, type.toUpperCase());
        res.json({ result });
    } catch (err) { next(err); }
});

// ─── POST /operation/add (mirrors operationAdd) ───────────────────────────────
router.post("/operation/add", (req, res, next) => {
    try {
        const { from, to } = req.body;
        res.json({ result: QuantityService.operation(from, to, OperationType.ADD) });
    } catch (err) { next(err); }
});

// ─── POST /operation/sub (mirrors operationSub) ───────────────────────────────
router.post("/operation/sub", (req, res, next) => {
    try {
        const { from, to } = req.body;
        res.json({ result: QuantityService.operation(from, to, OperationType.SUB) });
    } catch (err) { next(err); }
});

// ─── POST /operation/mul (mirrors operationMul) ───────────────────────────────
router.post("/operation/mul", (req, res, next) => {
    try {
        const { from, to } = req.body;
        res.json({ result: QuantityService.operation(from, to, OperationType.MUL) });
    } catch (err) { next(err); }
});

// ─── POST /operation/div (mirrors operationDiv) ───────────────────────────────
router.post("/operation/div", (req, res, next) => {
    try {
        const { from, to } = req.body;
        res.json({ result: QuantityService.operation(from, to, OperationType.DIV) });
    } catch (err) { next(err); }
});

// ─── DELETE /history/:id (mirrors Java TODO for DB ops) ──────────────────────
router.delete("/history/:id", async (req, res, next) => {
    try {
        await QuantityService.deleteById(req.params.id);
        res.status(204).send();
    } catch (err) { next(err); }
});

module.exports = router;