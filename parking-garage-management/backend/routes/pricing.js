const express = require("express");
const db = require("../database/database");

const router = express.Router();

const VALID_TYPES = ["COMPACT", "STANDARD", "EV"];

function cleanNumber(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const match = String(value).replace(/,/g, "").match(/-?\d+(\.\d+)?/);

    return match ? Number(match[0]) : null;
}

function cleanRateCard(data) {
    const text = String(data || "");

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const rates = [];

    for (const line of lines) {
        const upper = line.toUpperCase();

        const type = VALID_TYPES.find(
            item => upper.includes(item)
        );

        if (!type) {
            continue;
        }

        const numbers = line.match(/\d+(?:\.\d+)?/g);

        if (!numbers || numbers.length < 3) {
            continue;
        }

        const firstHourRate = cleanNumber(numbers[0]);
        const additionalHourRate = cleanNumber(numbers[1]);
        const dailyCap = cleanNumber(numbers[2]);

        if (
            firstHourRate === null ||
            additionalHourRate === null ||
            dailyCap === null
        ) {
            continue;
        }

        rates.push({
            spotType: type,
            firstHourRate,
            additionalHourRate,
            dailyCap
        });
    }

    return rates;
}


// =========================
// IMPORT MESSY RATE CARD
// =========================
router.post("/import", (req, res) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                message: "Rate card data is required"
            });
        }

        const cleanedRates = cleanRateCard(data);

        if (cleanedRates.length === 0) {
            return res.status(400).json({
                message: "No valid pricing rows found"
            });
        }

        const transaction = db.transaction(() => {
            for (const rate of cleanedRates) {
                db.prepare(`
                    INSERT INTO pricing
                    (
                        spot_type,
                        first_hour_rate,
                        additional_hour_rate,
                        daily_cap
                    )
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(spot_type)
                    DO UPDATE SET
                        first_hour_rate = excluded.first_hour_rate,
                        additional_hour_rate = excluded.additional_hour_rate,
                        daily_cap = excluded.daily_cap
                `).run(
                    rate.spotType,
                    rate.firstHourRate,
                    rate.additionalHourRate,
                    rate.dailyCap
                );
            }
        });

        transaction();

        res.json({
            message: "Rate card imported successfully",
            cleanedRates
        });

    } catch (error) {
        res.status(500).json({
            message: "Rate card import failed",
            error: error.message
        });
    }
});


// =========================
// VIEW CURRENT RATES
// =========================
router.get("/", (req, res) => {
    try {
        const rates = db.prepare(`
            SELECT
                spot_type,
                first_hour_rate,
                additional_hour_rate,
                daily_cap
            FROM pricing
            ORDER BY spot_type
        `).all();

        res.json(rates);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch pricing",
            error: error.message
        });
    }
});


module.exports = router;