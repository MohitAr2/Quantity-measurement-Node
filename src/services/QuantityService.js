// src/services/QuantityService.js
// Direct port of Java QuantityService.

const QuantityRepository = require("../repo/QuantityRepository");
const OperationType = require("../models/OperationType");
const { getUnit } = require("../models/UnitType");

// ─── Mapper ──────────────────────────────────────────────────────────────────
// mirrors Java mapToResponse(QuantityMeasurementEntity saved)
function mapToResponse(row) {
    return {
        id: row.id,
        inputValue: row.input_value,
        inputUnit: row.unit,
        resultValue: row.result_value,
        resultUnit: row.result_unit,
        operation: row.operation,
        isError: !!row.is_error,
        errorMessage: row.error_message || undefined,
        createdOn: row.created_on,
    };
}

// ─── Validation ──────────────────────────────────────────────────────────────
// mirrors Java validate(UnitType input, UnitType target)
// FIX: Java used != on strings (reference compare), which can silently pass.
//      Here we compare measurementType values properly.
function validate(inputKey, targetKey) {
    const input = getUnit(inputKey);
    const target = getUnit(targetKey);
    if (input.measurementType !== target.measurementType) {
        throw new Error(
            `Incompatible unit types: ${inputKey} (${input.measurementType}) cannot be used with ${targetKey} (${target.measurementType})`
        );
    }
}

// ─── buildResponse ────────────────────────────────────────────────────────────
// mirrors Java buildResponse(dto, resultValue, resultUnit, operation)
async function buildResponse(dto, resultValue, resultUnitKey, operation) {
    const fromUnit = getUnit(dto.from.unit);

    const saved = await QuantityRepository.save({
        inputValue: dto.from.value,
        unit: dto.from.unit.toUpperCase(),
        measurementType: fromUnit.measurementType,
        resultValue,
        resultUnit: resultUnitKey.toUpperCase(),
        operation,
        isError: false,
    });

    return mapToResponse(saved);
}

// ─── Service ──────────────────────────────────────────────────────────────────
const QuantityService = {

    // mirrors: convert(QuantityRequestDTO request)
    // FIX: Java did fromBase(dto.from.value) — skipped the toBase step.
    //      Correct: value → toBase(fromUnit) → fromBase(toUnit)
    convert: async (request) => {
        validate(request.from.unit, request.to.unit);

        const fromUnit = getUnit(request.from.unit);
        const toUnit = getUnit(request.to.unit);

        const baseValue = fromUnit.toBase(request.from.value); // step 1
        const result = toUnit.fromBase(baseValue);           // step 2

        return buildResponse(request, result, request.to.unit, OperationType.CONVERT);
    },

    // mirrors: operation(QuantityDTO q1, QuantityDTO q2, OperationType type)
    // Works in base units so mixed units work: 1km + 500m = 1500 (meters, base)
    operation: (q1, q2, type) => {
        const u1 = getUnit(q1.unit);
        const u2 = getUnit(q2.unit);

        const b1 = u1.toBase(q1.value);
        const b2 = u2.toBase(q2.value);

        switch (type) {
            case OperationType.ADD: return b1 + b2;
            case OperationType.SUB: return b1 - b2;
            case OperationType.MUL: return b1 * b2;
            case OperationType.DIV:
                if (b2 === 0) throw new Error("Division by zero");
                return b1 / b2;
            default:
                throw new Error(`Unknown operation type: ${type}`);
        }
    },

    // mirrors: getAll()
    getAll: async () => {
        const rows = await QuantityRepository.findAll();
        return rows.map(mapToResponse);
    },

    // mirrors: getByOperation(String operation)
    getByOperation: async (operation) => {
        const rows = await QuantityRepository.findByOperation(operation);
        return rows.map(mapToResponse);
    },

    // mirrors: getErrors()
    getErrors: async () => {
        const rows = await QuantityRepository.findByErrorTrue();
        return rows.map(mapToResponse);
    },

    // Java TODO: "update and delete are ops on the DB directly"
    deleteById: async (id) => {
        await QuantityRepository.deleteById(id);
    },
};

module.exports = QuantityService;