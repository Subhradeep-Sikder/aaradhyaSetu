# AARADHYA SETU
A seamless online Puja booking platform connecting devotees with sacred rituals through personalized Sankalp registration and real-time administrative dashboard tracking.

---

## 1. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM, Axios, React Icons |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs |

---

## 2. High-Level Architecture

```mermaid
flowchart LR
    DevoteeClient["Devotee Client<br/>(Explore & Book Pujas)"]
    AdminClient["Admin Client<br/>(Manage Status, Search, Filter)"]

    ExpressServer["Express API Server<br/>(Auth, Routes & Business Logic)"]

    MongoDB[("MongoDB Database<br/>(Users, Events, Bookings)")]

    DevoteeClient -->|Bookings & Auth Requests| ExpressServer
    AdminClient -->|Status Updates & Queries| ExpressServer

    ExpressServer <-->|Mongoose Queries & Population| MongoDB
```

---

## 3. Data Flow (UML Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Devotee as Devotee
    actor Admin as Admin
    participant Server as Express Server
    participant DB as MongoDB

    %% 1. Devotee Booking
    Devotee->>Server: POST /api/bookings (Devotee details, Gotra, Puja ID)
    Server->>DB: Save Booking (Status: Pending)
    DB-->>Server: Saved Booking Document
    Server-->>Devotee: Booking Confirmed Response (PB-XXXXXX)

    %% 2. Admin View & Query
    Admin->>Server: GET /api/bookings/my (Search, Filter, Sort)
    Server->>DB: Query Bookings & Populate Event/User
    DB-->>Server: Bookings Data
    Server-->>Admin: Return Bookings List

    %% 3. Admin Status Update
    Admin->>Server: PUT /api/bookings/:id/status (New Status)
    Server->>DB: Update Status (Pending / Confirmed / In Progress / Completed / Cancelled)
    DB-->>Server: Updated Document
    Server-->>Admin: Success & Trigger UI Re-render
```

---

## 4. Local Setup

### 1. Server (`server/`)
Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aaradhya_setu
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```
Run:
```bash
cd server && npm install && npm run dev
```

### 2. Client (`client/`)
Run:
```bash
cd client && npm install && npm run dev
```
Open **http://localhost:5173** in your browser.
