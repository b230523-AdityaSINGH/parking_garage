require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const parkingRoutes = require("./routes/parking");
const spotRoutes = require("./routes/spots");
const clockRoutes = require("./routes/clock");
const pricingRoutes = require("./routes/pricing");
require("./database/database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Parking Garage Management API",
        status: "running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/spots", spotRoutes);
app.use("/clock", clockRoutes);
app.use("/api/clock", clockRoutes);
app.use("/api/pricing", pricingRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});