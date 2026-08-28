import { useEffect, useMemo, useRef, useState } from 'react';
import { useSyncedState, addTask, toggleTask, deleteTask, addFamilyItem, toggleFamilyItem, deleteFamilyItem } from '../api.js';
import { SUBJECTS, WEEKDAYS, dateLabel, buildMonthGrid, isNightTime } from '../utils.js';
import TaskIcon from '../components/TaskIcon.jsx';
import PinDialog from '../components/PinDialog.jsx';
import AddTaskDialog from '../components/AddTaskDialog.jsx';
import FamilyBoard from '../components/FamilyBoard.jsx';
import AdminLoginDialog from '../components/AdminLoginDialog.jsx';

export default function WallDisplay() {
  const state = useSyncedState();
  const [activeId, setActiveId] = useState(1);
  const [view, setView] = useState('today');
  const [night, setNight] = useState(() => isNightTime(new Date()));
  const [pinOpen, setPinOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [wallAddOpen, setWallAddOpen] = useState(false);
  const [familyOn, setFamilyOn] = useState({});
  const [now, setNow] = useState(new Date());
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const lastNightSlot = useRef(isNightTime(new Date()));

  // Auto-switch at the 20:00/06:00 boundary, but only force it when the
  // scheduled slot actually changes -- so a manual toggle in between still
  // sticks until the next real transition, instead of being fought on
  // every clock tick.
  useEffect(() => {
    const scheduled = isNightTime(now);
    if (scheduled !== lastNightSlot.current) {
      lastNightSlot.current = scheduled;
      setNight(scheduled);
    }
  }, [now]);

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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const active = state ? (state.students.find((s) => s.id === activeId) || state.students[0]) : null;
  const monthGrid = useMemo(() => (active ? buildMonthGrid(now, active.week) : []), [now, active]);

  if (!state || !active) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
        Connecting…
      </div>
    );
  }

  const ink = night ? '#ded9d6' : 'var(--color-text)';
  const muted = night ? 'rgba(222,217,214,.55)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)';
  const screenBg = night ? '#141312' : 'var(--color-bg)';
  const familyBg = night ? '#1a1918' : 'var(--color-surface)';
  const familyAccent = night ? '#ff9783' : 'var(--color-accent-700)';
  const subjectOptions = [...SUBJECTS, ...state.customSubjects];
  const assigneeOptions = ['Family', ...state.students.map((s) => s.name)];

  const assigneeColorFor = (name) => (state.students.find((s) => s.name === name) || {}).color || familyAccent;
  const familyGroupsForDisplay = state.family.map((g) => ({
    ...g,
    items: g.items.map((it) => ({ ...it, assigneeColor: assigneeColorFor(it.assignee) })),
  }));

  return (
    <div style={{ minHeight: '100vh', background: screenBg, fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      {/* top bar: clock + lock */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '22px 28px 14px', borderBottom: '2px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, letterSpacing: '-.01em', color: ink }}>
            {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: 14, color: muted }}>
            {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', padding: '8px 14px', border: '1px solid var(--color-divider)', color: night ? 'var(--color-accent)' : ink }}
            onClick={() => setNight((n) => !n)}
          >
            {night ? '☾ Night · On' : '☾ Night mode'}
          </button>
          <button
            style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', border: `1px solid ${unlocked ? active.color : 'var(--color-divider)'}`, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontWeight: 800, color: unlocked ? active.color : ink }}
            onClick={() => (unlocked ? setUnlocked(false) : setPinOpen(true))}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="4" y="11" width="16" height="9"></rect><path d="M8 11V8a4 4 0 018 0v3"></path></svg>
            {unlocked ? 'Editing unlocked' : 'Locked'}
          </button>
        </div>
      </div>

      {/* student tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '18px 28px 6px' }}>
        {state.students.map((s) => (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setActiveId(s.id)}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20,
              background: s.id === activeId ? s.color : night ? '#2a2826' : 'var(--color-surface)',
              color: s.id === activeId ? 'var(--color-bg)' : ink,
              border: s.id === activeId ? `2.5px solid ${s.color}` : '2.5px solid transparent',
              boxSizing: 'border-box',
            }}>
              {s.name[0]}
            </div>
            <div style={{ fontSize: 12, fontWeight: s.id === activeId ? 800 : 400, color: ink }}>{s.name}</div>
          </div>
        ))}

        <div style={{ marginLeft: 'auto' }} className="seg">
          {['today', 'week', 'month'].map((v) => (
            <label key={v} className="seg-opt">
              <input type="radio" checked={view === v} onChange={() => setView(v)} />
              {v[0].toUpperCase() + v.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div style={{ height: 2, background: 'var(--color-divider)', margin: '10px 28px 0' }} />

      {/* main split: assignments | family board */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1.6, padding: '20px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 22, color: ink }}>{active.name}'s Assignments</h3>
            {unlocked && (
              <button
                style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: active.color, color: 'var(--color-bg)', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase' }}
                onClick={() => setWallAddOpen(true)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"></path></svg>
                Add task
              </button>
            )}
          </div>

          {view === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {active.tasks.map((t) => (
                <div key={t.id} className="task-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--color-surface)', opacity: t.done ? 0.55 : 1 }}>
                  <TaskIcon subject={t.subject} color={active.color} background={night ? '#242220' : 'var(--color-bg)'} />
                  <div
                    onClick={() => toggleTask(active.id, t.id, !t.done)}
                    style={{ width: 22, height: 22, flex: 'none', border: `2px solid ${active.color}`, background: t.done ? active.color : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {t.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3.4"><path d="M4 12l6 6L20 6"></path></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: ink, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: muted }}>{t.subject} · {dateLabel(t.date)} · {t.time}</div>
                    {t.note && <div style={{ fontSize: 11, fontStyle: 'italic', color: muted, marginTop: 2 }}>"{t.note}"</div>}
                  </div>
                  {unlocked && (
                    <button
                      style={{ all: 'unset', cursor: 'pointer', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted }}
                      onClick={() => withAuth(() => deleteTask(active.id, t.id))}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              ))}
              {active.tasks.length === 0 && (
                <div style={{ fontSize: 13, color: muted, padding: '12px 4px' }}>No tasks yet for today.</div>
              )}
            </div>
          )}

          {view === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
              {active.week.map((d, i) => (
                <div key={d.label} style={{ background: 'var(--color-surface)', padding: 10, display: 'flex', flexDirection: 'column', gap: 6, outline: i === 0 ? `1.5px solid ${active.color}` : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: muted }}>{d.label}</div>
                  {d.items.map((it, idx) => (
                    <div key={idx} style={{ fontSize: 11, padding: '4px 6px', background: screenBg, color: ink }}>{it}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {view === 'month' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-heading)', color: muted }}>
                {now.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: 'var(--color-divider)' }}>
                {WEEKDAYS.map((wd) => (
                  <div key={wd} style={{ background: screenBg, padding: 4, fontSize: 9.5, textAlign: 'center', letterSpacing: '.04em', textTransform: 'uppercase', color: muted }}>{wd}</div>
                ))}
                {monthGrid.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: screenBg, minHeight: 58, padding: '4px 5px', display: 'flex', flexDirection: 'column', gap: 2,
                      outline: c.isToday ? `2px solid ${active.color}` : 'none',
                    }}
                  >
                    {!c.blank && (
                      <>
                        <div style={{ fontSize: 10.5, color: muted }}>{c.day}</div>
                        {c.items.slice(0, 2).map((chip, i2) => (
                          <div key={i2} style={{ fontSize: 8.5, padding: '1px 4px', background: active.color, color: 'var(--color-bg)', width: 'fit-content' }}>{chip}</div>
                        ))}
                        {c.items.length > 2 && <div style={{ fontSize: 8.5, color: muted }}>+{c.items.length - 2}</div>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 2, background: 'var(--color-divider)' }} />

        <div style={{ flex: 1, padding: '20px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: familyBg }}>
          <h4 style={{ margin: 0, fontSize: 17, color: ink }}>Family Board</h4>
          <FamilyBoard
            groups={familyGroupsForDisplay}
            familyOn={familyOn}
            onToggleCategory={(key) => setFamilyOn((f) => ({ ...f, [key]: f[key] === false }))}
            accent={familyAccent}
            editable={unlocked}
            assigneeOptions={assigneeOptions}
            onToggleItem={(key, id, done) => toggleFamilyItem(key, id, done)}
            onDeleteItem={(key, id) => withAuth(() => deleteFamilyItem(key, id))}
            onAddItem={(key, draft) => withAuth(() => addFamilyItem(key, draft))}
          />
        </div>
      </div>

      {pinOpen && (
        <PinDialog onClose={() => setPinOpen(false)} onUnlock={() => { setUnlocked(true); setPinOpen(false); }} />
      )}

      {wallAddOpen && (
        <AddTaskDialog
          studentName={active.name}
          subjectOptions={subjectOptions}
          defaultDate={now.toISOString().slice(0, 10)}
          onCancel={() => setWallAddOpen(false)}
          onSubmit={(form) => {
            const subject = (form.newSubject || '').trim() || form.subject;
            withAuth(() => addTask(active.id, { subject, title: form.title, time: form.time, date: form.date }));
            setWallAddOpen(false);
          }}
        />
      )}

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
