import React from "react";
import { getSpots, getActiveSessions } from "../api";

function Dashboard() {
  const [spots, setSpots] = React.useState([]);
  const [activeSessions, setActiveSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const [spotsData, sessionsData] = await Promise.all([
          getSpots(),
          getActiveSessions(),
        ]);

        setSpots(spotsData);
        setActiveSessions(sessionsData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const totalSpots = spots.length;
  const occupiedSpots = spots.filter(
    (spot) => spot.is_occupied === 1
  ).length;

  const availableSpots = totalSpots - occupiedSpots;

  const availableEVSpots = spots.filter(
    (spot) => spot.spot_type === "EV" && spot.is_occupied === 0
  ).length;

  return (
    <div>
      <h1>Parking Garage Dashboard</h1>

      <p>
        Manage vehicles, parking spots, and parking sessions from one place.
      </p>

      <h2>Garage Overview</h2>

      <p>Total Spots: {totalSpots}</p>
      <p>Available Spots: {availableSpots}</p>
      <p>Occupied Spots: {occupiedSpots}</p>
      <p>Available EV Spots: {availableEVSpots}</p>

      <h2>Currently Parked Vehicles</h2>

      {activeSessions.length === 0 ? (
        <p>No vehicles are currently parked.</p>
      ) : (
        <ul>
          {activeSessions.map((session) => (
            <li key={session.id}>
              {session.license_plate} — Floor {session.floor}, Spot{" "}
              {session.spot_number} — {session.vehicle_type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;