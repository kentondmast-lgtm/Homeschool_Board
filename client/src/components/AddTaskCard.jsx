import { useState } from 'react';
import TaskFormFields from './TaskFormFields.jsx';

function blankForm(subjectOptions, defaultDate) {
  return { subject: subjectOptions[0] || 'Math', newSubject: '', title: '', time: '', date: defaultDate };
}

export default function AddTaskCard({ studentName, subjectOptions, defaultDate, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => blankForm(subjectOptions, defaultDate));
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  if (!open) {
    return (
      <button
        className="btn btn-secondary btn-block"
        onClick={() => { setForm(blankForm(subjectOptions, defaultDate)); setOpen(true); }}
      >
        + Add task for {studentName}
      </button>
    );
  }

  function submit() {
    if (!form.title.trim()) return;
    onSubmit(form);
    setOpen(false);
  }

  return (
    <div className="card elev-sm" style={{ gap: 8 }}>
      <TaskFormFields form={form} onChange={patch} subjectOptions={subjectOptions} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Add</button>
      </div>
    </div>
  );
}
