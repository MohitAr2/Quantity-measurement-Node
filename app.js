// app.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const QuantityController = require("./src/controllers/QuantityMeasurementController");
const errorHandler = require("./src/middleware/errorHandler");

app.use(express.json());
app.use("/", QuantityController);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Quantity Measurement API running at http://localhost:${PORT}`);
});