// app.js
require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const { initDB } = require("./src/db");
const QuantityController = require("./src/controllers/QuantityMeasurementController");
const errorHandler = require("./src/middleware/errorHandler");

app.use(express.json());
app.use("/", QuantityController);
app.use(errorHandler); // must be last

// Auto-create table then start server
initDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Quantity Measurement API running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err.message);
        process.exit(1);
    });