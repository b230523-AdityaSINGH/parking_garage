const API_URL =
  "https://studious-goldfish-6v59j6rvvx4pfxx7q-5000.app.github.dev/api";

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function loginUser(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function checkInVehicle(data) {
  const response = await fetch(`${API_URL}/parking/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function checkOutVehicle(data) {
  const response = await fetch(`${API_URL}/parking/check-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function getSpots() {
  const response = await fetch(`${API_URL}/spots`);
  return response.json();
}

export async function getAvailableSpots(type = "") {
  const url = type
    ? `${API_URL}/spots/available?type=${type}`
    : `${API_URL}/spots/available`;

  const response = await fetch(url);
  return response.json();
}

export async function getActiveSessions() {
  const response = await fetch(`${API_URL}/parking/active`);
  return response.json();
}

export async function searchVehicle(plate) {
  const response = await fetch(
    `${API_URL}/parking/search?plate=${encodeURIComponent(plate)}`
  );

  return response.json();
}

export async function getHistory(params = {}) {
  const query = new URLSearchParams(params).toString();

  const response = await fetch(
    `${API_URL}/parking/history${query ? `?${query}` : ""}`
  );

  return response.json();
}