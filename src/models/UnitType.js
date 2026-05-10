const MeasurementType = {
    LENGTH: "LENGTH",
    MASS: "MASS",
    TEMPERATURE: "TEMPERATURE",
    VOLUME: "VOLUME",
};

// Each unit has: toBase (unit → base), fromBase (base → unit), measurementType
// Base units: METER, KILOGRAM, CELSIUS, LITER
const UnitType = {
    // LENGTH
    METER: { measurementType: MeasurementType.LENGTH, toBase: (v) => v, fromBase: (v) => v },
    KILOMETER: { measurementType: MeasurementType.LENGTH, toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    CENTIMETER: { measurementType: MeasurementType.LENGTH, toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    MILLIMETER: { measurementType: MeasurementType.LENGTH, toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    MILE: { measurementType: MeasurementType.LENGTH, toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    YARD: { measurementType: MeasurementType.LENGTH, toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    FOOT: { measurementType: MeasurementType.LENGTH, toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    INCH: { measurementType: MeasurementType.LENGTH, toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },

    // MASS
    KILOGRAM: { measurementType: MeasurementType.MASS, toBase: (v) => v, fromBase: (v) => v },
    GRAM: { measurementType: MeasurementType.MASS, toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    MILLIGRAM: { measurementType: MeasurementType.MASS, toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
    POUND: { measurementType: MeasurementType.MASS, toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    OUNCE: { measurementType: MeasurementType.MASS, toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },

    // TEMPERATURE
    CELSIUS: { measurementType: MeasurementType.TEMPERATURE, toBase: (v) => v, fromBase: (v) => v },
    FAHRENHEIT: { measurementType: MeasurementType.TEMPERATURE, toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    KELVIN: { measurementType: MeasurementType.TEMPERATURE, toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },

    // VOLUME
    LITER: { measurementType: MeasurementType.VOLUME, toBase: (v) => v, fromBase: (v) => v },
    MILLILITER: { measurementType: MeasurementType.VOLUME, toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    GALLON: { measurementType: MeasurementType.VOLUME, toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    CUP: { measurementType: MeasurementType.VOLUME, toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
};

function getUnit(key) {
    const unit = UnitType[key?.toUpperCase()];
    if (!unit) throw new Error(`Unknown unit: "${key}"`);
    return unit;
}

module.exports = { UnitType, MeasurementType, getUnit };