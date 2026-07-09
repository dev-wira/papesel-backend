# Papesel

A backend API for freelance developers to manage client projects with built-in **scope-creep protection**.

Every requirement a client submits is version-controlled. Once a dev reviews a requirement, any future edit creates a new version instead of silently overwriting the old one — giving both sides a clear, auditable trail of what was actually asked for, when it changed, and who approved what. No more "but I never asked for that."

## 🔗 Live API Docs

Interactive Swagger documentation: **[papesel-backend.onrender.com/api-docs](https://papesel-backend.onrender.com/api-docs)**

## Why Papesel

Freelancers routinely deal with clients who change requirements mid-project without acknowledging the change, leading to disputes over scope and payment. Papesel solves this by making every requirement change explicit, versioned, and gated behind a review step — the same discipline seen in code review, applied to client requirements.

## Core Concepts

- **Two roles:** `dev` (freelancer, owns projects) and `client` (invited by a dev, owns requirements)
- **Invite-only clients** — a dev invites a client by email; the client accepts via a time-limited link and sets their own password
- **Review-gated updates** — a client's requirement enters `pending` status on every edit; they cannot edit it again until the dev reviews (approves/rejects) it
- **Full version history** — every update archives the previous version before applying the new one, so nothing is ever silently overwritten
- **Ownership enforcement** — a dev can only create projects for clients they personally invited; verified/role checks prevent id-spoofing between accounts

## Tech Stack

- **Runtime:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Caching / OTP store:** Upstash Redis
- **Auth:** JWT via `httpOnly` cookies
- **Docs:** OpenAPI 3.0 (Swagger UI)
- **Deployment:** Render

---

## API Reference

All protected routes use an `httpOnly` cookie (`auth_token`) set on login/verification — not a Bearer token. Role restrictions are enforced server-side via middleware.

### User Routes (`/user`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/user/signup` | — | — | Registers a new dev account and emails a 6-digit OTP for verification. Fails if the email is already registered. |
| POST | `/user/verify` | — | — | Verifies the OTP sent during signup. On success, marks the account verified, sets the `auth_token` cookie, and logs the user in. |
| POST | `/user/login` | — | — | Logs in an existing, verified user (dev or client) with email + password. Sets the `auth_token` cookie. |
| GET | `/user/resend-otp` | — | — | Resends a fresh OTP to the given email. Rate-limited with a 60-second cooldown to prevent spam. |
| POST | `/user/create-client` | ✅ | `dev` | Invites a new client by name + email. Creates an unverified client account with a random password and emails a time-limited (1 hour) invite link. Records which dev invited the client. |
| GET | `/user/my-clients` | ✅ | `dev` | Returns the list of clients invited by the authenticated dev (name + email only). |
| DELETE | `/user/delete-client/:client` | ✅ | `dev` | Deletes a client account — only if that client was invited by the authenticated dev. |
| POST | `/user/forgot-password` | — | — | Emails a password reset link (1 hour expiry) to the given address. |
| PATCH | `/user/update-password/:token` | — | — | Resets the password using the token from the invite/reset email. If the account was unverified, this also marks it verified — this is how a client "accepts" their invite. |
| POST | `/user/log-out` | ✅ | — | Clears the `auth_token` cookie, ending the session. |

### Project Routes (`/project`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/project/create-project` | ✅ | `dev` | Creates a new project for a client. Validates that the client exists, is verified, has the `client` role, and was invited by this dev before allowing creation. |
| GET | `/project/my-projects` | ✅ | any | Returns all projects belonging to the authenticated user (as dev-owner or as client). |
| POST | `/project/add-requirement` | ✅ | `client` | Adds a new requirement (title + description) to one of the client's projects. |
| PATCH | `/project/update-requirement/:requirement` | ✅ | `client` | Updates a requirement's title/description. Archives the current version into requirement history first. Blocked while the requirement's status is `pending` (i.e., awaiting dev review). |
| GET | `/project/get-requirements/:project` | ✅ | any | Lists all requirements under a given project. |
| GET | `/project/get-requirement-versions/:requirement` | ✅ | any | Returns the full version history of a requirement, most recent first. |
| PATCH | `/project/review-requirement/:requirement` | ✅ | `dev` | Approves or rejects a pending requirement, unlocking it for the client to edit again. |
| GET | `/project/get-pending-requirements/:project` | ✅ | any | Lists all requirements in a project currently awaiting dev review. |

---

## Suggested Testing Flow

1. **Sign up** as a dev — `POST /user/signup`, then verify — `POST /user/verify` (sets auth cookie)
2. **Invite a client** — `POST /user/create-client`
3. **Client accepts the invite** — `PATCH /user/update-password/{token}` (token from their email)
4. **Log in as the client** — `POST /user/login`
5. **Dev creates a project** for that verified client — `POST /project/create-project`
6. **Client adds a requirement** — `POST /project/add-requirement`
7. **Dev checks what's pending** — `GET /project/get-pending-requirements/{project}`
8. **Dev reviews it** — `PATCH /project/review-requirement/{requirement}`
9. **Client updates it again** now that review has cleared — `PATCH /project/update-requirement/{requirement}`
10. **Anyone on the project can view history** — `GET /project/get-requirement-versions/{requirement}`

## Getting Started (local dev)

```bash
git clone https://github.com/<your-username>/papesel.git
cd papesel/backend
npm install
cp .env.example .env   # then fill in your own values
```

Run the server:
```bash
npm run GOD   # nodemon
# or
npm start
```

Visit `http://localhost:3000/api-docs` for interactive documentation.


## License

This project is proprietary. All rights reserved. The source code is publicly visible for portfolio/demonstration purposes only. No permission is granted to use, copy, modify, or distribute this code without explicit written consent from the author.

## Author

Built solo by Rahul — a backend-focused SaaS exploring how software can enforce process discipline (scope control, review gating) rather than just store data.
