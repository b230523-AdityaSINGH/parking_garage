import React from "react";
import { getSpots } from "../api";

function Spots() {
  const [spots, setSpots] = React.useState([]);
  const [filter, setFilter] = React.useState("ALL");

  const loadSpots = async () => {
    try {
      const data = await getSpots();
      setSpots(data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    loadSpots();
  }, []);

  const filteredSpots =
    filter === "ALL"
      ? spots
      : spots.filter((spot) => spot.spot_type === filter);

  const availableEV = spots.filter(
    (spot) => spot.spot_type === "EV" && spot.is_occupied === 0
  ).length;

  return (
    <div>
      <h1>Parking Spots</h1>

      <h2>EV Availability</h2>
      <p>
        Available EV Spots: <strong>{availableEV}</strong>
      </p>

      <label>Filter: </label>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="ALL">All</option>
        <option value="COMPACT">Compact</option>
        <option value="STANDARD">Standard</option>
        <option value="EV">EV</option>
      </select>

      <hr />

      {filteredSpots.map((spot) => (
        <div key={spot.id}>
          <p>
            <strong>
              Floor {spot.floor} — Spot {spot.spot_number}
            </strong>
          </p>

          <p>Type: {spot.spot_type}</p>

          <p>
            Status:{" "}
            {spot.is_occupied === 1
              ? "Occupied"
              : "Available"}
          </p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Spots;