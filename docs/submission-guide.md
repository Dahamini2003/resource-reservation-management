# Step 7: Prepare and submit

## What is ready locally

The working app, setup README, SQL migrations/seeds, verification scripts, ER diagram (Markdown/Mermaid and SVG), learning walkthroughs, and this demo script.

The GitHub upload, shareable diagram URL, video recording/upload, and official form submission still need to be completed. A local file path is not a shareable link.

## Understand Git and GitHub

Git stores snapshots called commits on your computer. GitHub hosts the repository online so reviewers can access those commits. A remote called `origin` points your local repository to its GitHub destination. A push uploads your commits; it does not upload your PostgreSQL database.

Before uploading, verify `.env.local`, `node_modules`, and `.next` are excluded. `.env.example` must contain placeholders only. The README lets a reviewer recreate the database from migrations and seed data rather than needing your local database files.

## Create a repository if needed

1. Sign in to GitHub and choose **New repository**.
2. Suggested name: `resource-reservation-management`.
3. Choose visibility that gives the assessment reviewers access.
4. Leave automatic README, license, and gitignore creation unchecked because this local project already contains files and history.
5. Create the repository and copy its HTTPS URL.
6. Provide the URL in chat so we can configure the correct destination and upload. Do not share passwords or access tokens in chat.

## Share the ER diagram

Open `docs/er-diagram.md` on GitHub after pushing and copy that page's URL. Confirm the reviewers can view it. Alternatively, upload `docs/er-diagram.svg` to a sharing service and give the reviewers viewer access. Include that accessible URL in the submission form.

## Demo script: approximately 4 minutes 30 seconds

Use a future date and a fresh resource name, such as `Demo Meeting Room`, to avoid existing bookings. Use demo details like `Demo User` and `demo@example.com`. Keep terminal environment files and passwords off screen.

| Time | Show | Explain in your own words |
| --- | --- | --- |
| 0:00-0:25 | Home and Resources | The organization needs one place to manage shared rooms/equipment, availability, and reservations. |
| 0:25-0:55 | Add a fresh demo resource; edit its location | Resource details are persistent in PostgreSQL. |
| 0:55-1:35 | Create a future booking, 10:00-11:00 | The server validates requester details and time ranges. All times use Sri Lanka time. |
| 1:35-2:05 | Attempt 10:30-11:30 for the same resource | The database rejects overlap, including simultaneous requests. Explain the friendly conflict message. |
| 2:05-2:35 | Check availability for 10:30-11:30 | The booked resource is excluded. Adjacent bookings, such as 11:00-12:00, are permitted. |
| 2:35-3:05 | Cancel the original booking | It moves into history; the same availability filter now includes the resource. |
| 3:05-3:30 | Mark the resource inactive, then reactivate | Inactive resources cannot receive new bookings; existing history is preserved. |
| 3:30-4:10 | ER diagram and relevant constraint/README | One resource has many reservations. Next.js Server Actions use parameterized SQL. The GiST exclusion constraint prevents races. |
| 4:10-4:30 | README verification commands | Mention validation and concurrent-booking tests. Explain the local trusted-user scope and that accounts/roles are future work. |

Record your screen and your own explanation using a tool you already know. Play the recording back to check readability, audio, and a 3-5 minute duration. Upload it and test viewer access before submitting. The recording itself is not created by this guide.

## Questions to practice answering

- Why must overlap prevention happen in PostgreSQL as well as in the UI?
- How do `[)` time ranges allow adjacent bookings?
- What is the relationship between resource and reservation?
- Why cancel/deactivate instead of delete?
- How does the application interpret datetime-local input?
- What does a parameterized SQL query protect against?
- What changes would you make before public deployment?

## Final checklist

- [ ] GitHub repository contains the current source and README; reviewer access verified.
- [ ] A fresh checkout can be set up using only README instructions.
- [ ] ER diagram link is accessible to reviewers.
- [ ] Demo is 3-5 minutes and its link works for reviewers.
- [ ] `lint`, `test:booking`, `db:test`, `db:test-concurrency`, and `build` pass.
- [ ] `.env.local` is excluded and `.env.example` contains no real credentials.
- [ ] Submit through the official assessment form using the same email as the original internship application.

The assessment deadline is **15 October 2026, 11:59 PM Sri Lanka time (UTC+05:30)**. Use the official form URL in the assessment PDF; verify all requested fields there before submitting.
