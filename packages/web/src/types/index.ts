export type UserTier = 'free' | 'pro' | 'teams';
export type UserRole = 'owner' | 'admin' | 'member';
export type GameStatus = 'active' | 'finished';
export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export interface User {
	id: string;
	email: string;
	username?: string;
	avatar_url?: string;
	tier: UserTier;
	stripe_customer_id?: string;
	created_at: string;
}

export interface Game {
	id: string;
	created_by: string;
	group_id?: string;
	name?: string;
	status: GameStatus;
	max_players?: number;
	created_at: string;
}

export interface GenericQuestion {
	id: string;
	category: string;
	question: string;
	difficulty: string;
	status: QuestionStatus;
	created_at: string;
}
