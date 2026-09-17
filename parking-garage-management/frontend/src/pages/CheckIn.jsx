import React from "react";
import { checkInVehicle } from "../api";

function CheckIn() {
  const [licensePlate, setLicensePlate] = React.useState("");
  const [vehicleType, setVehicleType] = React.useState("COMPACT");
  const [message, setMessage] = React.useState("");
  const [result, setResult] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("Checking in...");
    setResult(null);

    try {
      const data = await checkInVehicle({
        licensePlate,
        vehicleType,
      });

      if (data.sessionId) {
        setResult(data);
        setMessage("Vehicle checked in successfully!");
        setLicensePlate("");
      } else {
        setMessage(data.message || "Check-in failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div>
      <h1>Vehicle Check-In</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>License Plate</label>
          <br />
          <input
            type="text"
            placeholder="Enter license plate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Vehicle Type</label>
          <br />
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="COMPACT">Compact</option>
            <option value="STANDARD">Standard</option>
            <option value="EV">EV</option>
          </select>
        </div>

        <br />

        <button type="submit">
          Check In
        </button>
      </form>

      <p>{message}</p>

      {result && (
        <div>
          <h2>Parking Details</h2>

          <p>
            License Plate: {result.licensePlate}
          </p>

          <p>
            Floor: {result.spot.floor}
          </p>

          <p>
            Spot: {result.spot.spotNumber}
          </p>

          <p>
            Spot Type: {result.spot.type}
          </p>

          <p>
            Check-In Time: {result.checkInTime}
          </p>
        </div>
      )}
    </div>
  );
}

export default CheckIn;