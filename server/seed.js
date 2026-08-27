function weekFor(mon, tue, wed, thu, fri) {
  return [
    { label: 'Mon', items: mon },
    { label: 'Tue', items: tue },
    { label: 'Wed', items: wed },
    { label: 'Thu', items: thu },
    { label: 'Fri', items: fri },
  ];
}

export function seedData() {
  return {
    students: [
      {
        id: 1, name: 'Kyna', age: 10, color: '#ec3013',
        tasks: [
          { id: 't1', subject: 'Math', title: 'Fractions worksheet pg. 12', time: '9:00 AM', date: '', done: false, note: 'Show your work' },
          { id: 't2', subject: 'Reading', title: 'Chapter 4 — Little House', time: '9:30 AM', date: '', done: true, note: '' },
          { id: 't3', subject: 'Science', title: 'Plant cell diagram', time: '10:15 AM', date: '', done: false, note: '' },
          { id: 't4', subject: 'Writing', title: 'Journal entry', time: '11:00 AM', date: '', done: false, note: '' },
        ],
        week: weekFor(['Math', 'Reading'], ['Science', 'Writing'], ['Math', 'Art'], ['Reading', 'PE'], ['Math', 'Science']),
      },
      {
        id: 2, name: 'Maverick', age: 8, color: '#2f6fb0',
        tasks: [
          { id: 't1', subject: 'Math', title: 'Addition flashcards', time: '9:00 AM', date: '', done: false, note: '' },
          { id: 't2', subject: 'Reading', title: 'Read aloud — 20 min', time: '9:30 AM', date: '', done: false, note: '' },
          { id: 't3', subject: 'Art', title: 'Draw a family portrait', time: '10:30 AM', date: '', done: false, note: 'Use the colored pencils' },
          { id: 't4', subject: 'PE', title: 'Backyard obstacle course', time: '1:00 PM', date: '', done: false, note: '' },
        ],
        week: weekFor(['Math', 'Reading'], ['Art', 'PE'], ['Math', 'Reading'], ['Science', 'PE'], ['Math', 'Art']),
      },
      {
        id: 3, name: 'Megan', age: 6, color: '#c9862a',
        tasks: [
          { id: 't1', subject: 'Reading', title: 'Sight words practice', time: '9:15 AM', date: '', done: true, note: '' },
          { id: 't2', subject: 'Math', title: 'Counting to 50', time: '9:45 AM', date: '', done: false, note: '' },
          { id: 't3', subject: 'Art', title: 'Color the alphabet sheet', time: '10:30 AM', date: '', done: false, note: '' },
        ],
        week: weekFor(['Reading', 'Math'], ['Art'], ['Reading', 'Math'], ['Art'], ['Reading', 'PE']),
      },
      {
        id: 4, name: 'Barrett', age: 3, color: '#3f8a5c',
        tasks: [
          { id: 't1', subject: 'Other', title: 'Story time', time: '9:30 AM', date: '', done: false, note: '' },
          { id: 't2', subject: 'Art', title: 'Coloring page', time: '10:00 AM', date: '', done: false, note: '' },
          { id: 't3', subject: 'Other', title: 'Puzzle time', time: '10:30 AM', date: '', done: false, note: '' },
        ],
        week: weekFor(['Story', 'Puzzle'], ['Coloring'], ['Story', 'Blocks'], ['Puzzle'], ['Coloring', 'Story']),
      },
    ],
    family: [
      {
        key: 'chores', label: 'Chores', items: [
          { id: 'c1', text: 'Kyna — set the table', done: false, recurring: 'none', assignee: 'Kyna' },
          { id: 'c2', text: 'Maverick — feed the dog', done: false, recurring: 'none', assignee: 'Maverick' },
          { id: 'c3', text: 'Megan — put away shoes', done: true, recurring: 'none', assignee: 'Megan' },
        ],
      },
      {
        key: 'events', label: 'Family Events', items: [
          { id: 'e1', text: 'Piano lessons — 3:30 PM', recurring: 'none', assignee: 'Family' },
          { id: 'e2', text: 'Co-op group — Friday', recurring: 'none', assignee: 'Family' },
        ],
      },
      {
        key: 'meals', label: 'Meals', items: [
          { id: 'm1', text: 'Lunch: grilled cheese & soup', recurring: 'none', assignee: 'Family' },
          { id: 'm2', text: 'Dinner: tacos', recurring: 'none', assignee: 'Family' },
        ],
      },
      {
        key: 'reminders', label: 'Reminders', items: [
          { id: 'r1', text: 'Library books due Friday', recurring: 'none', assignee: 'Family' },
          { id: 'r2', text: 'Dentist — Tuesday 2:00 PM', recurring: 'none', assignee: 'Family' },
        ],
      },
    ],
    customSubjects: [],
  };
}
