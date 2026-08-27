import { useState } from 'react';
import TaskFormFields from './TaskFormFields.jsx';

function blankForm(subjectOptions, defaultDate) {
  return { subject: subjectOptions[0] || 'Math', newSubject: '', title: '', time: '', date: defaultDate };
}

export default function AddTaskDialog({ studentName, subjectOptions, defaultDate, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => blankForm(subjectOptions, defaultDate));
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  function submit() {
    if (!form.title.trim()) return;
    onSubmit(form);
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog-title">Add task for {studentName}</div>
        <TaskFormFields form={form} onChange={patch} subjectOptions={subjectOptions} />
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Add task</button>
        </div>
      </div>
    </div>
  );
}
