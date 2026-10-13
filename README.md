# Resource Reservation Management System

An internship assessment project using Next.js App Router, TypeScript, and (in the next stage) PostgreSQL.

## Current status

Step 1 complete: project scaffold and introductory home page. Bookings and database persistence are not implemented yet.

## Run locally

Requirements: Node.js 20.9+ and npm.

```powershell
cd "D:\My\Job Assessment\resource-reservation"
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

## Checks

```powershell
npm.cmd run lint
npm.cmd run build
```

## Learn the structure

- `src/app/page.tsx`: the home page at `/`.
- `src/app/layout.tsx`: the shared HTML shell and page metadata.
- `src/app/globals.css`: shared styling and Tailwind import.
- `public/`: static files such as images.
- `package.json`: dependencies and commands.
- `package-lock.json`: exact dependency versions for reproducible installs.
- `docs/implementation-plan.md`: proposed scope and development stages.

Never commit database passwords or `.env` files.
