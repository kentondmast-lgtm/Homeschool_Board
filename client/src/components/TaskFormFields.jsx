export default function TaskFormFields({ form, onChange, subjectOptions }) {
  return (
    <>
      <div className="field">
        <label>Subject</label>
        <select className="input" value={form.subject} onChange={(e) => onChange({ subject: e.target.value })}>
          {subjectOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Or add a new subject</label>
        <input
          className="input"
          placeholder="e.g. Spanish"
          value={form.newSubject}
          onChange={(e) => onChange({ newSubject: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Task</label>
        <input
          className="input"
          placeholder="e.g. Spelling worksheet"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Date</label>
          <input className="input" type="date" value={form.date} onChange={(e) => onChange({ date: e.target.value })} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Time</label>
          <input
            className="input"
            placeholder="e.g. 1:00 PM"
            value={form.time}
            onChange={(e) => onChange({ time: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
