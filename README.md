# Quantity Measurement API

A Node.js REST API that converts and performs arithmetic on physical quantities (length, mass, temperature, volume). Uses a flat JSON file as the database — no DB setup needed.

---

## Stack

- **Runtime** — Node.js
- **Framework** — Express
- **Storage** — `data/db.json` (flat file, no DB)
- **No TypeScript, no ORM, no Prisma**

---

## Folder Structure

```
qm-node/
├── app.js                    # entry point
├── package.json
├── .env                      # port config (optional)
│
├── data/
│   └── db.json               # all records stored here
│
└── src/
    ├── controllers/
    │   └── QuantityMeasurementController.js  # all routes
    ├── services/
    │   └── QuantityService.js                # business logic
    ├── repo/
    │   └── QuantityRepository.js             # reads/writes db.json
    ├── models/
    │   ├── UnitType.js                       # unit definitions + conversions
    │   └── OperationType.js                  # CONVERT | ADD | SUB | MUL | DIV
    └── middleware/
        └── errorHandler.js                   # global error handler
```

---

## Setup

```bash
npm install
node app.js
# API runs at http://localhost:8080
```

Optional — create a `.env` file to change the port:
```
PORT=8080
```

---

## Supported Units

| Type | Units |
|---|---|
| LENGTH | `METER` `KILOMETER` `CENTIMETER` `MILLIMETER` `MILE` `YARD` `FOOT` `INCH` |
| MASS | `KILOGRAM` `GRAM` `MILLIGRAM` `POUND` `OUNCE` |
| TEMPERATURE | `CELSIUS` `FAHRENHEIT` `KELVIN` |
| VOLUME | `LITER` `MILLILITER` `GALLON` `CUP` |

Units are case-insensitive — `meter`, `METER`, `Meter` all work.

---

## Request Format

All POST endpoints take the same body shape:

```json
{
  "from": { "value": 100, "unit": "CENTIMETER" },
  "to":   { "value": 0,   "unit": "METER" }
}
```

`to.value` is ignored for `/convert` — the result is always calculated.  
For `/operation/*` both `from.value` and `to.value` are used.

---

## Endpoints

### POST `/convert`
Converts a value from one unit to another.

**Body**
```json
{ "from": {"value": 100, "unit": "CENTIMETER"}, "to": {"unit": "METER"} }
```
**Response**
```json
{
  "id": "uuid",
  "inputValue": 100,
  "inputUnit": "CENTIMETER",
  "resultValue": 1,
  "resultUnit": "METER",
  "operation": "CONVERT",
  "isError": false,
  "createdOn": "2026-05-10T14:00:00.000Z"
}
```

---

### POST `/operation/add`
Adds two quantities. Both are converted to base unit first, so mixed units work.

**Body**
```json
{ "from": {"value": 1, "unit": "KILOMETER"}, "to": {"value": 500, "unit": "METER"} }
```
**Response**
```json
{ "result": 1500 }
```

---

### POST `/operation/sub`
Subtracts `to` from `from` in base units.

```json
{ "from": {"value": 1, "unit": "KILOMETER"}, "to": {"value": 500, "unit": "METER"} }
→ { "result": 500 }
```

---

### POST `/operation/mul`
Multiplies both values in base units.

```json
{ "from": {"value": 2, "unit": "METER"}, "to": {"value": 3, "unit": "METER"} }
→ { "result": 6 }
```

---

### POST `/operation/div`
Divides `from` by `to` in base units. Returns error on divide by zero.

```json
{ "from": {"value": 10, "unit": "METER"}, "to": {"value": 2, "unit": "METER"} }
→ { "result": 5 }
```

---

### POST `/operation?type=ADD`
Same as the specific routes above but operation passed as a query param.

```
POST /operation?type=SUB
POST /operation?type=MUL
POST /operation?type=DIV
```

---

### GET `/history`
Returns all records sorted by newest first.

---

### GET `/convert`
Returns all CONVERT operation records.

---

### GET `/operations?type=ADD`
Returns records filtered by operation type. Valid values: `ADD` `SUB` `MUL` `DIV` `CONVERT`

---

### GET `/errors`
Returns all records where something went wrong.

---

### DELETE `/history/:id`
Deletes a record by ID.

```
DELETE /history/3f2a1b4c-...
→ 204 No Content
```

---

## Testing on Windows

**PowerShell (recommended):**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/convert" `
  -ContentType "application/json" `
  -Body '{"from":{"value":100,"unit":"CENTIMETER"},"to":{"unit":"METER"}}'
```

**CMD (escape the quotes):**
```cmd
curl -X POST http://localhost:8080/convert -H "Content-Type: application/json" -d "{\"from\":{\"value\":100,\"unit\":\"CENTIMETER\"},\"to\":{\"unit\":\"METER\"}}"
```

**Postman (easiest):**
- Method: `POST`
- URL: `http://localhost:8080/convert`
- Headers: `Content-Type: application/json`
- Body: `raw → JSON` → paste the body

---

## Error Responses

All errors return the same shape:

```json
{
  "error": true,
  "message": "Incompatible unit types: METER (LENGTH) vs KILOGRAM (MASS)",
  "timestamp": "2026-05-10T14:00:00.000Z",
  "path": "/convert"
}
```

Common errors:
| Error | Cause |
|---|---|
| `Unknown unit: "XYZ"` | Unit doesn't exist in UnitType |
| `Incompatible unit types` | Trying to convert LENGTH to MASS etc. |
| `Division by zero` | `to.value` is 0 on a divide operation |

---

## How the JSON DB works

Every POST `/convert` call appends a record to `data/db.json`. GET endpoints read and filter from it. It looks like this after a few calls:

```json
[
  {
    "id": "3f2a1b4c-...",
    "input_value": 100,
    "unit": "CENTIMETER",
    "measurement_type": "LENGTH",
    "result_value": 1,
    "result_unit": "METER",
    "operation": "CONVERT",
    "is_error": false,
    "error_message": null,
    "created_on": "2026-05-10T14:00:00.000Z"
  }
]
```

To reset — just empty the file back to `[]`.
