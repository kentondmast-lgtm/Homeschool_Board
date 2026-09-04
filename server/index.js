import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import { WebSocketServer } from 'ws';
import { seedData } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
// SERVER_PORT wins when explicitly set (used to pin a stable port for local dev,
// independent of any ambient PORT a dev/preview tool may inject); otherwise honor
// the platform-assigned PORT (Render, Railway, Fly.io, etc. all require this).
const PORT = process.env.SERVER_PORT || process.env.PORT || 4000;
const SUBJECTS = ['Math', 'Reading', 'Science', 'Writing', 'Art', 'PE'];

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const authEnabled = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);

if (!authEnabled) {
  console.warn('ADMIN_USERNAME/ADMIN_PASSWORD not set — /admin and editing are open to anyone who can reach this server.');
}

const requireAuth = authEnabled
  ? basicAuth({ users: { [ADMIN_USERNAME]: ADMIN_PASSWORD }, challenge: true, realm: 'Homeschool Board' })
  : (req, res, next) => next();

// Viewing (GET) and marking a task/chore done or undone (PATCH) stay open —
// checking things off is meant to be frictionless for kids on the wall
// display, with no PIN or login at all. Only creating (POST) or deleting
// (DELETE) requires the shared admin login.
function requireAuthForWrites(req, res, next) {
  if (req.method === 'GET' || req.method === 'PATCH') return next();
  return requireAuth(req, res, next);
}

function loadState() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const seeded = seedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

let state = loadState();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', requireAuthForWrites);

// Used by the login dialog to validate credentials before storing them on
// the device — no side effects.
app.get('/api/whoami', requireAuth, (req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast() {
  const payload = JSON.stringify({ type: 'state', payload: state });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}

function persistAndBroadcast() {
  saveState(state);
  broadcast();
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.send(JSON.stringify({ type: 'state', payload: state }));
});

// WiFi routers, NAT, and hosting infrastructure often drop an idle
// connection silently, without ever sending a close frame -- leaving the
// client's WebSocket reporting itself as still "open" while actually dead,
// so it never reconnects on its own. Ping every connection periodically and
// forcibly terminate any that didn't respond since the last ping, so the
// client's own reconnect logic gets a real close event to react to.
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(heartbeatInterval));

app.get('/api/state', (req, res) => {
  res.json(state);
});

app.post('/api/students/:studentId/tasks', (req, res) => {
  const studentId = Number(req.params.studentId);
  const { subject, title, time, date, note } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });

  const student = state.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'student not found' });

  const finalSubject = subject && subject.trim() ? subject.trim() : 'Other';
  const task = {
    id: 't' + Date.now(),
    subject: finalSubject,
    title: title.trim(),
    time: time && time.trim() ? time.trim() : 'Anytime',
    date: date || '',
    note: note || '',
    done: false,
  };
  student.tasks.push(task);

  if (!SUBJECTS.includes(finalSubject) && !state.customSubjects.includes(finalSubject)) {
    state.customSubjects.push(finalSubject);
  }

  persistAndBroadcast();
  res.status(201).json(state);
});

app.patch('/api/students/:studentId/tasks/:taskId', (req, res) => {
  const studentId = Number(req.params.studentId);
  const { taskId } = req.params;
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'student not found' });
  const task = student.tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ error: 'task not found' });

  if (typeof req.body.done === 'boolean') task.done = req.body.done;

  persistAndBroadcast();
  res.json(state);
});

app.delete('/api/students/:studentId/tasks/:taskId', (req, res) => {
  const studentId = Number(req.params.studentId);
  const { taskId } = req.params;
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'student not found' });
  student.tasks = student.tasks.filter((t) => t.id !== taskId);

  persistAndBroadcast();
  res.json(state);
});

app.post('/api/family/:groupKey/items', (req, res) => {
  const { groupKey } = req.params;
  const { text, recurring, assignee } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

  const group = state.family.find((g) => g.key === groupKey);
  if (!group) return res.status(404).json({ error: 'group not found' });

  const item = {
    id: groupKey + Date.now(),
    text: text.trim(),
    recurring: recurring || 'none',
    assignee: assignee || 'Family',
    ...(groupKey === 'chores' ? { done: false } : {}),
  };
  group.items.push(item);

  persistAndBroadcast();
  res.status(201).json(state);
});

app.patch('/api/family/:groupKey/items/:itemId', (req, res) => {
  const { groupKey, itemId } = req.params;
  const group = state.family.find((g) => g.key === groupKey);
  if (!group) return res.status(404).json({ error: 'group not found' });
  const item = group.items.find((it) => it.id === itemId);
  if (!item) return res.status(404).json({ error: 'item not found' });

  if (typeof req.body.done === 'boolean') item.done = req.body.done;

  persistAndBroadcast();
  res.json(state);
});

app.delete('/api/family/:groupKey/items/:itemId', (req, res) => {
  const { groupKey, itemId } = req.params;
  const group = state.family.find((g) => g.key === groupKey);
  if (!group) return res.status(404).json({ error: 'group not found' });
  group.items = group.items.filter((it) => it.id !== req.params.itemId);

  persistAndBroadcast();
  res.json(state);
});

// The /admin page itself loads freely, same as the wall display — it's
// just static HTML/JS with no family data embedded. Login is enforced by
// requireAuthForWrites above (POST/DELETE) and by the app's own in-page
// login dialog once a protected action is attempted, not by gating the
// page load itself.
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Homeschool Board server listening on http://localhost:${PORT}`);
});
