import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

interface AdminUser {
	id: string;
	email: string;
	username: string;
	avatar_url: string | null;
	created_at: string;
}

type AdminAction =
	| { action: 'list' }
	| { action: 'create'; email: string; username: string; avatar_url: string | null; password: string }
	| { action: 'delete'; userId: string };

interface AdminResponse {
	users?: AdminUser[];
}

async function invokeAdmin(action: AdminAction) {
	const { data, error } = await supabase.functions.invoke<AdminResponse>(
		'admin-users',
		{ body: action },
	);

	if (error) throw error;
	if (!data) throw new Error('El servidor no devolvió una respuesta');
	return data;
}

export default function AdminPanel() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [formData, setFormData] = useState({ email: '', username: '', avatar_url: '', password: '' });
	const [submitting, setSubmitting] = useState(false);
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
	const [message, setMessage] = useState('');
	const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
	const [copiedPassword, setCopiedPassword] = useState('');

	useEffect(() => {
		if (user && user.email?.toLowerCase() !== 'ricardo@test.com') {
			navigate('/', { replace: true });
		}
	}, [user, navigate]);

	const loadUsers = async () => {
		try {
			const data = await invokeAdmin({ action: 'list' });
			setUsers(data.users ?? []);
		} catch (error) {
			console.error('Error loading users:', error);
			setMessage(error instanceof Error ? `Error al cargar usuarios: ${error.message}` : 'Error al cargar usuarios');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user?.email?.toLowerCase() === 'ricardo@test.com') {
			// oxlint-disable-next-line react/set-state-in-effect
			void loadUsers();
		}
	}, [user]);

	const generatePassword = () => {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
		const randomValues = crypto.getRandomValues(new Uint8Array(20));
		const password = Array.from(randomValues, (value) => alphabet[value & 63]).join('');
		setFormData((previous) => ({ ...previous, password }));
		setCopiedPassword('');
		setCreatedCredentials(null);
		setMessage('');
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedPassword(text);
		} catch (error) {
			console.error('Error copying password:', error);
			setMessage('❌ No se pudo copiar la contraseña. Revisa los permisos del navegador.');
		}
	};

	const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const email = formData.email.trim();
		const username = formData.username.trim();
		const password = formData.password;
		if (!email || !username || !password) {
			setMessage('Email, username y contraseña son requeridos');
			return;
		}

		setSubmitting(true);
		setMessage('');
		setCreatedCredentials(null);

		try {
			await invokeAdmin({
				action: 'create',
				email,
				username,
				avatar_url: formData.avatar_url.trim() || null,
				password,
			});

			setCreatedCredentials({ email, password });
			setMessage(`✅ Usuario ${username} creado exitosamente. Guarda la contraseña temporal antes de cerrar esta página.`);
			setFormData({ email: '', username: '', avatar_url: '', password: '' });
			setCopiedPassword('');
			await loadUsers();
		} catch (error) {
			setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteUser = async (userId: string, userEmail: string) => {
		if (!window.confirm(`¿Eliminar usuario ${userEmail}?`)) return;

		setDeletingUserId(userId);
		setMessage('');
		try {
			await invokeAdmin({ action: 'delete', userId });
			setMessage('✅ Usuario eliminado');
			await loadUsers();
		} catch (error) {
			setMessage(`❌ Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
		} finally {
			setDeletingUserId(null);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 p-4">
			<div className="max-w-4xl mx-auto">
				<header className="bg-black/40 text-white rounded-lg p-6 mb-6">
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold">⚙️ Panel de Administrador</h1>
						<button
							onClick={() => navigate('/')}
							className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
						>
							Volver
						</button>
					</div>
					<p className="text-orange-100 mt-2">Gestiona usuarios de la aplicación</p>
				</header>

				{message && (
					<div
						role="status"
						className={`p-4 rounded-lg mb-6 text-white font-bold ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`}
					>
						{message}
					</div>
				)}

				{createdCredentials && (
					<div className="p-4 rounded-lg mb-6 bg-green-700 text-white break-all" role="status">
						<p className="font-bold">Credenciales temporales de {createdCredentials.email}</p>
						<div className="mt-2 flex items-center gap-2">
							<code className="font-mono">{createdCredentials.password}</code>
							<button
								type="button"
								onClick={() => void copyToClipboard(createdCredentials.password)}
								className="bg-white/20 hover:bg-white/30 p-2 rounded-lg inline-flex items-center gap-1"
								aria-label="Copiar contraseña temporal"
							>
								{copiedPassword === createdCredentials.password ? <Check size={18} /> : <Copy size={18} />}
								{copiedPassword === createdCredentials.password ? 'Copiada' : 'Copiar'}
							</button>
						</div>
					</div>
				)}

				<section className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
						<Plus size={24} /> Crear nuevo usuario
					</h2>

					<form onSubmit={handleCreateUser} className="space-y-4">
						<div>
							<label htmlFor="admin-email" className="block text-gray-700 font-bold mb-2">Email</label>
							<input
								id="admin-email"
								type="email"
								value={formData.email}
								onChange={(event) => setFormData({ ...formData, email: event.target.value })}
								placeholder="correo@ejemplo.com"
								className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
								disabled={submitting}
								required
							/>
						</div>

						<div>
							<label htmlFor="admin-username" className="block text-gray-700 font-bold mb-2">Username</label>
							<input
								id="admin-username"
								type="text"
								value={formData.username}
								onChange={(event) => setFormData({ ...formData, username: event.target.value })}
								placeholder="nombre de usuario"
								className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
								disabled={submitting}
								required
							/>
						</div>

						<div>
							<label htmlFor="admin-avatar" className="block text-gray-700 font-bold mb-2">Avatar URL (opcional)</label>
							<input
								id="admin-avatar"
								type="url"
								value={formData.avatar_url}
								onChange={(event) => setFormData({ ...formData, avatar_url: event.target.value })}
								placeholder="https://ejemplo.com/avatar.jpg"
								className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
								disabled={submitting}
							/>
						</div>

						<div>
							<label htmlFor="admin-password" className="block text-gray-700 font-bold mb-2">Contraseña temporal</label>
							<div className="flex gap-2">
								<input
									id="admin-password"
									type="text"
									value={formData.password}
									readOnly
									placeholder="Generar contraseña"
									className="flex-1 min-w-0 px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 font-mono"
									disabled={submitting}
								/>
								<button
									type="button"
									onClick={generatePassword}
									disabled={submitting}
									className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold px-4 py-2 rounded-lg"
								>
									Generar
								</button>
								<button
									type="button"
									onClick={() => void copyToClipboard(formData.password)}
									disabled={!formData.password || submitting}
									className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white p-2 rounded-lg"
									aria-label="Copiar contraseña temporal"
								>
									{copiedPassword === formData.password && formData.password ? <Check size={20} /> : <Copy size={20} />}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={submitting}
							className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
						>
							{submitting ? 'Creando...' : 'Crear Usuario'}
						</button>
					</form>
				</section>

				<section className="bg-white rounded-lg shadow-lg p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">Usuarios Registrados ({users.length})</h2>

					{loading ? (
						<p className="text-gray-600">Cargando...</p>
					) : users.length === 0 ? (
						<p className="text-gray-600">No hay usuarios registrados</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-gray-100 border-b-2 border-gray-300">
										<th className="px-4 py-3 text-left font-bold text-gray-700">Username</th>
										<th className="px-4 py-3 text-left font-bold text-gray-700">Email</th>
										<th className="px-4 py-3 text-left font-bold text-gray-700">Creado</th>
										<th className="px-4 py-3 text-center font-bold text-gray-700">Acción</th>
									</tr>
								</thead>
								<tbody>
									{users.map((adminUser) => (
										<tr key={adminUser.id} className="border-b border-gray-200 hover:bg-gray-50">
											<td className="px-4 py-3 font-semibold text-gray-800">{adminUser.username}</td>
											<td className="px-4 py-3 text-gray-700">{adminUser.email}</td>
											<td className="px-4 py-3 text-gray-600 text-sm">
												{new Date(adminUser.created_at).toLocaleDateString('es-CL')}
											</td>
											<td className="px-4 py-3 text-center">
												<button
													onClick={() => void handleDeleteUser(adminUser.id, adminUser.email)}
													disabled={deletingUserId === adminUser.id}
													className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-lg inline-flex items-center gap-1"
												>
													<Trash2 size={18} /> {deletingUserId === adminUser.id ? 'Eliminando...' : 'Eliminar'}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}