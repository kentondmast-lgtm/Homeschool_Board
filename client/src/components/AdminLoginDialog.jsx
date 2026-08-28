import { useState } from 'react';
import { storeCredentials, verifyCredentials } from '../auth.js';

export default function AdminLoginDialog({ onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit() {
    setChecking(true);
    const ok = await verifyCredentials(username, password).catch(() => false);
    setChecking(false);
    if (ok) {
      storeCredentials(username, password);
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog-title">Admin login</div>
        <div className="dialog-body">
          Enter the family admin login to make this change. This device will
          remember it, so you shouldn't need to enter it again here.
        </div>
        <div className="field">
          <label>Username</label>
          <input className="input" value={username} onChange={(e) => { setUsername(e.target.value); setError(false); }} autoFocus />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          />
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>Incorrect username or password.</div>}
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={checking || !username || !password}>
            {checking ? 'Checking…' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
