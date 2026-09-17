import React from "react";
import { searchVehicle } from "../api";

function Search() {
  const [plate, setPlate] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [message, setMessage] = React.useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    setMessage("Searching...");
    setResults([]);

    try {
      const data = await searchVehicle(plate);

      if (Array.isArray(data)) {
        setResults(data);
        setMessage(
          data.length ? `${data.length} record(s) found.` : "No records found."
        );
      } else {
        setMessage(data.message || "Search failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div>
      <h1>Search Vehicle</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter license plate"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          required
        />

        <button type="submit">Search</button>
      </form>

      <p>{message}</p>

      {results.map((item) => (
        <div key={item.id}>
          <hr />
          <p>Plate: {item.license_plate}</p>
          <p>Vehicle Type: {item.vehicle_type}</p>
          <p>
            Spot: Floor {item.floor}, Spot {item.spot_number}
          </p>
          <p>Status: {item.status}</p>
          <p>Check-In: {item.check_in_time}</p>
          <p>Check-Out: {item.check_out_time || "Still parked"}</p>
          <p>Fee: {item.fee !== null ? `₹${item.fee}` : "Pending"}</p>
        </div>
      ))}
    </div>
  );
}

export default Search;