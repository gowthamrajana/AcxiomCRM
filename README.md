# Acxiom CRM

A full-stack Customer Relationship Management (CRM) application designed for managing customers, leads, opportunities, follow-ups, activities, user access, and sales reporting through a secure web platform.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Tooling:** React.js, Vite, React Router DOM
- **HTTP Client:** Axios
- **UI & Visualization:** Bootstrap, Chart.js

### Backend
- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose
- **Authentication & Encryption:** JSON Web Tokens (JWT), `bcryptjs`
- **Validation & Security:** Joi, Helmet, CORS, Express Rate Limit

---

## 🚀 Features

- **Authentication & Session Guard:** JWT authentication, password hashing, login attempt tracking, and account lockout.
- **Role-Based Access Control (RBAC):** Admin, Manager, and Sales Executive granular access levels.
- **Customer Management:** Full CRUD operations with search, multi-field filtering, sorting, and server-side pagination.
- **Lead Pipeline:** Lead lifecycle management and seamless lead-to-customer conversion.
- **Opportunity & Pipeline Tracking:** Weighted pipeline calculations, deal stage tracking, and probability metrics.
- **Follow-up & Activity Logging:** Task scheduling, interaction tracking, and activity history.
- **Audit Logging:** System-wide audit trail recording user actions and state changes.
- **Dashboard & Analytics:** KPI cards, interactive charts (Lead Status, Pipeline Stages, Monthly Sales).
- **Security & Rate Limiting:** Request rate limiting, payload validation, query sanitization, and security HTTP headers.

---

## 👥 Role Definitions

| Role | Access Level & Permissions |
| :--- | :--- |
| **Admin** | Full system access including user management, role assignments, system audit logs, all CRM records, company-wide dashboards, and reports. |
| **Manager** | Access to team CRM data, managed opportunities, team follow-ups, aggregate dashboard metrics, and sales reporting. |
| **Sales Executive** | Access restricted to assigned CRM records, customer leads, own sales opportunities, and permitted sales tasks. |

---

## 📁 Project Structure

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
```

---

## 📦 Main Modules

1. **Authentication:** Registration, login, password security, session validation, and account lockout.
2. **Dashboard:** KPI summary metrics and visual chart analytics.
3. **Customers:** Database of clients, search, status, and detail management.
4. **Leads:** Prospect pipeline tracking and conversion workflow.
5. **Opportunities:** Sales deals with probability metrics and value estimation.
6. **Follow-ups:** Scheduled reminders and task interactions.
7. **Activities:** Logs of calls, meetings, emails, and notes.
8. **Users & Roles:** Access rights and team structure management.
9. **Audit Logs:** Immutable activity tracking for system accountability.
10. **Reports:** Revenue forecasts and historical sales trends.

---

## 🛡️ Security Measures

- **JWT Authentication:** Stateless security via signed token headers.
- **Bcrypt Password Hashing:** Password encryption with salt rounds before database persistence.
- **Role-Based Authorization:** Middleware guards enforcing endpoint accessibility by user role.
- **Ownership Verification:** Access controls ensuring Executives access only assigned records.
- **Request Validation:** Joi schemas validating incoming payload structures on backend endpoints.
- **Sanitization & Headers:** Helmet HTTP headers protection and MongoDB query sanitization.
- **Rate Limiting:** IP-based request throttling (`express-rate-limit`).
- **Account Lockout:** Automatic temporal account suspension after consecutive failed login attempts.
- **Audit Logging:** Timestamped activity history recording modifications and critical actions.

---

## 📊 Dashboard & Metrics

The application dashboard provides instant visibility into core operational metrics:

- **KPI Summaries:** Total Customers, Total Leads, Open Leads, Total Opportunities, Open Opportunities, Won Opportunities, Lost Opportunities, and Total Pipeline Value.
- **Visual Analytics:**
  - Lead Status Distribution Chart
  - Opportunity Pipeline Stage Chart
  - Monthly Sales & Conversion Trends Chart

---

## 💰 Opportunity Pipeline Rules

The weighted value of an opportunity is calculated as:

$$\text{Weighted Value} = \frac{\text{Amount} \times \text{Probability}}{100}$$

### Business Rules:
- **Opportunity Amount:** Must be greater than 0 (`Amount > 0`).
- **Probability Rate:** Must be an integer between 0 and 100 ($0 \le \text{Probability} \le 100$).
- **Expected Close Date:** Active opportunities cannot have an expected close date in the past.
- **Follow-up Date:** Follow-up scheduled dates cannot be set prior to the current date.

---

## 🔗 API Endpoints Overview

All protected requests require an HTTP Authorization header:
`Authorization: Bearer <JWT_TOKEN>`

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token |
| `POST` | `/api/auth/logout` | Invalidate/logout user session |

### Customers (`/api/customers`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/customers` | Fetch all customers (supports query params for search, filter, sort, page) |
| `POST` | `/api/customers` | Create a new customer record |
| `PUT` | `/api/customers/:id` | Update customer record |
| `DELETE` | `/api/customers/:id` | Delete customer record |

### Leads (`/api/leads`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | Fetch all sales leads |
| `POST` | `/api/leads` | Create a new lead |

### Opportunities (`/api/opportunities`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/opportunities` | Fetch sales pipeline opportunities |
| `POST` | `/api/opportunities` | Create a new opportunity |

### Follow-ups & Activities
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/followups` | Retrieve scheduled follow-ups |
| `POST` | `/api/followups` | Schedule a follow-up action |
| `GET` | `/api/activities` | Fetch logged CRM activities |
| `POST` | `/api/activities` | Log a new interaction/activity |

### Dashboard, System & Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Retrieve aggregated KPI numbers and chart analytics |
| `GET` | `/api/reports/monthly-sales` | Generate monthly sales performance metrics |
| `GET` | `/api/users` | List system users (Admin/Manager) |
| `POST` | `/api/users` | Create user account |
| `GET` | `/api/audit` | Retrieve system audit logs (Admin only) |

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/acxiom_crm
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas database connection string

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
The backend API server will start on `http://localhost:5050`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
The client application will run on `http://localhost:5173`.

---

## 🗄️ Database Collections

The database utilizes MongoDB Atlas with Mongoose models for the following collections:

- `Users`
- `Customers`
- `Leads`
- `Opportunities`
- `FollowUps`
- `Activities`
- `AuditLogs`

---

## 🔍 Validation Checklist

Dual-layer validation (client-side form guards & backend Joi schemas) ensures strict data integrity:

- Required field verification
- Valid email format and phone number syntax
- Duplicate customer and lead detection
- Password strength criteria
- Positive value enforcement on opportunity amounts
- Probability bounds enforcement ($0 - 100$)
- Date constraints (close dates and follow-up schedules in future/present)
- Role and ownership authorization checks

---

## 📄 License

Developed as part of the Acxiom CRM project evaluation.