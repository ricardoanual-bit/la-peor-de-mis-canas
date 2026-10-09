import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});

Deno.serve(async (request: Request) => {
	if (request.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}
	if (request.method !== 'POST') {
		return jsonResponse({ error: 'Método no permitido' }, 405);
	}

	const authorization = request.headers.get('Authorization');
	const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
	if (!token) return jsonResponse({ error: 'Autenticación requerida' }, 401);

	const supabaseUrl = Deno.env.get('SUPABASE_URL');
	const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
	const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
	const adminEmail = Deno.env.get('ADMIN_EMAIL')?.trim().toLowerCase();

	if (!supabaseUrl || !anonKey || !serviceRoleKey || !adminEmail) {
		console.error('Missing required Supabase admin function environment variables');
		return jsonResponse({ error: 'La función de administración no está configurada' }, 500);
	}

	const authClient = createClient(supabaseUrl, anonKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	const { data: authData, error: authError } = await authClient.auth.getUser(token);
	if (authError || !authData.user) {
		return jsonResponse({ error: 'Sesión inválida o expirada' }, 401);
	}
	if (authData.user.email?.toLowerCase() !== adminEmail) {
		return jsonResponse({ error: 'No autorizado' }, 403);
	}

	const adminClient = createClient(supabaseUrl, serviceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});

	try {
		const body = await request.json();

		if (body?.action === 'list') {
			const { data, error } = await adminClient
				.from('users')
				.select('id, email, username, avatar_url, created_at')
				.order('created_at', { ascending: false });
			if (error) throw error;
			return jsonResponse({ users: data ?? [] });
		}

		if (body?.action === 'create') {
			if (
				typeof body.email !== 'string'
				|| typeof body.username !== 'string'
				|| !body.email.trim()
				|| !body.username.trim()
				|| (body.avatar_url !== null && typeof body.avatar_url !== 'string')
			) {
				return jsonResponse({ error: 'Email y username son requeridos' }, 400);
			}

			const email = body.email.trim();
			const username = body.username.trim();
			const avatarUrl = typeof body.avatar_url === 'string' ? body.avatar_url.trim() || null : null;
			if (avatarUrl) {
				try {
					const parsedAvatarUrl = new URL(avatarUrl);
					if (parsedAvatarUrl.protocol !== 'https:' && parsedAvatarUrl.protocol !== 'http:') {
						throw new Error('Invalid URL protocol');
					}
				} catch {
					return jsonResponse({ error: 'La URL del avatar no es válida' }, 400);
				}
			}

			const { data: createdAuth, error: createAuthError } = await adminClient.auth.admin.createUser({
				email,
				password: crypto.randomUUID(),
				email_confirm: true,
			});
			if (createAuthError) throw createAuthError;
			if (!createdAuth.user) throw new Error('Supabase no devolvió el usuario creado');

			const { error: insertUserError } = await adminClient.from('users').insert({
				id: createdAuth.user.id,
				email,
				username,
				avatar_url: avatarUrl,
				tier: 'free',
			});

			if (insertUserError) {
				const { error: rollbackError } = await adminClient.auth.admin.deleteUser(createdAuth.user.id);
				if (rollbackError) {
					console.error('Could not remove Auth user after profile creation failed:', rollbackError);
				}
				throw insertUserError;
			}

			return jsonResponse({ success: true, id: createdAuth.user.id });
		}

		if (body?.action === 'delete') {
			if (typeof body.userId !== 'string' || !body.userId.trim()) {
				return jsonResponse({ error: 'El identificador de usuario no es válido' }, 400);
			}
			if (body.userId === authData.user.id) {
				return jsonResponse({ error: 'No puedes eliminar tu propia cuenta de administrador' }, 400);
			}

			const { data: targetAuth, error: targetAuthError } = await adminClient.auth.admin.getUserById(body.userId);
			if (targetAuthError) throw targetAuthError;
			if (!targetAuth.user) return jsonResponse({ error: 'Usuario no encontrado' }, 404);
			if (targetAuth.user.email?.toLowerCase() === adminEmail) {
				return jsonResponse({ error: 'No se puede eliminar la cuenta administradora' }, 400);
			}

			const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(body.userId);
			if (deleteAuthError) throw deleteAuthError;

			const { error: deleteProfileError } = await adminClient.from('users').delete().eq('id', body.userId);
			if (deleteProfileError) throw deleteProfileError;
			return jsonResponse({ success: true });
		}

		return jsonResponse({ error: 'Acción no válida' }, 400);
	} catch (error) {
		console.error('Admin user operation failed:', error);
		const message = error instanceof Error ? error.message : 'Error desconocido';
		return jsonResponse({ error: message }, 500);
	}
});
