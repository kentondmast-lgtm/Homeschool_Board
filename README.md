# Homeschool Board

A wall-mounted assignment board for the kitchen iPad, synced live with a
parent-admin view on mom's iPad.

- `server/` — Express + WebSocket backend. Holds the shared state (students,
  tasks, family board) in `server/data.json` and pushes updates to every
  connected client the moment anything changes.
- `client/` — React + Vite frontend with two routes:
  - `/` — the wall display (clock, student tabs, today/week/month views,
    family board, PIN-gated editing). Meant to run full-screen on the wall
    iPad. Its `1234` PIN is a client-side "kid lock," not real security.
  - `/admin` — the admin view for adding/checking off tasks and family board
    items, sized for a phone/iPad.

In production the backend also serves the built frontend directly (see
`server/index.js`), so it's one process on one port — no separate dev
servers needed.

### Admin login (optional, recommended once this leaves your home network)

If the environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD` are both
set, the server requires that login (HTTP Basic Auth) to open `/admin` or to
make any change (add/edit/delete a task or family item) from either view —
viewing stays open. If they're unset, editing is wide open to anyone who can
reach the server, which is the current setup on the home LAN deployment
below. **Always set these before deploying anywhere reachable from the
public internet.** The first time the wall iPad tries to add/delete/check
off something, its browser will prompt for this login once and then
remember it.

## Live deployment

This runs on Render at **https://homeschool-board.onrender.com** — reachable
from anywhere, not just the home WiFi. `ADMIN_USERNAME`/`ADMIN_PASSWORD` are
set there, so `/admin` and all edits require that login (viewing the wall
display does not).

- Wall display: `https://homeschool-board.onrender.com/`
- Admin: `https://homeschool-board.onrender.com/admin`

### Setting up the wall iPad

For a true fullscreen kiosk look (no Safari address bar at all):

1. Rotate the iPad to landscape, open Safari to the wall display URL above.
2. **Share → Add to Home Screen** → name it → Add.
3. Launch it from that **home screen icon**, not from Safari — this opens
   fullscreen with no browser chrome.
4. Lock the orientation: open Control Center (swipe down from the top-right
   corner) and tap the orientation-lock icon while the iPad is already
   sitting in landscape — despite being labeled "Portrait Orientation
   Lock," it just freezes whichever orientation you're currently in.
5. Plug the iPad in and disable auto-lock: **Settings → Display & Brightness
   → Auto-Lock → Never**.
6. Optionally, turn on **Guided Access** so it can't be swiped away to the
   home screen or into another app: **Settings → Accessibility → Guided
   Access → On**, set a passcode there (separate from the board's own
   `1234` PIN), then triple-click the side/top button while the board is
   open to start it.

### Setting up mom's iPad

1. Open Safari to the admin URL above. It'll prompt for the
   `ADMIN_USERNAME`/`ADMIN_PASSWORD` login once — Safari can save it in
   Keychain so it only asks the first time.
2. Tap **Share → Add to Home Screen**. It'll launch full-screen without
   Safari's address bar, like a regular app.

## Deploying to Render (reference — already done above)

These are the steps that were followed to stand up the live deployment
above. Keeping them here for redeploying from scratch (a new Render service,
a fork, etc.) rather than as something to redo.

1. **Push this project to GitHub** (needs your GitHub account):
   ```bash
   git remote add origin https://github.com/<your-username>/homeschool-board.git
   git branch -M main
   git push -u origin main
   ```
   (Create the empty repo first at github.com/new — don't initialize it with
   a README, or the push above will need `git pull --rebase` first.)

2. **Create a Render account** at [render.com](https://render.com) (needs
   your own sign-up/billing — the always-on tier that avoids spin-down is
   ~$7/month).

3. **New → Web Service → connect your GitHub repo.**

4. Configure it:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Starter (or higher) — the free tier spins down when
     idle, which means a slow first load and dropped WebSocket connections.

5. **Add a persistent disk** (Render dashboard → your service → Disks):
   mount path `/var/data`, 1 GB is plenty.

6. **Environment variables** (Render dashboard → Environment). `DATA_DIR` is
   an exact value to copy in as-is. `ADMIN_USERNAME` and `ADMIN_PASSWORD` are
   **not** — the text on the right below is a description of what to invent,
   not something to paste in literally. Make up your own private
   username/password and type those in instead:

   | Key | Value |
   |---|---|
   | `DATA_DIR` | `/var/data` (copy this in exactly) |
   | `ADMIN_USERNAME` | ⚠️ invent your own — do not use this cell's text |
   | `ADMIN_PASSWORD` | ⚠️ invent your own — do not use this cell's text |

   Don't set `PORT` — Render sets it for you, and the app already honors it.

7. Deploy. Render gives you an HTTPS URL like
   `https://homeschool-board.onrender.com` — use that plus `/admin` on the
   two iPads instead of the LAN IP.

After this, redeploying is just `git push` — Render rebuilds and restarts
automatically.

## Retired: local Windows service

Before Render, this ran as an always-on Windows service (`HomeschoolBoard`,
via NSSM — see `install-service.ps1`) on a home PC. It's no longer the live
deployment (Render is), but it's left installed as a fallback. Its data in
`server/data.json` is a separate, stale copy — not synced with Render.

```powershell
Get-Service HomeschoolBoard          # check status
Restart-Service HomeschoolBoard      # restart it
Stop-Service HomeschoolBoard         # stop it entirely if no longer needed
```

Logs (stdout/stderr from the Node process) go to `service.log` in the
project root.

## Local development

To work on the code with hot-reload instead of the built production bundle:

```bash
npm install
npm run dev
```

This starts the backend on `http://localhost:4000` and the frontend on
`http://localhost:5173` (Vite proxies `/api` and `/ws` to the backend) — use
`http://localhost:5173/` and `http://localhost:5173/admin` while developing.

To rebuild the production bundle the service actually serves after making
changes:

```bash
npm run build
Restart-Service HomeschoolBoard
```

Data persists to `server/data.json` between restarts. Delete that file and
restart the service to reset back to the seeded demo family.
