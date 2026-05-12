const QuantityRepository = require("../repo/QuantityRepository");
const OperationType = require("../models/OperationType");
const { getUnit } = require("../models/UnitType");

function mapToResponse(row) {
  return {
    id: row.id,
    inputValue: row.input_value,
    inputUnit: row.unit,
    resultValue: row.result_value,
    resultUnit: row.result_unit,
    operation: row.operation,
    isError: row.is_error,
    errorMessage: row.error_message || undefined,
    createdOn: row.created_on,
  };
}

function validate(inputKey, targetKey) {
  const input = getUnit(inputKey);
  const target = getUnit(targetKey);
  if (input.measurementType !== target.measurementType) {
    throw new Error(
      `Incompatible unit types: ${inputKey} (${input.measurementType}) vs ${targetKey} (${target.measurementType})`
    );
  }
}

const QuantityService = {

  convert: (request) => {
    validate(request.from.unit, request.to.unit);
    const fromUnit = getUnit(request.from.unit);
    const toUnit = getUnit(request.to.unit);
    const baseValue = fromUnit.toBase(request.from.value);
    const result = toUnit.fromBase(baseValue);

    const saved = QuantityRepository.save({
      inputValue: request.from.value,
      unit: request.from.unit.toUpperCase(),
      measurementType: fromUnit.measurementType,
      resultValue: result,
      resultUnit: request.to.unit.toUpperCase(),
      operation: OperationType.CONVERT,
      isError: false,
    });
    return mapToResponse(saved);
  },

  // BUG FIX 1: added break to every case so they don't fall through
  // BUG FIX 2: use q1/q2 (the actual params) not request/fromUnit (don't exist here)
  operation: (q1, q2, type) => {
    const u1 = getUnit(q1.unit);
    const u2 = getUnit(q2.unit);
    const b1 = u1.toBase(q1.value);
    const b2 = u2.toBase(q2.value);

    let result;
    switch (type) {
      case OperationType.ADD:
        result = b1 + b2;
        break;
      case OperationType.SUB:
        result = b1 - b2;
        break;
      case OperationType.MUL:
        result = b1 * b2;
        break;
      case OperationType.DIV:
        if (b2 === 0) throw new Error("Division by zero");
        result = b1 / b2;
        break;
      default:
        throw new Error(`Unknown operation: ${type}`);
    }

    const saved = QuantityRepository.save({
      inputValue: [q1.value, q2.value],
      unit: q1.unit.toUpperCase(),
      measurementType: u1.measurementType,
      resultValue: result,
      resultUnit: q1.unit.toUpperCase(), // result is in base unit of q1
      operation: type,
      isError: false,
    });
    return mapToResponse(saved);
  },

  getAll: () => QuantityRepository.findAll().map(mapToResponse),
  getByOperation: (op) => QuantityRepository.findByOperation(op).map(mapToResponse),
  getErrors: () => QuantityRepository.findByErrorTrue().map(mapToResponse),

  // BUG FIX 3: deleteById only gets id — fetch the record first, then delete it
  deleteById: (id) => {
    const record = QuantityRepository.findById(id);
    if (!record) throw new Error(`Record not found: ${id}`);
    QuantityRepository.deleteById(id);
    return mapToResponse(record); // returns what was deleted
  },
};

module.exports = QuantityService;