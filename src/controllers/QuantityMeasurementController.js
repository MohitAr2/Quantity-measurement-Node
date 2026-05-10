const express = require("express");
const router = express.Router();
const QuantityService = require("../services/QuantityService");
const OperationType = require("../models/OperationType");

const VALID_OPS = Object.values(OperationType);

// ─── GET ──────────────────────────────────────────────────────────────────────

router.get("/history", (req, res, next) => {
  try { res.json(QuantityService.getAll()); }
  catch (err) { next(err); }
});

router.get("/convert", (req, res, next) => {
  try { res.json(QuantityService.getByOperation(OperationType.CONVERT)); }
  catch (err) { next(err); }
});

router.get("/compare", (req, res, next) => {
  try { res.json(QuantityService.getByOperation(OperationType.CONVERT)); }
  catch (err) { next(err); }
});

router.get("/operations", (req, res, next) => {
  try {
    const { type } = req.query;
    if (!type){
      // store in result though ?
      const saved = QuantityRepository.save({
      inputValue:      [request.from.value,request.to.value],
      unit:            request.from.unit.toUpperCase(),
      measurementType: fromUnit.measurementType,
      resultValue:     result,
      resultUnit:      request.to.unit.toUpperCase(),
      operation:       OperationType.CONVERT,
      isError:         true,
    });
       return res.status(400).json({ error: true, message: "Query param 'type' required. Options: " + VALID_OPS.join(", ") });
    }
    res.json(QuantityService.getByOperation(type.toUpperCase()));
  } catch (err) { next(err); }
});

router.get("/errors", (req, res, next) => {
  try { res.json(QuantityService.getErrors()); }
  catch (err) { next(err); }
});

// ─── POST ─────────────────────────────────────────────────────────────────────

router.post("/convert", (req, res, next) => {
  try { res.status(201).json(QuantityService.convert(req.body)); }
  catch (err) { next(err); }
});

router.post("/operation", (req, res, next) => {
  try {
    const { type } = req.query;
    if (!type || !VALID_OPS.includes(type.toUpperCase())){
      const saved = QuantityRepository.save({
      inputValue:      [request.from.value,request.to.value],
      unit:            request.from.unit.toUpperCase(),
      measurementType: fromUnit.measurementType,
      resultValue:     result,
      resultUnit:      request.to.unit.toUpperCase(),
      operation:       OperationType.CONVERT,
      isError:         true,
    });
      return res.status(400).json({ error: true, message: "Query param 'type' must be one of: " + VALID_OPS.join(", ") });
    }
    const { from, to } = req.body;
    res.json({ result: QuantityService.operation(from, to, type.toUpperCase()) });
  } catch (err) { next(err); }
});

router.post("/operation/add", (req, res, next) => {
  try { res.json({ result: QuantityService.operation(req.body.from, req.body.to, OperationType.ADD) }); }
  catch (err) { next(err); }
});

router.post("/operation/sub", (req, res, next) => {
  try { res.json({ result: QuantityService.operation(req.body.from, req.body.to, OperationType.SUB) }); }
  catch (err) { next(err); }
});

router.post("/operation/mul", (req, res, next) => {
  try { res.json({ result: QuantityService.operation(req.body.from, req.body.to, OperationType.MUL) }); }
  catch (err) { next(err); }
});

router.post("/operation/div", (req, res, next) => {
  try { res.json({ result: QuantityService.operation(req.body.from, req.body.to, OperationType.DIV) }); }
  catch (err) { next(err); }
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

router.delete("/history/:id", (req, res, next) => {
  try { QuantityService.deleteById(req.params.id); res.status(204).send(); }
  catch (err) { next(err); }
});

module.exports = router;