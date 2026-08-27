import { useState } from 'react';

export default function PinDialog({ onClose, onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function submit() {
    if (pin === '1234') onUnlock();
    else setError(true);
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog-title">Unlock editing</div>
        <div className="dialog-body">Enter the parent PIN to edit assignments on the wall display.</div>
        <div className="field">
          <label>PIN (hint: 1234)</label>
          <input
            className="input"
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            autoFocus
          />
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>Incorrect PIN — try 1234.</div>}
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Unlock</button>
        </div>
      </div>
    </div>
  );
}
