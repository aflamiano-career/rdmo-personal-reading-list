import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Landing from './pages/Landing/Landing';
import AppLayout from './pages/AppLayout/AppLayout';
import Library from './pages/Library/Library';
import Search from './pages/Search/Search';
import Goals from './pages/Goals/Goals';
import Stats from './pages/Stats/Stats';

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.initialized) return null;
  if (!state.isGuest && !state.user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/library" replace />} />
        <Route path="library" element={<Library />} />
        <Route path="search" element={<Search />} />
        <Route path="goals" element={<Goals />} />
        <Route path="stats" element={<Stats />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
