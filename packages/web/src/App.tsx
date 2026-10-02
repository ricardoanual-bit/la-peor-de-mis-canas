import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingScreen from './screens/LandingScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateGameScreen from './screens/CreateGameScreen';
import GameScreen from './screens/GameScreen';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍻</div>
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/create-game" element={<CreateGameScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
