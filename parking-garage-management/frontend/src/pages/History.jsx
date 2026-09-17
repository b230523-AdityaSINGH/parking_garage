import React from "react";
import { getHistory } from "../api";

function History() {
  const [data, setData] = React.useState({
    data: [],
    pagination: {}
  });

  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState("check_in_time");
  const [order, setOrder] = React.useState("desc");

  const loadHistory = async () => {
    try {
      const result = await getHistory({
        page,
        limit: 10,
        sort,
        order
      });

      setData(result);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    loadHistory();
  }, [page, sort, order]);

  return (
    <div>
      <h1>Parking History</h1>

      <label>Sort By: </label>

      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          setPage(1);
        }}
      >
        <option value="check_in_time">Check-In Time</option>
        <option value="check_out_time">Check-Out Time</option>
        <option value="license_plate">License Plate</option>
        <option value="fee">Fee</option>
      </select>

      {" "}

      <select
        value={order}
        onChange={(e) => {
          setOrder(e.target.value);
          setPage(1);
        }}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>

      <hr />

      {data.data?.map((item) => (
        <div key={item.id}>
          <p>
            <strong>{item.license_plate}</strong> — {item.vehicle_type}
          </p>

          <p>
            Floor {item.floor}, Spot {item.spot_number}
          </p>

          <p>Status: {item.status}</p>

          <p>Check-In: {item.check_in_time}</p>

          <p>
            Check-Out: {item.check_out_time || "Still parked"}
          </p>

          <p>
            Fee: {item.fee !== null ? `₹${item.fee}` : "Pending"}
          </p>

          <hr />
        </div>
      ))}

      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>

      {" "}

      <span>
        Page {data.pagination?.page || page} of{" "}
        {data.pagination?.totalPages || 1}
      </span>

      {" "}

      <button
        disabled={
          page >= (data.pagination?.totalPages || 1)
        }
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default History;
