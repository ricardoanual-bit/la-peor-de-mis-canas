import { Plus, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardScreen() {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold">La peor de mis cañas 🍻</h1>
						<p className="text-orange-100">Bienvenido, {user?.username}</p>
					</div>
					<div className="flex items-center gap-2">
						{user?.email?.toLowerCase() === 'ricardo@test.com' && (
							<button
								onClick={() => navigate('/admin')}
								className="bg-black/30 hover:bg-black/40 px-4 py-2 rounded-lg font-semibold"
							>
								Administrar usuarios
							</button>
						)}
						<button
							onClick={handleSignOut}
							className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg flex items-center gap-2"
						>
							<LogOut size={18} /> Salir
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto p-4">
				<div className="grid grid-cols-2 gap-4 mb-6">
					<button onClick={() => navigate('/create-game')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition">
						<Plus size={24} /> Nuevo juego
					</button>
					<button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition">
						<Users size={24} /> Unirme
					</button>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">
						Bienvenido a La peor de mis cañas
					</h2>
					<p className="text-gray-600">
						Estamos listos para empezar. ¡Crea tu primer juego!
					</p>
					<p className="text-sm text-gray-500 mt-4">
						Tu plan: <span className="font-bold capitalize">{user?.tier}</span>
					</p>
				</div>
			</div>
		</div>
	);
}
