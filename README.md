# ReachInbox --- Email Outreach & Campaign Scheduler

A full-stack B2B email outreach and campaign-management application
built as a technical assessment project.


## 🔗 Local Development Links

When running the project locally, use these URLs:

| Resource | URL | Purpose |
|---|---|---|
| Frontend | http://localhost:8443 | ReachInbox web application |
| Backend API | http://localhost:3000 | Express backend |
| Health Check | http://localhost:3000/health | Backend health status |
| PostgreSQL | `172.20.150.237:5432` | Local WSL PostgreSQL |
| Redis | `172.20.150.237:6379` | Local WSL Redis |
| Google OAuth Start | http://localhost:3000/api/google/auth | Starts Google OAuth flow when credentials are configured |

> **Note:** `172.20.150.237` is the current WSL2 IP used by this local development setup. WSL IP addresses can change after restarting WSL. Run `hostname -I` inside Ubuntu and update `backend/.env` if the IP changes.

### Browser Links

- **Open the application:** http://localhost:8443
- **Check backend:** http://localhost:3000/health
- **Google OAuth:** http://localhost:3000/api/google/auth

Do not use the WSL IP directly in the browser for the frontend. The frontend is served through `localhost:8443`, while the backend API is served through `localhost:3000`.

## Overview

ReachInbox provides a SaaS-style workspace for managing email accounts,
creating outreach campaigns, managing campaign state, and preparing
multi-step email sequences.

The application is split into:

-   **Frontend:** React + TypeScript + Tailwind CSS
-   **Backend:** Node.js + TypeScript + Express
-   **Database:** PostgreSQL + Prisma ORM
-   **Queue/Cache:** Redis
-   **Email infrastructure:** SMTP account support, Nodemailer/BullMQ
    foundation, Google OAuth flow
-   **Authentication:** JWT + bcrypt password hashing
-   **Development infrastructure:** WSL2 services for PostgreSQL and
    Redis

## Project Structure

``` text
reachinbox-assignment/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── prisma/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Prerequisites

-   Node.js 18+
-   npm
-   PostgreSQL 16
-   Redis 7
-   WSL2 Ubuntu is used for local PostgreSQL and Redis in the current
    development setup.

Docker Compose is included in the original project structure, but the
current local setup uses WSL2 services because Docker Desktop was not
used for the final local run.

## Local Database Setup

### PostgreSQL

Create the database and user:

``` bash
sudo -u postgres psql
```

``` sql
CREATE USER reachinbox WITH PASSWORD 'reachinbox';
CREATE DATABASE reachinbox OWNER reachinbox;
ALTER USER reachinbox CREATEDB;
\q
```

PostgreSQL must accept connections from the Windows host used by the
backend.

### Redis

Start Redis:

``` bash
sudo service redis-server start
redis-cli ping
```

Expected:

``` text
PONG
```

## Backend Environment

Create:

``` text
backend/.env
```

Example local configuration:

``` env
DATABASE_URL="postgresql://reachinbox:reachinbox@<WSL_IP>:5432/reachinbox"

REDIS_HOST=<WSL_IP>
REDIS_PORT=6379

PORT=3000

JWT_SECRET="replace-with-a-development-secret"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"
```

Replace `<WSL_IP>` with the current WSL IP shown by:

``` bash
hostname -I
```

The WSL IP can change after restarting WSL.

## Install & Run Backend

``` bat
cd /d D:\reachinbox-assignment\backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend:

``` text
http://localhost:3000
```

Health check:

``` text
GET http://localhost:3000/health
```

Expected:

``` json
{
  "status": "ok"
}
```

## Run Frontend

``` bat
cd /d D:\reachinbox-assignment\frontend
npm install
npm run dev
```

The development frontend is configured to run at:

``` text
http://localhost:8443
```

The frontend API client communicates with:

``` text
http://localhost:3000
```



## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Frontend tooling | Vite |
| Backend | Node.js, TypeScript, Express |
| Authentication | JWT, bcrypt |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Queue / Cache | Redis 7 |
| Background Jobs | BullMQ foundation |
| Email | Nodemailer / SMTP |
| OAuth | Google OAuth foundation |
| Local Infrastructure | WSL2 Ubuntu |

## Architecture

```text
                           ┌──────────────────────────┐
                           │        User / Browser    │
                           └────────────┬─────────────┘
                                        │
                                        │ HTTP
                                        ▼
                    ┌────────────────────────────────────┐
                    │       React + TypeScript UI        │
                    │          localhost:8443             │
                    │                                    │
                    │  Login / Register                  │
                    │  Dashboard                         │
                    │  Campaigns / Create Campaign       │
                    │  Contacts                          │
                    │  Email Accounts                     │
                    │  Sequences / Scheduled Emails      │
                    │  Analytics / Settings              │
                    └────────────────┬───────────────────┘
                                     │
                                     │ REST API + JWT
                                     ▼
                    ┌────────────────────────────────────┐
                    │       Express + TypeScript API      │
                    │          localhost:3000             │
                    │                                    │
                    │  Routes                             │
                    │      ↓                              │
                    │  Auth / Workspace Middleware        │
                    │      ↓                              │
                    │  Controllers                        │
                    │      ↓                              │
                    │  Services                           │
                    └───────────────┬───────────┬────────┘
                                    │           │
                       Prisma ORM   │           │ Queue / Cache
                                    ▼           ▼
                    ┌────────────────────┐  ┌──────────────────┐
                    │    PostgreSQL      │  │      Redis       │
                    │                    │  │                  │
                    │ Users              │  │ BullMQ foundation│
                    │ Workspaces         │  │ Queue / caching  │
                    │ Email Accounts     │  └────────┬─────────┘
                    │ Contacts           │           │
                    │ Campaigns          │           ▼
                    │ Sequences          │  ┌──────────────────┐
                    │ Scheduled Emails   │  │ Background Worker│
                    │ Email Events       │  │  BullMQ/Node     │
                    └────────────────────┘  └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │ Email Providers  │
                                            │ SMTP / Google    │
                                            │ OAuth + Nodemailer│
                                            └──────────────────┘
```

### Request Flow

A typical authenticated request follows:

```text
Browser
  ↓
React API Client
  ↓
Express Route
  ↓
JWT Authentication Middleware
  ↓
Workspace Access Middleware
  ↓
Controller
  ↓
Service Layer
  ↓
Prisma ORM
  ↓
PostgreSQL
  ↓
JSON Response
  ↓
React UI
```

For asynchronous email processing, the intended flow is:

```text
Campaign / Scheduled Email
        ↓
      Redis
        ↓
     BullMQ
        ↓
 Background Worker
        ↓
 Nodemailer / Provider
        ↓
 Email Event
        ↓
 PostgreSQL
        ↓
 Analytics / Campaign Activity
```

> The second flow represents the implemented infrastructure/data-model foundation and intended extension path. The complete production scheduling, provider-event ingestion and analytics pipeline is not fully wired in the current demo build.

## Authentication

Implemented:

-   User registration
-   User login
-   Password hashing using bcrypt
-   JWT authentication
-   Bearer-token authentication middleware
-   Authenticated API requests
-   Workspace access checks
-   Google OAuth backend/frontend flow foundation

The application stores the JWT in browser local storage for the current
development implementation.

## Workspace Management

Implemented:

-   Authenticated workspace access
-   Workspace creation
-   Workspace listing
-   Workspace selection
-   Workspace persistence in local storage
-   Automatic creation of a workspace when a newly registered user has
    no workspace

The current development workspace can be selected from the application
shell.

## Dashboard

The dashboard provides the ReachInbox SaaS-style overview UI.

It includes:

-   Outreach KPI cards
-   Email activity visualization
-   Campaign performance area
-   Upcoming scheduled emails area
-   Recent activity area
-   Workspace/application navigation

### Current limitation

The dashboard analytics currently contain presentation/mock values
rather than being fully calculated from real email-event data.

The UI target includes metrics such as:

-   Emails Sent
-   Emails Scheduled
-   Active Campaigns
-   Reply Rate

These are design/demo values until the complete email-event analytics
pipeline is connected.

## Campaigns

Campaign API support is implemented.

Supported operations:

-   Create campaign
-   List campaigns
-   Get campaign
-   Update campaign
-   Delete campaign
-   Campaign status management
-   Workspace-level campaign access
-   Sender/email-account validation

Campaigns are persisted in PostgreSQL through Prisma.

The campaign list UI supports:

-   Search
-   Status filtering
-   Pagination
-   Campaign status changes
-   Delete action
-   Backend loading/error states

## Create Campaign

The campaign creation screen follows the intended multi-step product
workflow:

1.  Campaign Details
2.  Audience
3.  Sequence
4.  Schedule
5.  Review

Implemented backend persistence includes:

-   Workspace
-   Campaign name
-   Description
-   Sender/email account
-   Timezone
-   Scheduled start time
-   Campaign status

The sender dropdown is populated from connected email accounts.

### Current limitation

The current campaign creation UI still uses mock contact/sequence data
for parts of the wizard.

The following fields are currently UI/demo level rather than completely
persisted into campaign records:

-   Selected audience/contact assignments
-   Full sequence step content
-   Sending days
-   Daily sending limit
-   Minimum delay

The Prisma schema already contains the foundation for contacts,
sequences, sequence steps, campaign enrollments and scheduled emails.

## Email Accounts

Implemented:

-   Email Accounts page
-   Load connected accounts from backend
-   Connect Email modal
-   SMTP account creation
-   SMTP host
-   SMTP port
-   SMTP username
-   SMTP password/app password
-   Account status
-   Pause/resume
-   Remove account
-   Daily sending limit display
-   Sent-today display
-   Last activity display
-   Account usage indicator
-   Google/Gmail OAuth redirect flow

SMTP accounts are persisted in PostgreSQL.

For SMTP providers, use provider-specific SMTP credentials. For Gmail,
an App Password may be required when the account uses 2-Step
Verification.

### Google OAuth

The application contains the Google OAuth route and frontend redirect
flow.

Google OAuth requires valid Google Cloud OAuth credentials in `.env`
before it can be used end-to-end.

## Contacts

The database schema supports workspace contacts with:

-   Email
-   First name
-   Last name
-   Company
-   Job title
-   Workspace relationship

Contacts can participate in campaign enrollments and scheduled emails
through the relational model.

### Current limitation

The complete Contacts CRM workflow is not the primary completed demo
path in the current implementation, and the campaign audience currently
uses mock UI data.

## Sequences

The Prisma schema supports:

-   Sequence
-   Sequence steps
-   Step ordering
-   Delay
-   Subject
-   HTML body
-   Text body
-   Campaign relationship

The intended product workflow supports multi-step outreach such as:

``` text
Step 1 — Immediately
Step 2 — Wait 2 days
Step 3 — Wait 4 days
```

Variables supported by the UI design include:

``` text
{{firstName}}
{{company}}
{{title}}
```

### Current limitation

The complete sequence-management/editor persistence workflow is not
fully connected to the UI yet.

## Scheduled Emails

The data model supports scheduled emails with relationships to:

-   Workspace
-   Email account
-   Campaign
-   Contact
-   Campaign enrollment
-   Sequence step

Statuses include:

-   PENDING
-   QUEUED
-   SENT
-   FAILED
-   CANCELLED

### Current limitation

The complete scheduled-email UI and end-to-end scheduling pipeline are
not fully connected in the current demo build.

## Email Events

The Prisma model includes email events associated with scheduled emails.

The intended event lifecycle is:

``` text
Scheduled → Queued → Sent → Opened → Replied
```

Failure information and retry state are also part of the intended
workflow.

### Current limitation

The complete provider webhook/event ingestion and analytics pipeline are
not fully implemented in the current demo.

## Analytics

The intended analytics experience includes:

-   Sent
-   Delivered
-   Open Rate
-   Reply Rate
-   Bounce Rate
-   Emails sent over time
-   Open-rate chart
-   Reply-rate chart
-   Campaign comparison
-   Campaign performance table
-   Date range filtering
-   Campaign filtering
-   Sender filtering

### Current limitation

The full analytics pipeline is not yet connected to real email events.
Dashboard/analytics presentation currently uses demo/mock values where
applicable.

## API Overview

### Authentication

``` text
POST /api/auth/register
POST /api/auth/login
```

### Workspaces

``` text
GET    /api/workspaces
GET    /api/workspaces/:id
POST   /api/workspaces
PATCH  /api/workspaces/:id
DELETE /api/workspaces/:id
```

### Campaigns

``` text
POST   /api/campaigns
GET    /api/campaigns
GET    /api/campaigns/:id
PATCH  /api/campaigns/:id
DELETE /api/campaigns/:id
```

### Email Accounts

``` text
POST   /api/email-accounts
GET    /api/email-accounts
GET    /api/email-accounts/:id
PATCH  /api/email-accounts/:id
DELETE /api/email-accounts/:id
```

### Google OAuth

``` text
GET /api/google/auth
GET /api/google/callback
```

### Health

``` text
GET /health
```

## Database Model

The Prisma schema contains the core relational entities:

``` text
User
  ↓
Workspace
  ├── EmailAccount
  ├── Contact
  └── Campaign
        ├── Sequence
        │     └── SequenceStep
        ├── CampaignEnrollment
        │     └── Contact
        └── ScheduledEmail
              ├── Contact
              ├── EmailAccount
              ├── CampaignEnrollment
              └── SequenceStep

ScheduledEmail
  └── EmailEvent
```

## Background Jobs / Email Sending

The backend includes the foundation for:

-   BullMQ
-   Redis
-   Nodemailer
-   Worker process
-   Scheduled-email processing

The final end-to-end production email automation flow is not yet
presented as fully completed in this demo build.

## Security Considerations

-   Passwords are hashed using bcrypt.
-   API routes use JWT authentication where required.
-   Workspace access is checked before workspace-scoped resources are
    accessed.
-   Email account credentials should never be committed to Git.
-   `.env` should remain local and be excluded from version control.
-   Never share real SMTP passwords, App Passwords, JWTs or OAuth
    secrets in screenshots or the submission video.
-   Google OAuth should use properly configured redirect URIs and
    production secrets outside local development.


## GitHub Setup

After cloning the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd reachinbox-assignment
```

Install backend dependencies:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Then start PostgreSQL and Redis in WSL and run the backend/frontend in separate terminals.

### Recommended Repository Files

Make sure the repository contains:

```text
backend/
frontend/
docker-compose.yml
README.md
.gitignore
```

Do **not** commit:

```text
backend/.env
frontend/.env
node_modules/
dist/
```

If environment files are needed by other developers, provide `.env.example` files with placeholder values only.

### Submission Repository Checklist

Before pushing to GitHub:

- [ ] `README.md` is present
- [ ] `.gitignore` is present
- [ ] No `.env` files are committed
- [ ] No passwords or App Passwords are committed
- [ ] No JWT tokens are committed
- [ ] No Google OAuth secrets are committed
- [ ] Backend installation works with `npm install`
- [ ] Frontend installation works with `npm install`
- [ ] Prisma client can be generated
- [ ] Database migrations are available
- [ ] `/health` returns `{ "status": "ok" }`
- [ ] Frontend opens at `http://localhost:8443`
- [ ] Backend runs at `http://localhost:3000`

## Troubleshooting

### Backend cannot connect to PostgreSQL

Check WSL:

``` bash
sudo service postgresql status
```

Check WSL IP:

``` bash
hostname -I
```

From Windows:

``` powershell
Test-NetConnection <WSL_IP> -Port 5432
```

### Backend cannot connect to Redis

Check:

``` bash
sudo service redis-server status
```

Check:

``` bash
redis-cli ping
```

Expected:

``` text
PONG
```

From Windows:

``` powershell
Test-NetConnection <WSL_IP> -Port 6379
```

Both PostgreSQL and Redis should report:

``` text
TcpTestSucceeded : True
```

### WSL IP changed

Update `backend/.env`:

``` env
DATABASE_URL="postgresql://reachinbox:reachinbox@<NEW_WSL_IP>:5432/reachinbox"
REDIS_HOST=<NEW_WSL_IP>
REDIS_PORT=6379
```

Then restart the backend:

``` bat
cd /d D:\reachinbox-assignment\backend
npm run dev
```

## Recommended Demo Flow

For a clean assessment demonstration:

1.  Open ReachInbox.
2.  Register a new account.
3.  Login.
4.  Show the workspace/dashboard.
5.  Open Email Accounts.
6.  Connect an SMTP email account.
7.  Show the connected account and account status.
8.  Open Campaigns.
9.  Create a new campaign.
10. Select the connected sender.
11. Walk through Audience, Sequence, Schedule and Review.
12. Save Draft or Launch Campaign.
13. Return to Campaigns and show the persisted campaign.
14. Demonstrate campaign status change.
15. Demonstrate delete only if needed.
16. Briefly show the other navigation sections and explain which
    workflows are implemented versus still UI/data-model foundations.

## Assessment Notes

The application is intentionally structured as a real SaaS product
rather than a single static dashboard. The architecture separates:

-   UI
-   API client
-   Express routes/controllers/services
-   Authentication middleware
-   Workspace authorization
-   Prisma data models
-   PostgreSQL persistence
-   Redis infrastructure
-   Email account integrations
-   Background-job foundation

The current build demonstrates the core authenticated workspace +
email-account + campaign workflow while retaining clear extension points
for the remaining scheduling, sequence, contact, event and analytics
pipelines.

## License

This project was created for technical assessment / demonstration
purposes.
