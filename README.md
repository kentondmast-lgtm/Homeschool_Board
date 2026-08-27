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

## Current deployment

Right now this runs as an always-on Windows service (`HomeschoolBoard`,
installed via NSSM — see `install-service.ps1`) on this PC, so it survives
reboots and doesn't need anyone logged in. This is meant as a **temporary
home**: since all app state lives in `server/data.json` and there's nothing
Windows-specific in the code, moving it later to a Raspberry Pi or NAS is
just: copy the project folder over, run `npm install && npm run build`, and
set up the equivalent auto-start mechanism there (systemd on a Pi, a Docker
container on a NAS) instead of the NSSM service.

**iPad URLs** (this PC's current LAN IP — see note below):

- Wall display: `http://192.168.1.24:4000/`
- Admin: `http://192.168.1.24:4000/admin`

The parent PIN on the wall display is `1234`.

> **This IP can change.** It's assigned by your router via DHCP, not fixed.
> If either iPad stops connecting, re-run this on the host PC to get the
> current IP and update the two bookmarks:
> ```powershell
> Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' }
> ```
> To stop this from happening, set a DHCP reservation for this PC in your
> router's admin page (pin its MAC address to `192.168.1.24` permanently).

### Setting up the wall iPad

1. Open Safari to the wall display URL above.
2. Plug the iPad in and disable auto-lock: **Settings → Display & Brightness
   → Auto-Lock → Never**.
3. Turn on **Guided Access** so it can't be swiped away from the board:
   **Settings → Accessibility → Guided Access → On**, set a passcode there
   (this is separate from the board's own `1234` PIN). Then triple-click the
   side/home button while Safari is open on the board to start Guided Access.

### Setting up mom's iPad

1. Open Safari to the admin URL above.
2. Tap **Share → Add to Home Screen**. It'll launch full-screen without
   Safari's address bar, like a regular app.

## Deploying to the cloud (Render)

This makes the board reachable from anywhere (not just your home WiFi) and
removes the "laptop has to stay on and keep the same IP" problem entirely.
The steps below need your own GitHub and Render accounts — I can't create
accounts, sign up for a paid plan, or push to a repo you own on your behalf,
so those specific steps are on you; everything else (the code, the config)
is already done.

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
automatically. `server/data.json` on your local Windows service and the
Render disk are two separate copies of the data; they don't sync with each
other, so pick one as the real deployment and treat the other as retired.

## Managing the service (on the host PC)

```powershell
Get-Service HomeschoolBoard          # check status
Restart-Service HomeschoolBoard      # restart it
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
