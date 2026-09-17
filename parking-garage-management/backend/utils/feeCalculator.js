function calculateFee(checkIn, checkOut, pricing) {
    const durationMs =
        new Date(checkOut) - new Date(checkIn);

    const hours = Math.max(
        1,
        Math.ceil(durationMs / (1000 * 60 * 60))
    );

    const fullDays = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    let fee = fullDays * pricing.daily_cap;

    if (remainingHours > 0) {
        let remainingFee;

        if (remainingHours === 1) {
            remainingFee = pricing.first_hour_rate;
        } else {
            remainingFee =
                pricing.first_hour_rate +
                (remainingHours - 1) *
                    pricing.additional_hour_rate;
        }

        fee += Math.min(
            remainingFee,
            pricing.daily_cap
        );
    }

    return {
        hours,
        fee
    };
}

module.exports = calculateFee;