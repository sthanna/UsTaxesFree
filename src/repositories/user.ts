import pool, { query } from '../database/connection';
import { QueryResult } from 'pg';

export interface User {
    id: number;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    role: 'USER' | 'ADMIN';
    created_at: Date;
    updated_at: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'created_at' | 'updated_at'>;

export class UserRepository {
    static async create(user: CreateUserDTO): Promise<User> {
        const text = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [user.email, user.password_hash, user.first_name, user.last_name, user.role];
        const result: QueryResult<User> = await query(text, values);
        return result.rows[0];
    }

    static async findByEmail(email: string): Promise<User | null> {
        const text = `SELECT * FROM users WHERE email = $1`;
        const result: QueryResult<User> = await query(text, [email]);
        return result.rows[0] || null;
    }

    static async findById(id: number): Promise<User | null> {
        const text = `SELECT * FROM users WHERE id = $1`;
        const result: QueryResult<User> = await query(text, [id]);
        return result.rows[0] || null;
    }
}
