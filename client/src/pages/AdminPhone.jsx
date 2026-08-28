import { useEffect, useMemo, useState } from 'react';
import { useSyncedState, addTask, toggleTask, deleteTask, addFamilyItem, toggleFamilyItem, deleteFamilyItem } from '../api.js';
import { SUBJECTS, WEEKDAYS, dateLabel, buildMonthGrid } from '../utils.js';
import AddTaskCard from '../components/AddTaskCard.jsx';
import FamilyBoard from '../components/FamilyBoard.jsx';
import AdminLoginDialog from '../components/AdminLoginDialog.jsx';

export default function AdminPhone() {
  const state = useSyncedState();
  const [activeId, setActiveId] = useState(1);
  const [familyOn, setFamilyOn] = useState({});
  const [view, setView] = useState('today');
  const [now, setNow] = useState(new Date());
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  async function withAuth(action) {
    try {
      await action();
    } catch (e) {
      if (e.isAuthError) {
        setPendingAction(() => action);
        setLoginOpen(true);
      } else {
        throw e;
      }
    }
  }

  const active = state ? (state.students.find((s) => s.id === activeId) || state.students[0]) : null;
  const monthGrid = useMemo(() => (active ? buildMonthGrid(now, active.week) : []), [now, active]);

  if (!state || !active) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
        Connecting…
      </div>
    );
  }

  const subjectOptions = [...SUBJECTS, ...state.customSubjects];
  const assigneeOptions = ['Family', ...state.students.map((s) => s.name)];
  const familyAccent = 'var(--color-accent-700)';
  const today = new Date().toISOString().slice(0, 10);

  const assigneeColorFor = (name) => (state.students.find((s) => s.name === name) || {}).color || familyAccent;
  const familyGroupsForDisplay = state.family.map((g) => ({
    ...g,
    items: g.items.map((it) => ({ ...it, assigneeColor: assigneeColorFor(it.assignee) })),
  }));

  return (
    <div style={{ minHeight: '100vh', maxWidth: 480, margin: '0 auto', background: 'var(--color-bg)', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 18px 12px', borderBottom: '2px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h4 style={{ margin: 0, fontSize: 20, flex: 1 }}>Family Admin</h4>
          <span className="tag tag-accent" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--color-accent-800)" className="sync-dot"><circle cx="12" cy="12" r="10"></circle></svg>
            Synced
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>Changes push to the wall display instantly</div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 6px', overflow: 'auto' }}>
        {state.students.map((s) => (
          <button
            key={s.id}
            style={{
              all: 'unset', cursor: 'pointer', flex: 'none', display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: s.id === activeId ? s.color : 'var(--color-surface)',
              color: s.id === activeId ? 'var(--color-bg)' : 'var(--color-text)', fontSize: 13,
              fontFamily: 'var(--font-heading)', fontWeight: 800,
            }}
            onClick={() => setActiveId(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 8px' }} className="seg">
        {['today', 'week', 'month'].map((v) => (
          <label key={v} className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
            <input type="radio" checked={view === v} onChange={() => setView(v)} />
            {v[0].toUpperCase() + v.slice(1)}
          </label>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {view === 'today' && (
          <>
            <div style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', marginTop: 4 }}>{active.name}'s tasks today</div>

            {active.tasks.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'var(--color-surface)' }}>
                <div
                  onClick={() => toggleTask(active.id, t.id, !t.done)}
                  style={{ width: 18, height: 18, flex: 'none', border: `2px solid ${active.color}`, background: t.done ? active.color : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {t.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3.6"><path d="M4 12l6 6L20 6"></path></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{t.subject} · {dateLabel(t.date)} · {t.time}</div>
                </div>
                <button
                  style={{ all: 'unset', cursor: 'pointer', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}
                  onClick={() => withAuth(() => deleteTask(active.id, t.id))}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
            {active.tasks.length === 0 && (
              <div style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', padding: '8px 4px' }}>No tasks yet today.</div>
            )}

            <AddTaskCard
              studentName={active.name}
              subjectOptions={subjectOptions}
              defaultDate={today}
              onSubmit={(form) => {
                const subject = (form.newSubject || '').trim() || form.subject;
                withAuth(() => addTask(active.id, { subject, title: form.title, time: form.time, date: form.date }));
              }}
            />
          </>
        )}

        {view === 'week' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {active.week.map((d, i) => (
              <div key={d.label} style={{ background: 'var(--color-surface)', padding: 6, display: 'flex', flexDirection: 'column', gap: 4, outline: i === 0 ? `1.5px solid ${active.color}` : 'none' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 9.5, letterSpacing: '.04em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{d.label}</div>
                {d.items.map((it, idx) => (
                  <div key={idx} style={{ fontSize: 9.5, padding: '3px 4px', background: 'var(--color-bg)', color: 'var(--color-text)' }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {view === 'month' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
              {now.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: 'var(--color-divider)' }}>
              {WEEKDAYS.map((wd) => (
                <div key={wd} style={{ background: 'var(--color-bg)', padding: '3px 2px', fontSize: 8, textAlign: 'center', letterSpacing: '.02em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{wd[0]}</div>
              ))}
              {monthGrid.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg)', minHeight: 38, padding: '2px 3px', display: 'flex', flexDirection: 'column', gap: 1,
                    outline: c.isToday ? `1.5px solid ${active.color}` : 'none',
                  }}
                >
                  {!c.blank && (
                    <>
                      <div style={{ fontSize: 8.5, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{c.day}</div>
                      {c.items.slice(0, 1).map((chip, i2) => (
                        <div key={i2} style={{ fontSize: 6.5, padding: '1px 2px', background: active.color, color: 'var(--color-bg)', width: 'fit-content' }}>{chip}</div>
                      ))}
                      {c.items.length > 1 && <div style={{ fontSize: 6.5, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>+{c.items.length - 1}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="hr" style={{ margin: '6px 0' }} />
        <div style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>Family board</div>

        <FamilyBoard
          groups={familyGroupsForDisplay}
          familyOn={familyOn}
          onToggleCategory={(key) => setFamilyOn((f) => ({ ...f, [key]: f[key] === false }))}
          accent={familyAccent}
          editable
          assigneeOptions={assigneeOptions}
          onToggleItem={(key, id, done) => toggleFamilyItem(key, id, done)}
          onDeleteItem={(key, id) => withAuth(() => deleteFamilyItem(key, id))}
          onAddItem={(key, draft) => withAuth(() => addFamilyItem(key, draft))}
        />
      </div>

      {loginOpen && (
        <AdminLoginDialog
          onClose={() => { setLoginOpen(false); setPendingAction(null); }}
          onSuccess={() => {
            setLoginOpen(false);
            if (pendingAction) { pendingAction(); setPendingAction(null); }
          }}
        />
      )}
    </div>
  );
}
