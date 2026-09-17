# REASONING

## 1. Understanding the Problem

The goal was to build a reusable parking garage management system for a busy multi-level garage.

I first identified the core workflow as:

1. Vehicle check-in
2. Compatible parking spot allocation
3. Parking duration tracking
4. Correct fee calculation
5. Vehicle check-out
6. Spot release

After implementing the core flow, I added the additional requirements such as vehicle search, EV spot handling, history, pagination, sorting, and the mandatory assessment twists.

## 2. Technology Choice

I selected a simple full-stack architecture:

- React + Vite for the frontend
- Node.js + Express for REST APIs
- SQLite for persistent storage
- JWT and bcryptjs for authentication

SQLite was selected because the assessment required real persistence while keeping the implementation lightweight enough for the limited development time.

## 3. Database Design

The database was separated into logical entities:

- Users
- Parking Spots
- Parking Sessions
- Pricing

Parking sessions reference parking spots instead of storing parking information directly in the session.

This allows the system to track:

- Which vehicle is parked
- Which spot is assigned
- When it entered
- When it exited
- The calculated fee
- Whether the session is active or completed

## 4. Check-In Logic

For check-in, the system first validates the vehicle information.

It then checks whether the license plate already has an active session.

Next, it searches for a compatible available parking spot.

EV vehicles are restricted to EV spots.

The spot and session are updated together so that a spot cannot accidentally be assigned to multiple active sessions.

## 5. Check-Out and Fee Calculation

For check-out, the system finds the active session using the license plate.

The duration is calculated from the check-in time to the check-out time.

Partial hours are rounded up.

The pricing model uses:

- First-hour rate
- Additional-hour rate
- Daily maximum cap

The fee calculation was kept in a separate utility so that the same calculation can be reused by normal checkout and automatic closure.

## 6. Search and History

Because attendants may need to find vehicles in a large parking log, a license-plate search endpoint was added.

A separate history endpoint provides:

- Pagination
- Sorting
- Multiple sorting fields
- Ascending and descending order

This avoids returning the entire parking history in a single request.

## 7. T4 — Messy Rate Card

The assessment included a messy pricing import requirement.

I implemented a pricing import endpoint that processes text containing valid rate rows mixed with unrelated junk.

The implementation identifies valid parking spot types and extracts the required pricing values before storing them in the database.

This keeps pricing configurable instead of hard-coding the rates into the fee calculation logic.

## 8. T2 — Automatic Closure

The assessment required automatic closure of sessions parked for more than 24 hours.

A `/clock` endpoint was implemented.

It checks active sessions, identifies sessions exceeding 24 hours, calculates their fee, completes them, and releases their parking spots.

The endpoint accepts an optional `now` timestamp. This makes the behaviour deterministic and allows the 24-hour condition to be tested without waiting an actual day.

## 9. T6 — Session Transfer

For the valet hand-off requirement, an active parking session can be transferred to another license plate.

The implementation changes the active license plate while preserving:

- Parking spot
- Check-in time
- Session identity

The destination plate is also checked to prevent conflicting active sessions.

## 10. Frontend

After the backend functionality was implemented, a React interface was created for the main operations.

The UI includes:

- Dashboard
- Registration
- Login
- Check-in
- Check-out
- Search
- History
- Parking spots

The frontend communicates with the backend through REST API functions defined in `api.js`.

## 11. Testing and Fixes

The application was tested incrementally instead of waiting until the end.

The following areas were tested:

- Registration and login
- Check-in
- Check-out
- Fee calculation
- Spot release
- License plate search
- Parking history
- Pagination and sorting
- EV availability
- T4 pricing import
- T2 automatic closure
- T6 session transfer

The React production build was also run successfully using `npm run build`.

## 12. Time and Scope Decisions

The assessment had a strict time limit, so implementation focused first on correctness of the core parking workflow.

The main priority was:

1. Database and persistence
2. Check-in/check-out
3. Fee calculation
4. Spot allocation
5. Mandatory assessment twists
6. Search and history
7. Frontend
8. Documentation and final verification

Visual styling was kept simple and functional so that development time could be spent on the required business logic.

## 13. Final Result

The final application provides a reusable parking garage management foundation rather than a solution hard-coded for one garage.

Parking spots and pricing are database-driven, while parking operations are exposed through REST APIs and consumed by the React frontend.

Future improvements could include configurable garage layouts, attendant roles and permissions, revenue analytics, stronger authorization, audit logs, and production-grade monitoring.