import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateGameScreen from './screens/CreateGameScreen';
import GameScreen from './screens/GameScreen';
import AdminPanel from './screens/AdminPanel';

function LoginRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginScreen mode="login" onBack={() => navigate('/')} />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-amber-600">
        <p className="text-white text-2xl font-bold">Cargando...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <DashboardScreen /> : <LandingScreen />} />
        <Route path="/login" element={<LoginRoute isAuthenticated={Boolean(user)} />} />
        <Route path="/create-game" element={user ? <CreateGameScreen /> : <Navigate to="/login" replace />} />
        <Route path="/game" element={user ? <GameScreen /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
