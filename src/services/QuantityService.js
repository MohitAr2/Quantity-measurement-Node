const QuantityRepository = require("../repo/QuantityRepository");
const OperationType = require("../models/OperationType");
const { getUnit } = require("../models/UnitType");

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapToResponse(row) {
  return {
    id:           row.id,
    inputValue:   row.input_value,
    inputUnit:    row.unit,
    resultValue:  row.result_value,
    resultUnit:   row.result_unit,
    operation:    row.operation,
    isError:      row.is_error,
    errorMessage: row.error_message || undefined,
    createdOn:    row.created_on,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(inputKey, targetKey) {
  const input  = getUnit(inputKey);
  const target = getUnit(targetKey);
  if (input.measurementType !== target.measurementType) {
    throw new Error(
      `Incompatible unit types: ${inputKey} (${input.measurementType}) vs ${targetKey} (${target.measurementType})`
    );
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────
const QuantityService = {

  // POST /convert
  convert: (request) => {
    validate(request.from.unit, request.to.unit);

    const fromUnit  = getUnit(request.from.unit);
    const toUnit    = getUnit(request.to.unit);
    const baseValue = fromUnit.toBase(request.from.value);
    const result    = toUnit.fromBase(baseValue);

    const saved = QuantityRepository.save({
      inputValue:      request.from.value,
      unit:            request.from.unit.toUpperCase(),
      measurementType: fromUnit.measurementType,
      resultValue:     result,
      resultUnit:      request.to.unit.toUpperCase(),
      operation:       OperationType.CONVERT,
      isError:         false,
    });

    return mapToResponse(saved);
  },

  // POST /operation/add|sub|mul|div
  operation: (q1, q2, type) => {
    const u1 = getUnit(q1.unit);
    const u2 = getUnit(q2.unit);
    const b1 = u1.toBase(q1.value);
    const b2 = u2.toBase(q2.value);
    const result = 0;
    switch (type) {
      case OperationType.ADD:  result=b1 + b2;
      case OperationType.SUB:  result=b1 - b2;
      case OperationType.MUL:  result=b1 * b2;
      case OperationType.DIV:
        if (b2 === 0) throw new Error("Division by zero");
        result = b1 / b2;
      default:
        throw new Error(`Unknown operation: ${type}`);
    }
    const saved = QuantityRepository.save({
      inputValue:      [request.from.value,request.to.value],
      unit:            request.from.unit.toUpperCase(),
      measurementType: fromUnit.measurementType,
      resultValue:     result,
      resultUnit:      request.to.unit.toUpperCase(),
      operation:       OperationType.CONVERT,
      isError:         false,// if thowrn handle that in error handler ? 
    });
    return mapToResponse(saved);
  },

  getAll:         () => QuantityRepository.findAll().map(mapToResponse),
  getByOperation: (op) => QuantityRepository.findByOperation(op).map(mapToResponse),
  getErrors:      () => QuantityRepository.findByErrorTrue().map(mapToResponse),
  deleteById:     (id) => {
    // temp to just print what was deleted 
    const delted_value = {
      inputValue:      [request.from.value,request.to.value],
      unit:            request.from.unit.toUpperCase(),
      measurementType: fromUnit.measurementType,
      resultValue:     "deleted",
      resultUnit:      "String",
      operation:       null,
      isError:         false,//means found val err here handle ? repo layer handles
    };
    const mapped_response = mapToResponse(delted_value);
    QuantityRepository.deleteById(id);
    return mapped_response;
  }
};

module.exports = QuantityService;