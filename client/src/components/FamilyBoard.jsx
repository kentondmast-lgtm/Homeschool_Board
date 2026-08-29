import { useState } from 'react';
import { RECUR_OPTIONS, recurLabel } from '../utils.js';

function blankDraft() {
  return { text: '', recurring: 'none', assignee: 'Family' };
}

export default function FamilyBoard({
  groups, familyOn, onToggleCategory, accent, editable,
  assigneeOptions, onToggleItem, onDeleteItem, onAddItem,
  textColor = 'var(--color-text)',
}) {
  const [drafts, setDrafts] = useState({});
  const draftFor = (key) => drafts[key] || blankDraft();
  const patchDraft = (key, patch) => setDrafts((d) => ({ ...d, [key]: { ...draftFor(key), ...patch } }));

  const visibleGroups = groups.filter((g) => familyOn[g.key] !== false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {editable && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {groups.map((g) => {
            const on = familyOn[g.key] !== false;
            return (
              <button
                key={g.key}
                style={{
                  all: 'unset', cursor: 'pointer', padding: '4px 9px', fontSize: 10.5,
                  border: `1px solid ${accent}`, background: on ? accent : 'transparent',
                  color: on ? 'var(--color-bg)' : textColor,
                }}
                onClick={() => onToggleCategory(g.key)}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      )}

      {visibleGroups.map((g) => {
        const draft = draftFor(g.key);
        return (
          <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: accent, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              {g.label}
            </div>

            {g.items.map((it) => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                {it.done !== undefined && (
                  <div
                    onClick={() => onToggleItem(g.key, it.id, !it.done)}
                    style={{ width: 15, height: 15, flex: 'none', border: `1.6px solid ${accent}`, background: it.done ? accent : 'transparent', cursor: 'pointer' }}
                  />
                )}
                <div style={{ flex: 1, color: textColor, textDecoration: it.done ? 'line-through' : 'none' }}>{it.text}</div>
                <div style={{ fontSize: 9.5, padding: '2px 6px', background: it.assigneeColor, color: 'var(--color-bg)' }}>{it.assignee || 'Family'}</div>
                {recurLabel(it.recurring) && (
                  <div style={{ fontSize: 9.5, color: accent }}>{recurLabel(it.recurring)}</div>
                )}
                {editable && (
                  <button
                    style={{ all: 'unset', cursor: 'pointer', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: `color-mix(in srgb, ${textColor} 45%, transparent)` }}
                    onClick={() => onDeleteItem(g.key, it.id)}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}

            {editable && (
              <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                <input
                  className="input"
                  style={{ minHeight: 26, fontSize: 11.5, padding: '4px 8px', flex: 1 }}
                  placeholder="Add item…"
                  value={draft.text}
                  onChange={(e) => patchDraft(g.key, { text: e.target.value })}
                />
                <select
                  className="input"
                  style={{ minHeight: 26, fontSize: 10.5, padding: '2px 6px', flex: 'none', width: 88 }}
                  value={draft.assignee}
                  onChange={(e) => patchDraft(g.key, { assignee: e.target.value })}
                >
                  {assigneeOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <select
                  className="input"
                  style={{ minHeight: 26, fontSize: 10.5, padding: '2px 6px', flex: 'none', width: 98 }}
                  value={draft.recurring}
                  onChange={(e) => patchDraft(g.key, { recurring: e.target.value })}
                >
                  {RECUR_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <button
                  style={{ all: 'unset', cursor: 'pointer', flex: 'none', padding: '4px 10px', background: accent, color: 'var(--color-bg)', fontSize: 11 }}
                  onClick={() => {
                    if (!draft.text.trim()) return;
                    onAddItem(g.key, draft);
                    patchDraft(g.key, blankDraft());
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
