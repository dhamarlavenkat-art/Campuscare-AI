# CampusCare AI

CampusCare AI is an AI-assisted college complaint and campus infrastructure management system built using the MERN stack.

The platform allows students to submit campus-related complaints, automatically analyses each complaint using AI, identifies the appropriate department, detects possible duplicate complaints, and routes the issue to the relevant department administrator.

Administrators can view only the complaints assigned to their department, update complaint statuses, manage buildings, floors, rooms and assets, and monitor department-specific analytics and reports.

---

## Project Overview

Traditional college complaint systems often require students or staff to manually select the correct department. This can result in incorrectly routed complaints, duplicate issues, slow processing, and poor complaint tracking.

CampusCare AI improves this process by analysing the complaint title and description and automatically generating:

- Complaint category
- Priority level
- Responsible department
- Short summary
- Troubleshooting suggestions

The complaint is then stored in MongoDB and made available only to the administrator responsible for that department.

---

## Main Features

### Student Features

- Student registration and login
- Secure JWT authentication
- Forgot password using OTP
- Submit a complaint with:
  - Title
  - Description
  - Optional image
  - Anonymous submission option
  - Building, floor, room and affected asset
  - Number of affected asset units
- AI-powered complaint analysis
- Automatic department routing
- Automatic category and priority detection
- AI-generated complaint summary
- Pre-submission troubleshooting checklist with a maximum of four safe steps
- Mandatory confirmation of every troubleshooting step before final submission
- Secure, short-lived signed analysis to prevent submitting changed complaint content
- Duplicate complaint detection
- Support an existing similar complaint
- Prevent repeated support from the same student
- View submitted complaints
- View complaint details
- View complaint status
- View complaint history
- View administrator remarks
- Delete pending complaints
- Responsive student dashboard

### Administrator Features

- Administrator registration with department selection
- Secure role-based login
- Department-based complaint access
- Administrators see only their department complaints
- Search complaints
- Filter complaints by:
  - Status
  - Category
  - Priority
- Sort complaints by newest or oldest
- Pagination
- View complete complaint details
- View AI analysis
- View student details for non-anonymous complaints
- Update complaint status
- Add administrator remarks
- View complaint history
- Department-specific dashboard statistics
- Campus infrastructure navigation by building, floor and room
- Room inventory for fans, lights, projectors, computers, servers and other assets
- Room and asset-specific complaint lists
- Complaint counts automatically derived from open student reports
- Separate interactive Analytics page
- Interactive received, resolved and rejected complaint trend chart
- Separate filtered Reports page with CSV export
- Filters for period, building, floor, room, asset, category, priority and status
- Historical resolved and rejected calculations based on status-history timestamps
- Optional expert-level AI suggestions generated only when requested by the admin
- Responsive administrator dashboard

### AI Features

CampusCare AI uses the Groq API with the Llama model to analyse complaints.

The AI returns structured JSON containing:

```json
{
  "category": "IT",
  "priority": "High",
  "department": "IT",
  "summary": "Computer laboratory Wi-Fi is unavailable.",
  "troubleshooting": [
    "Restart the Wi-Fi router",
    "Check the network connection",
    "Verify whether other devices can connect"
  ]
}
```

The department value is normalised before saving so that it matches the departments assigned to administrators.

AI analysis now happens before final complaint creation. The student receives up to four safe troubleshooting steps and must confirm all of them. The signed analysis remains valid for ten minutes and is reused during final submission, avoiding a second AI request. Administrators do not automatically see student-level troubleshooting; they can request concise expert suggestions when needed.

---

## Campus Infrastructure Module

The infrastructure module represents the campus using the following hierarchy:

```text
Building
  └── Floor
      └── Room / Lab / Server Room / Office
          └── Assets
              └── Linked Complaints
```

Administrators can create spaces such as classrooms, computer labs, science labs, server rooms, offices, seminar halls and auditoriums. For each space, the admin records only the asset type and total quantity. Working or faulty counts are not entered manually.

Students link a complaint to a room and optional asset. They specify how many units are affected. The infrastructure page then calculates the currently reported affected quantity from unresolved complaints. Resolved and rejected complaints are automatically excluded from the active affected count.

The project includes an optional sample initializer for Main Block, 3rd Floor and Rooms 301–320.

---

## Analytics and Reports

Analytics and reports are separate administrator sections:

- **Analytics:** summary metrics and a responsive interactive line chart for received, resolved and rejected complaints.
- **Reports:** filtered complaint records with CSV export.

Available filters include today, this week, this month, last month, this year, custom dates, building, floor, room, asset type, category, priority and status.

Resolved and rejected totals use the matching entries in complaint history instead of `updatedAt`, preserving accurate historical reporting.

---

## Application Workflow

```text
Student enters complaint and location
        ↓
Student requests AI analysis
        ↓
AI identifies category, priority and department and returns up to four troubleshooting steps
        ↓
Student confirms every troubleshooting step
        ↓
Signed analysis is verified during final submission
        ↓
System checks for a similar unresolved complaint
        ↓
If a duplicate exists:
Student can support the existing complaint
        ↓
If no duplicate exists:
Complaint is saved in MongoDB
        ↓
Complaint appears only for the concerned department admin
        ↓
Admin updates status and adds remarks
        ↓
Student tracks progress and complaint history
```

---

## Technology Stack

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Lucide React
- Recharts
- CSS
- Context API
- Local Storage
- Session Storage

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcrypt
- Axios
- Multer
- Helmet
- CORS
- dotenv
- express-validator
- express-rate-limit
- Nodemon

### Artificial Intelligence

- Groq API
- Llama 3.3 70B Versatile

---

## Project Structure

```text
Campuscare-AI/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── RoleRoute.jsx
│   │   │   ├── common/
│   │   │   │   └── Loader.jsx
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── student/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── VerifyOTP.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── CreateComplaint.jsx
│   │   │   │   ├── MyComplaints.jsx
│   │   │   │   └── ComplaintDetails.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminComplaints.jsx
│   │   │       ├── AdminComplaintDetails.jsx
│   │   │       ├── AdminInfrastructure.jsx
│   │   │       ├── AdminAnalytics.jsx
│   │   │       └── AdminReports.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── complaint.service.js
│   │   │   ├── admin.service.js
│   │   │   └── infrastructure.service.js
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── departments.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── complaint.controller.js
│   ├── admin.controller.js
│   └── infrastructure.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── admin.middleware.js
│   ├── upload.middleware.js
│   └── rateLimit.middleware.js
│
├── models/
│   ├── user.model.js
│   ├── complaint.model.js
│   └── room.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── complaint.routes.js
│   ├── admin.routes.js
│   └── infrastructure.routes.js
│
├── services/
│   └── ai.service.js
│
├── uploads/
│
├── validation/
│   ├── auth.validation.js
│   └── complaint.validation.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---

## Installation

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB Community Server
- MongoDB Compass
- Git
- A Groq API key

---

## Clone the Repository

```bash
git clone https://github.com/dhamarlavenkat-art/Campuscare-AI.git
```

Open the project:

```bash
cd Campuscare-AI
```

---

## Backend Setup

Enter the backend folder:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file in the backend root:

```env
PORT=5000

MONGO_URL=mongodb://127.0.0.1:27017/campuscare_ai

JWT_SECRET=replace_with_a_long_random_secret

GROQ_API_KEY=replace_with_your_groq_api_key
```

Do not upload the `.env` file to GitHub.

Start MongoDB locally, then start the backend:

```bash
npm run dev
```

Expected terminal output:

```text
MongoDB Connected Successfully
Server running on port 5000
```

Test the backend:

```text
http://localhost:5000/
```

Expected response:

```text
CampuscareAI backend was running
```

---

## Frontend Setup

Open another terminal and enter the frontend folder:

```bash
cd client
```

Install frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

---

## Frontend API Configuration

The Axios instance is located in:

```text
client/src/services/api.js
```

For local development:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URL` | MongoDB connection URL |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `GROQ_API_KEY` | Groq API key used for AI analysis |

Example:

```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/campuscare_ai
JWT_SECRET=my_secure_jwt_secret
GROQ_API_KEY=my_groq_api_key
```

---

## Supported Departments

The AI and administrator accounts use the following exact department names:

```text
Administration
IT
Library
Hostel
Transport
Examination
Maintenance
Accounts
Sports
Placement
Security
```

The AI service normalises values such as:

```text
IT Department
```

into:

```text
IT
```

This ensures that department-based administrator filtering works correctly.

---

## Authentication

CampusCare AI uses JWT authentication.

After login, the backend returns:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student",
    "department": null
  }
}
```

The frontend stores the token and user information in local storage.

Protected requests include:

```http
Authorization: Bearer JWT_TOKEN
```

---

## User Roles

### Student

A student can:

- Create complaints
- View their own complaints
- View complaint details
- View complaint history
- Support duplicate complaints
- Delete pending complaints
- Track administrator updates

### Admin

An administrator can:

- View complaints assigned to their department
- Search and filter complaints
- View department statistics
- Open complaint details
- Update complaint status
- Add administrator remarks

---

## Complaint Statuses

```text
Pending
In Progress
Resolved
Rejected
```

---

## Complaint Priorities

```text
Low
Medium
High
```

---

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Authentication Routes

#### Register

```http
POST /api/auth/register
```

Student request:

```json
{
  "name": "Venkat",
  "email": "venkat@example.com",
  "password": "password123",
  "role": "student"
}
```

Admin request:

```json
{
  "name": "IT Admin",
  "email": "itadmin@example.com",
  "password": "password123",
  "role": "admin",
  "department": "IT"
}
```

#### Login

```http
POST /api/auth/login
```

```json
{
  "email": "venkat@example.com",
  "password": "password123"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
```

```json
{
  "email": "venkat@example.com"
}
```

#### Verify OTP

```http
POST /api/auth/verify-otp
```

```json
{
  "email": "venkat@example.com",
  "otp": "123456"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
```

```json
{
  "email": "venkat@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

---

## Student Complaint Routes

All complaint routes require a student JWT token.

#### Create Complaint

```http
POST /api/complaints/create
```

Use `form-data`:

```text
title: Computer lab Wi-Fi is not working
description: Students cannot connect to the computer laboratory Wi-Fi.
anonymous: false
image: optional image file
roomId: optional room ObjectId
assetId: optional room asset ObjectId
affectedQuantity: optional affected unit count
analysisToken: token returned by the analysis endpoint
troubleshootingAcknowledged: true
confirmedTroubleshooting: JSON array of confirmed steps
```

#### Analyze Before Submission

```http
POST /api/complaints/analyze
```

This authenticated endpoint returns the complaint summary, a maximum of four troubleshooting steps and a signed analysis token valid for ten minutes.

#### Get Student Complaints

```http
GET /api/complaints/my
```

#### Get One Complaint

```http
GET /api/complaints/:id
```

#### Get Complaint History

```http
GET /api/complaints/history/:id
```

#### Update Complaint

```http
PUT /api/complaints/update/:id
```

#### Delete Complaint

```http
DELETE /api/complaints/delete/:id
```

#### Support Existing Complaint

```http
POST /api/complaints/support/:id
```

---

## Admin Routes

All administrator routes require an admin JWT token.

#### Get Department Complaints

```http
GET /api/admin/complaints
```

Supported query parameters:

```text
status
category
priority
search
sort
page
limit
```

Example:

```text
/api/admin/complaints?status=Pending&priority=High&sort=newest&page=1&limit=10
```

#### Get One Department Complaint

```http
GET /api/admin/complaints/:id
```

#### Generate Optional Admin Suggestions

```http
POST /api/admin/complaints/:id/suggestions
```

AI suggestions are generated only when an authorized department admin explicitly requests them.

#### Update Complaint Status

```http
PATCH /api/admin/status/:id
```

```json
{
  "status": "In Progress",
  "adminRemark": "The network technician has been assigned."
}
```

#### Get Department Dashboard Statistics

```http
GET /api/admin/dashboard
```

#### Get Analytics and Report Data

```http
GET /api/admin/analytics
```

Supported filters include `period`, `startDate`, `endDate`, `building`, `floor`, `room`, `assetType`, `category`, `priority` and `status`.

### Infrastructure Routes

All infrastructure routes require authentication. Modification routes also require the admin role.

```http
GET   /api/infrastructure/options
GET   /api/infrastructure/rooms
GET   /api/infrastructure/rooms/:id
POST  /api/infrastructure/rooms
PATCH /api/infrastructure/rooms/:roomId/assets/:assetId
POST  /api/infrastructure/seed
```

---

## Duplicate Complaint Detection

When a student submits a complaint, the backend checks for an existing unresolved complaint with similar content.

If a duplicate complaint is found, the backend returns:

```json
{
  "success": true,
  "duplicate": true,
  "message": "A similar complaint already exists.",
  "data": {
    "complaintId": "COMPLAINT_ID",
    "title": "Computer lab Wi-Fi is not working",
    "status": "Pending",
    "supporters": 1,
    "alreadySupported": false
  }
}
```

The frontend then displays a Support Complaint button.

The same student cannot support the same complaint more than once.

---

## Anonymous Complaints

Students can submit a complaint anonymously.

The complaint still stores the creator internally for ownership and security, but the administrator interface can hide the student's identity when `anonymous` is set to `true`.

---

## Image Upload

Complaint images are uploaded using Multer.

Supported formats:

```text
JPG
JPEG
PNG
```

Uploaded images are stored in:

```text
uploads/
```

Images can be accessed through:

```text
http://localhost:5000/uploads/IMAGE_NAME
```

---

## Password Reset During Development

The password reset OTP is currently printed in the backend terminal.

Example:

```text
Password Reset OTP: 483921
```

This is suitable for local development only.

For production, the OTP should be delivered through:

- Email using Nodemailer
- SMS service
- College email system

Never return the OTP directly in the frontend API response.

---

## Security Features

- Password hashing using bcrypt
- JWT authentication
- Student and administrator role protection
- Department-level administrator access
- Protected complaint ownership
- Input validation
- Authentication rate limiting
- Helmet security headers
- Controlled image uploads
- Protected complaint status updates
- Prevention of repeated complaint support
- Signed pre-submission AI analysis with ten-minute expiry
- Server verification that every troubleshooting step was confirmed
- Server-side room and asset validation
- Department-protected infrastructure complaint access
- Environment variables for secrets

---

## Responsive Design

The frontend supports:

- Desktop
- Tablet
- Mobile

The dashboard includes:

- Responsive sidebar
- Mobile navigation menu
- Sidebar overlay
- Responsive cards
- Responsive complaint forms
- Responsive admin filters
- Responsive complaint details
- Loading indicators

To test mobile responsiveness in Chrome:

```text
F12
```

Then press:

```text
Ctrl + Shift + M
```

---

## Testing on a Mobile Phone

Run Vite with network access:

```bash
npm run dev -- --host
```

Find the laptop IP:

```powershell
ipconfig
```

Open the Vite network URL on the phone:

```text
http://YOUR_LAPTOP_IP:5173
```

Both the laptop and mobile phone must be connected to the same Wi-Fi network.

For mobile API testing, update the Axios base URL:

```javascript
baseURL: "http://YOUR_LAPTOP_IP:5000/api"
```

---

## Test Accounts

Create test accounts using different email addresses.

### Student

```text
Role: student
Department: none
```

### IT Admin

```text
Role: admin
Department: IT
```

### Hostel Admin

```text
Role: admin
Department: Hostel
```

Use multiple admins to verify that department filtering works correctly.

---

## Recommended Testing Flow

```text
1. Register student
2. Register IT admin
3. Register Hostel admin
4. Login as student
5. Initialize or create campus rooms and assets as an admin
6. Submit an IT complaint linked to a room or asset
7. Confirm all AI troubleshooting steps before final submission
8. Confirm AI assigns department IT
9. Login as IT admin and confirm the complaint appears
10. Request optional admin AI suggestions
11. Confirm another department admin cannot access the complaint
12. Update the complaint status and add a remark
13. Confirm the student sees the new status and remark
14. Verify infrastructure affected counts exclude resolved complaints
15. Verify Analytics date and location filters
16. Export a filtered CSV from Reports
17. Submit a similar complaint and verify duplicate support behavior
```

---

## Future Improvements

Planned improvements include:

- Email OTP delivery using Nodemailer
- Super administrator account
- Admin approval system
- Admin registration security code
- Complaint reassignment
- Push notifications
- Email notifications
- SMS notifications
- Student profile page
- Administrator profile page
- Real-time updates using Socket.IO
- Advanced semantic duplicate detection
- Complaint escalation
- PDF report export
- Excel/CSV bulk infrastructure import
- SVG-based interactive campus blueprint picker
- Cloud image storage
- MongoDB Atlas deployment
- Frontend deployment
- Backend deployment
- Automated testing
- Dark mode

---

## Known Development Limitation

The OTP is currently displayed in the backend terminal rather than being emailed to the user.

This will be replaced with an email service before production deployment.

---

## Screenshots

Add project screenshots inside a folder such as:

```text
screenshots/
```

Then display them here:

```markdown
### Landing Page

![Landing Page](screenshots/landing-page.png)

### Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

### Create Complaint

![Create Complaint](screenshots/create-complaint.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### Admin Complaint Details

![Admin Complaint Details](screenshots/admin-complaint-details.png)
```

---

## Git Commands

Check changes:

```bash
git status
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Add complete CampusCare AI documentation"
```

Push:

```bash
git push origin main
```

---

## Important Security Notice

Never upload the following files or information to GitHub:

```text
.env
node_modules/
MongoDB passwords
JWT secrets
Groq API keys
Email passwords
Google App Passwords
```

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
uploads/
client/node_modules/
client/dist/
client/.env
```

---

## Author

**Venkat**

M.Sc. Data Science Student  
Andhra Loyola College, Vijayawada

GitHub:

```text
https://github.com/dhamarlavenkat-art
```

---

## Repository

```text
https://github.com/dhamarlavenkat-art/Campuscare-AI
```

---

## Licence

This project is currently intended for educational and academic use.

You may add an MIT Licence later if you want others to use, modify, and distribute the project.

---

## Acknowledgements

- Groq for the AI inference API
- Meta Llama for the language model
- MongoDB for database storage
- Express.js and Node.js for the backend
- React and Vite for the frontend
- Lucide React for interface icons

---

## Project Status

CampusCare AI currently supports the complaint, infrastructure and reporting workflow:

```text
Authentication
        ↓
Room and asset location selection
        ↓
AI complaint analysis and mandatory troubleshooting confirmation
        ↓
Automatic department routing
        ↓
Duplicate complaint support
        ↓
Department-based admin dashboard
        ↓
Infrastructure drill-down, interactive analytics and filtered reports
        ↓
Optional on-demand admin AI suggestions
        ↓
Status and remark updates
        ↓
Student complaint tracking
```

The core application is functional and ready for further testing, deployment preparation, and advanced feature development.
