import React from "react";
import { checkOutVehicle } from "../api";

function CheckOut() {
  const [licensePlate, setLicensePlate] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [result, setResult] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("Processing check-out...");
    setResult(null);

    try {
      const data = await checkOutVehicle({
        licensePlate,
      });

      if (data.fee !== undefined) {
        setResult(data);
        setMessage("Vehicle checked out successfully!");
        setLicensePlate("");
      } else {
        setMessage(data.message || "Check-out failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div>
      <h1>Vehicle Check-Out</h1>

      <form onSubmit={handleSubmit}>
        <label>License Plate</label>

        <br />

        <input
          type="text"
          placeholder="Enter license plate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">
          Check Out
        </button>
      </form>

      <p>{message}</p>

      {result && (
        <div>
          <h2>Parking Bill</h2>

          <p>
            License Plate: {result.licensePlate}
          </p>

          <p>
            Duration: {result.durationHours} hour(s)
          </p>

          <p>
            Parking Fee: ₹{result.fee}
          </p>

          <p>
            Floor: {result.spot.floor}
          </p>

          <p>
            Spot: {result.spot.spotNumber}
          </p>

          <p>
            Check-In Time: {result.checkInTime}
          </p>

          <p>
            Check-Out Time: {result.checkOutTime}
          </p>
        </div>
      )}
    </div>
  );
}

export default CheckOut;