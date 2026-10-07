# Acxiom CRM

A full-stack Customer Relationship Management (CRM) application for managing customers, leads, opportunities, follow-ups, activities, users, and sales reporting.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Bootstrap
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Joi
- Helmet
- CORS
- Express Rate Limit

## Features

- JWT authentication
- Password hashing and validation
- Login attempt tracking and account lockout
- Role-based access control
- Admin, Manager, and Sales Executive roles
- Customer CRUD
- Customer search, filtering, sorting, and pagination
- Lead CRUD and status management
- Lead-to-customer conversion
- Opportunity management and sales pipeline
- Weighted pipeline calculation
- Follow-up management
- Activity management
- Audit logging
- Dashboard KPIs and charts
- REST APIs
- Client-side and server-side validation
- API security and rate limiting

## Roles

### Admin
Full system access including user management, roles, audit logs, CRM records, dashboard, and reports.

### Manager
Access to team CRM data, opportunities, follow-ups, dashboard, and reports according to authorization rules.

### Sales Executive
Access to assigned CRM records and permitted sales operations.

## Project Structure

```text
AcxiomCRM/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
│
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── validators/
    ├── utils/
    ├── app.js
    ├── server.js
    └── package.json

    Main Modules
Authentication
Dashboard
Customers
Leads
Opportunities
Follow-ups
Activities
Users & Roles
Audit Logs
Reports
REST API
Security
JWT authentication
bcrypt password hashing
Role-based authorization
Ownership checks
Joi server-side validation
Client-side validation
Helmet security headers
CORS configuration
API rate limiting
MongoDB/Mongoose query sanitization
Account lockout
Audit logging
Sensitive authentication data excluded from API responses
Dashboard

The dashboard provides:

Total Customers
Total Leads
Open Leads
Total Opportunities
Open Opportunities
Won Opportunities
Lost Opportunities
Total Pipeline Value
Lead Status chart
Opportunity Pipeline chart
Monthly Sales chart
Opportunity Pipeline

Weighted pipeline value is calculated as:

Weighted Value = Amount × Probability / 100
Business rules include:

Amount must be greater than 0
Probability must be between 0 and 100
Active opportunities cannot have a past expected close date
Follow-up dates cannot be earlier than today

API

Example endpoints:

POST   /api/auth/login
POST   /api/auth/logout

GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id

GET    /api/leads
POST   /api/leads

GET    /api/opportunities
POST   /api/opportunities

GET    /api/followups
POST   /api/followups

GET    /api/activities
POST   /api/activities

GET    /api/dashboard/stats
GET    /api/reports/monthly-sales

GET    /api/users
POST   /api/users

GET    /api/audit
Protected API requests use JWT authentication:

Authorization: Bearer <JWT_TOKEN>
Environment Variables

Create server/.env:

PORT=5050
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
CLIENT_URL=http://localhost:5173

Do not commit .env to GitHub.

Installation
Backend
cd server
npm install
npm run dev

Backend:

http://localhost:5050
Frontend

Open another terminal:

cd client
npm install
npm run dev

Frontend:

http://localhost:5173
Database

MongoDB Atlas is used as the database.

Main collections:

Users
Customers
Leads
Opportunities
FollowUps
Activities
AuditLogs
Validation

Validation is implemented on both frontend and backend.

Examples:

Required fields
Valid email
Valid phone
Duplicate customer prevention
Password requirements
Opportunity amount
Opportunity probability
Opportunity close date
Follow-up date
Role and ownership authorization
License

Developed as part of the Acxiom CRM project evaluation.