# Homeschool Board

A wall-mounted assignment board for the kitchen iPad, synced live with a
parent-admin view on mom's iPad.

- `server/` — Express + WebSocket backend. Holds the shared state (students,
  tasks, family board) in `server/data.json` and pushes updates to every
  connected client the moment anything changes.
- `client/` — React + Vite frontend with two routes:
  - `/` — the wall display (clock, student tabs, today/week/month views,
    family board, PIN-gated editing). Meant to run full-screen on the wall
    iPad.
  - `/admin` — the admin view for adding/checking off tasks and family board
    items, sized for a phone/iPad. No PIN — it's mom's own device.

In production the backend also serves the built frontend directly (see
`server/index.js`), so it's one process on one port — no separate dev
servers needed.

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
