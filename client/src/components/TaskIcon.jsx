export default function TaskIcon({ subject, color, background }) {
  let mark;
  switch (subject) {
    case 'Math':
      mark = (
        <>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 14, height: 2, background: color, transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 14, background: color, transform: 'translate(-50%,-50%)' }} />
        </>
      );
      break;
    case 'Reading':
      mark = (
        <>
          <div style={{ position: 'absolute', left: 7, right: 7, top: 8, height: 2, background: color }} />
          <div style={{ position: 'absolute', left: 7, right: 11, top: 14, height: 2, background: color }} />
          <div style={{ position: 'absolute', left: 7, right: 15, top: 20, height: 2, background: color }} />
        </>
      );
      break;
    case 'Science':
      mark = (
        <>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, borderRadius: '50%', background: color, transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, border: `1.5px solid ${color}`, borderRadius: '50%' }} />
        </>
      );
      break;
    case 'Writing':
      mark = <div style={{ position: 'absolute', top: '50%', left: '50%', width: 18, height: 2.5, background: color, transform: 'translate(-50%,-50%) rotate(-45deg)' }} />;
      break;
    case 'Art':
      mark = (
        <>
          <div style={{ position: 'absolute', top: 8, left: 8, width: 5, height: 5, borderRadius: '50%', background: color }} />
          <div style={{ position: 'absolute', top: 8, right: 8, width: 5, height: 5, borderRadius: '50%', background: color }} />
          <div style={{ position: 'absolute', bottom: 8, left: 12, width: 5, height: 5, borderRadius: '50%', background: color }} />
        </>
      );
      break;
    case 'PE':
      mark = (
        <>
          <div style={{ position: 'absolute', top: '50%', left: 6, width: 5, height: 12, background: color, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', right: 6, width: 5, height: 12, background: color, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 10, right: 10, height: 2, background: color, transform: 'translateY(-50%)' }} />
        </>
      );
      break;
    default:
      mark = <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, border: `1.5px solid ${color}` }} />;
  }

  return (
    <div style={{ width: 30, height: 30, flex: 'none', background, position: 'relative' }}>
      {mark}
    </div>
  );
}
