# Parking Garage Management System

A full-stack parking garage management system designed for busy multi-level city-centre parking garages.

The system helps parking attendants manage vehicle check-in, check-out, parking spot allocation, fee calculation, vehicle lookup, parking history, EV availability, pricing configuration, automatic session closure, and valet plate transfers.

## Features

- User registration and login
- Vehicle check-in and check-out
- Automatic compatible parking spot allocation
- Compact, Standard, and EV parking spots
- EV vehicles restricted to EV spots
- Tiered hourly parking rates
- Daily maximum parking cap
- Part-hours rounded up
- License plate search
- Parking history with pagination and sorting
- Parking spot availability
- EV spot availability
- Messy rate-card import
- Automatic closure and billing of sessions parked over 24 hours
- Valet hand-off through license plate transfer
- Persistent SQLite database
- REST APIs
- React web interface

## Technology Stack

### Frontend
- React
- Vite
- React Router
- CSS

### Backend
- Node.js
- Express
- SQLite
- JWT
- bcryptjs

## Project Structure

```text
parking-garage-management/
├── README.md
├── REASONING.md
├── AI_LOGS.md
├── .gitignore
├── backend/
│   ├── server.js
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   └── utils/
└── frontend/
    └── src/
        ├── pages/
        ├── App.jsx
        ├── api.js
        └── index.css