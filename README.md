# Visitor Management System

A full-stack web application designed to digitize and simplify visitor registration, 
approval, check-in, check-out, and monitoring within an organization.

---

# Overview

The Visitor Management System replaces traditional paper-based visitor registers 
with a centralized digital platform for managing visitors throughout their visit lifecycle.
The system allows organizations to register visitors, manage approvals, track visitors inside 
the facility, process QR-based check-in and check-out, and maintain records of visitor activities.
The application consists of a React frontend, a Node.js/Express backend, and a MongoDB database.

# Problem Statement
Traditional visitor management processes can make it difficult to:

* Track visitors currently inside a facility.
* Maintain accurate visitor records.
* Confirm visitor approvals.
* Record check-in and check-out times.
* Retrieve historical visitor information.
* Monitor visitor activity.
* Maintain accountability for visitor-related activities.

The Visitor Management System addresses these challenges by providing a structured digital 
solution for managing visitors.

# Project Objectives
The system was developed to:
* Digitize visitor registration and management.
* Store visitor information securely.
* Provide a visitor approval workflow.
* Enable QR-code-based check-in and check-out.
* Track visitor status and activity.
* Provide administrative dashboard information.
* Implement authentication and role-based authorization.
* Maintain audit records of important activities.
* Provide email notifications.
* Improve system security through rate limiting.
* Automatically process visitors who remain checked in after midnight.
* Support real-time communication.

# Key Features
# 1. Visitor Registration

The system captures important visitor information including:

* Visitor name
* Mobile number
* Address
* Person to be visited
* Purpose of visit
* Date of visit
* Email address

Each visitor receives a unique visitor ID.

Example:

```text
VID-0001
VID-0002
VID-0003
```

# 2. Visitor Approval

Visitors move through an approval process with the following statuses:

```text
Pending Approval
Approved
Rejected
Checked In
Checked Out
```

# 3.  QR Check-In and Check-Out

QR-code functionality allows visitors to be checked in and checked out electronically.

# 4. Dashboard

Authorized users can view important visitor statistics, including:

* Visitors currently inside.
* Pending approvals.
* Expected visitors.
* Completed check-outs.

# 5.  Audit Logging

Important visitor activities are recorded to provide accountability and traceability.

# 6. Email Notifications

The backend integrates with Resend to support email notifications during relevant visitor workflows.

# 7. Automated Check-Out

A scheduled process automatically checks out visitors who remain marked as checked in after midnight.

# 8. Real-Time Communication

Socket.IO is integrated to support real-time communication between the backend and connected clients.


# User Roles
The system supports three main roles:

# - Guard
Responsible for operational visitor-related activities and monitoring.

# - Admin
Has access to protected administrative functionality and dashboard information.

# - SuperAdmin
Has the highest level of administrative access within the system.


## Visitor Workflow
The visitor process follows:

Registration
     ↓
Pending Approval
     ↓
Approved / Rejected
     ↓
Checked In
     ↓
Checked Out

This provides a clear record of the visitor's progress from registration to departure.

# Technology Stack
# - Frontend
* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Zustand
* React Hook Form
* Zod
* TanStack React Query
* Lucide React

# - Backend
* Node.js
* Express.js
* JavaScript
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* Socket.IO
* Node-Cron
* Resend
* Express Rate Limit
* QRCode

# - Database
* MongoDB

# Development Tools
* Git
* GitHub
* Postman
* Visual Studio Code

# System Architecture
The application follows a client-server architecture:
        ┌──────────────────────┐
        │    React Frontend    │
        │  TypeScript / Vite   │
        └──────────┬───────────┘
                   │
                   │ REST API
                   ▼
        ┌──────────────────────┐
        │   Node.js / Express  │
        │      Backend         │
        └──────────┬───────────┘
                   │
             ┌─────┴─────┐
             │           │
             ▼           ▼
      ┌────────────┐  ┌──────────────┐
      │  MongoDB   │  │ External     │
      │  Database  │  │ Services     │
      └────────────┘  │ Resend       │
                      │ Socket.IO    │
                      └──────────────┘
The frontend communicates with the backend through REST APIs. The backend handles application logic,
authentication, authorization, database operations, and supporting services.


# Project Structure
VisitorManagementApp/
│
├── Backend/
│   ├── authModule/
│   ├── controllers/
│   ├── dashboardmodule/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── settings/
│   ├── sockets/
│   ├── cjobs/
│   └── app.js
│
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── styles/
│   │   └── types/
│   └── ...
│
├── README.md
└── .gitignore

# Backend
The backend is built with Node.js and Express.js and provides the APIs responsible for:
* Authentication.
* Visitor registration.
* Visitor approval and rejection.
* Visitor check-in and check-out.
* Visitor reports.
* Dashboard metrics.
* Database operations.
* Audit logging.
* Email notifications.
* Automated visitor processing.
* Real-time communication.
The backend is organized into separate modules for authentication, visitors, dashboard functionality,
database models, middleware, scheduled jobs, and sockets.

# Frontend
The frontend is built with React, TypeScript, and Vite.
It provides the user interface through which users interact with the Visitor Management System.
The frontend includes:
* Application pages.
* Reusable components.
* Navigation.
* API communication.
* Form handling.
* Client-side validation.
* Loading and error states.
* Responsive design.
Tailwind CSS is used for styling.

# Authentication and Authorization
The system uses JSON Web Tokens (JWT) for authentication.
During login:
1. The user's credentials are received.
2. The password is compared with the stored bcrypt hash.
3. A JWT is generated after successful authentication.
4. The token is used to access protected resources.

Protected requests use:
Authorization: Bearer <token>
Role-based authorization ensures that users can only access functionality permitted for their role.

# Database
MongoDB is used as the application's database, with Mongoose handling database modelling and interaction.

The major database models include:
# Users- Stores user accounts, passwords, and roles.
# Visitors- Stores visitor information, status, check-in details, and check-out details.
# Audit Log - Stores records of important system activities.
# Counter - Supports sequential visitor ID generation.

# API Endpoints
The backend API is organized under:
/VMS/version1

# Authentication
| Method | Endpoint         | Purpose             |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Register a user     |
| POST   | `/auth/login`    | Authenticate a user |

# Visitors
| Method | Endpoint                  | Purpose                   |
| ------ | ------------------------- | ------------------------- |
| GET    | `/visitors/`              | Retrieve visitors         |
| POST   | `/visitors/`              | Register a visitor        |
| GET    | `/visitors/checkUser`     | Check visitor information |
| GET    | `/visitors/report`        | Retrieve visitor reports  |
| GET    | `/visitors/approve/:id`   | Approve a visitor         |
| GET    | `/visitors/reject/:id`    | Reject a visitor          |
| POST   | `/visitors/scan-checkin`  | Process QR check-in       |
| POST   | `/visitors/scan-checkout` | Process QR check-out      |

# Dashboard
| Method | Endpoint              | Purpose                       |
| ------ | --------------------- | ----------------------------- |
| GET    | `/dashboard/metrics`  | Retrieve dashboard statistics |
| GET    | `/dashboard/timeline` | Retrieve recent activity      |

# Security
The application includes several security measures:
* **bcrypt** for password hashing.
* **JWT** for authentication.
* **Role-based authorization** for protected resources.
* **Rate limiting** to control excessive API requests.
* **Environment variables** for sensitive configuration.
* **Input validation** and error handling.
* **Audit logging** for important activities.

# Audit Logging
The system records important activities including:
VISITOR_REGISTERED
VISITOR_APPROVED
VISITOR_REJECTED
VISITOR_CHECK_IN
VISITOR_CHECK_OUT
SYSTEM_AUTO_CHECKOUT
Audit records improve accountability and provide a history of significant visitor activities.

# Automated Visitor Check-Out
The backend uses Node-Cron to run a scheduled process at midnight.
Visitors who are still marked as:

Checked In - can be automatically changed to: Checked Out
The automated action is also recorded in the audit logs.

# Real-Time Communication
Socket.IO is integrated into the backend to support real-time communication.
The socket layer manages client connections and provides a foundation for real-time visitor and dashboard updates.

# Team Members and Contributions
The project was developed collaboratively by six team members across backend development, frontend development, and frontend-backend integration.

| Team Member                   | Email                                                                   | Primary Area                 |
| ----------------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| **Victor Daramola**           | [adextoomuch@gmail.com](mailto:adextoomuch@gmail.com)                   | Backend Development          |
| **Oluwatoyosi Adetutu Isa**   | [isatoyosi@gmail.com](mailto:isatoyosi@gmail.com)                       | Backend Development          |
| **Remigius Mgbeme**           | [garethremigius@gmail.com](mailto:garethremigius@gmail.com)             | Frontend Development         |
| **Christopher Dung Jacob**    | [jacobchristopher2570@gmail.com](mailto:jacobchristopher2570@gmail.com) | Frontend Development         |
| **Adepegba Idris Olanrewaju** | [idriskinzeme@gmail.com](mailto:idriskinzeme@gmail.com)                 | Frontend–Backend Integration |
| **Anifowose Kolade**          | [koladeanifowose205@gmail.com](mailto:koladeanifowose205@gmail.com)     | Frontend–Backend Integration |

# Victor Daramola — Backend Development
Contributed to the server-side development of the application, including backend structure, Express routes and controllers,
visitor management operations, MongoDB/Mongoose database interaction, API development, validation, error handling, debugging,
and backend testing.

# Oluwatoyosi Adetutu Isa — Backend Development
Contributed to backend development, including visitor management workflows, authentication and authorization, JWT security,
QR check-in and check-out, audit logging, rate limiting, email services, Socket.IO, scheduled jobs, debugging, API testing,
and project documentation.

# Remigius Mgbeme — Frontend Development
Contributed to the React frontend, including application pages, reusable components, navigation, TypeScript, Vite,
Tailwind CSS, responsive design, user interactions, and frontend loading and error handling.

# Christopher Dung Jacob — Frontend Development
Contributed to frontend pages, layouts, components, navigation, styling, responsiveness, user interactions, and refinement of
the application's user interface.

# Adepegba Idris Olanrewaju — Frontend–Backend Integration
Worked on connecting frontend components to backend APIs, handling client-server communication and data exchange, supporting
authentication-related communication, testing integrated features, and troubleshooting integration issues.

# Anifowose Kolade — Frontend–Backend Integration

Contributed to API connectivity, frontend-backend communication, integrated workflows, data handling, testing, and 
troubleshooting issues between the frontend and backend.

# Although members had different primary responsibilities, the project was developed collaboratively. The backend team developed 
the server-side functionality, the frontend team developed the user interface, and the integration team connected and tested the 
different application layers.

## Future Improvements
Potential improvements include:
* Visitor photo and identification verification.
* Digital visitor badges.
* SMS notifications.
* Advanced reporting and analytics.
* CSV/PDF report export.
* Password reset and multi-factor authentication.
* More granular user permissions.
* Automated testing.
* Enhanced QR-code security.
* Expanded real-time dashboard functionality.

# Conclusion
The Visitor Management System provides a digital solution for managing visitors from registration and approval through check-in and check-out.
The project demonstrates practical application of full-stack development concepts including:
* REST API development.
* React frontend development.
* MongoDB database management.
* Authentication and authorization.
* Role-based access control.
* QR-code processing.
* API security.
* Audit logging.
* Real-time communication.
* Scheduled background processes.
* Frontend-backend integration.

The system provides a foundation for improving visitor tracking, operational efficiency, accountability, 
and security within organizations.

# Project Repository

[Visitor Management System — GitHub](https://github.com/adextoomuch/VisitorManagementApp)
