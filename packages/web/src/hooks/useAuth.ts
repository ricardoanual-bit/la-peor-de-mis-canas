import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { User } from '../types';

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getUser = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (session) {
				const { data } = await supabase
					.from('users')
					.select('*')
					.eq('id', session.user.id)
					.single();
				setUser(data);
			}
			setLoading(false);
		};

		getUser();

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (_event, session) => {
				if (session) {
					const { data } = await supabase
						.from('users')
						.select('*')
						.eq('id', session.user.id)
						.single();
					setUser(data);
				} else {
					setUser(null);
				}
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	const signUp = async (email: string, password: string, username: string) => {
		const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (signUpError) throw signUpError;

		const { data, error } = await supabase
			.from('users')
			.insert({
				id: authUser?.id,
				email,
				username,
				tier: 'free',
			})
			.select()
			.single();

		if (error) throw error;
		setUser(data);
		return data;
	};

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		setUser(null);
	};

	return { user, loading, signUp, signIn, signOut };
};
