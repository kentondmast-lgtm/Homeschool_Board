import { Routes, Route, Navigate } from 'react-router-dom';
import WallDisplay from './pages/WallDisplay.jsx';
import AdminPhone from './pages/AdminPhone.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WallDisplay />} />
      <Route path="/admin" element={<AdminPhone />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
