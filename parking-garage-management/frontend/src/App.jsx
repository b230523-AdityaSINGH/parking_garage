import { Routes, Route, Link } from "react-router-dom";
import React from "react";
import { loginUser } from "./api";

import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import CheckOut from "./pages/CheckOut";
import Register from "./pages/Register";
import Search from "./pages/Search";
import History from "./pages/History";
import Spots from "./pages/Spots";

function Landing() {
  return (
    <div>
      <h1>Parking Garage Management</h1>

      <p>
        Manage vehicle check-ins, check-outs, parking spots and parking fees
        from one place.
      </p>

      <h2>Key Features</h2>

      <ul>
        <li>Fast vehicle check-in and check-out</li>
        <li>Automatic parking spot allocation</li>
        <li>Accurate tiered parking fee calculation</li>
        <li>Search vehicles by license plate</li>
        <li>Real-time EV spot availability</li>
      </ul>

      <h2>Who is it for?</h2>

      <p>
        Designed for parking attendants and garage operators managing
        multi-level parking facilities.
      </p>

      <h2>Next Features</h2>

<ul>
  <li>Configurable garages and parking layouts</li>
  <li>Attendant roles and permissions</li>
  <li>Revenue reports and analytics</li>
</ul>

      <Link to="/login">Login</Link>
      {" | "}
      <Link to="/register">Register</Link>
    </div>
  );
}

function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("Logging in...");

    try {
      const result = await loginUser({
        email,
        password,
      });

      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        window.location.href = "/dashboard";
      } else {
        setMessage(result.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      <p>{message}</p>

      <Link to="/register">Create an account</Link>
    </div>
  );
}

function App() {
  return (
    <>
      <nav>
  <Link to="/">🏠 Home</Link>
  <Link to="/dashboard">Dashboard</Link>
  <Link to="/check-in">Check-In</Link>
  <Link to="/check-out">Check-Out</Link>
  <Link to="/search">Search</Link>
  <Link to="/history">History</Link>
  <Link to="/spots">Spots</Link>
  <Link to="/register">Register</Link>
  <Link to="/login">Login</Link>
</nav>

      <hr />

      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/check-in" element={<CheckIn />} />

        <Route path="/check-out" element={<CheckOut />} />
        <Route path="/search" element={<Search />} />
        <Route path="/history" element={<History />} />
        <Route path="/spots" element={<Spots />} />
      </Routes>
    </>
  );
}

export default App;